using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace DigiTalent.Tests.Pulse;

/// <summary>Đồng hồ điều khiển được để tua qua thời gian chờ / hạn nộp lại.</summary>
internal sealed class ManualClock : TimeProvider
{
    public DateTimeOffset Now { get; set; } = new(2026, 10, 14, 8, 0, 0, TimeSpan.Zero);

    public override DateTimeOffset GetUtcNow() => Now;

    public void Advance(TimeSpan by) => Now = Now.Add(by);
}

/// <summary>
/// Dữ liệu Development thật (DbSeeder: TT02 + nội dung khóa + PulseContentSeeder) trên EF InMemory.
/// employee@ là Kế toán (mục tiêu: 3/3/2/3/2/2), thuộc phòng OPS do manager@ quản lý.
/// </summary>
internal sealed class PulseTestWorld : IDisposable
{
    public const string EmployeeEmail = "employee@digitalent.ai";
    public const string ManagerEmail = "manager@digitalent.ai";
    public const string OwnerEmail = "owner@digitalent.ai";

    public required AppDbContext Context { get; init; }
    public ManualClock Clock { get; } = new();

    public static async Task<PulseTestWorld> CreateAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"pulse-{Guid.NewGuid():N}")
            .Options);
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        await DbSeeder.SeedAsync(context, hasher.Object);
        context.ChangeTracker.Clear();
        return new PulseTestWorld { Context = context };
    }

    public Task<User> UserAsync(string email) => Context.Users.AsNoTracking().SingleAsync(u => u.Email == email);

    public async Task<Employee> EmployeeAsync(string email)
    {
        var user = await UserAsync(email);
        return await Context.Employees.AsNoTracking().SingleAsync(e => e.UserId == user.Id);
    }

    /// <summary>Use case Pulse dựng như DI, đăng nhập bằng <paramref name="email"/> với vai trò <paramref name="role"/>.</summary>
    public async Task<UseCases> AsAsync(string email, string role = Roles.Employee, Guid? departmentOverride = null)
    {
        var user = await UserAsync(email);
        var employee = await Context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == user.Id);
        var current = new Mock<ICurrentUser>();
        current.Setup(c => c.GetRequiredOrganizationId()).Returns(user.OrganizationId!.Value);
        current.Setup(c => c.OrganizationId).Returns(user.OrganizationId);
        current.Setup(c => c.UserId).Returns(user.Id);
        current.Setup(c => c.EmployeeId).Returns(employee?.Id);
        current.Setup(c => c.DepartmentId).Returns(departmentOverride ?? employee?.DepartmentId);
        current.Setup(c => c.IsAuthenticated).Returns(true);
        current.Setup(c => c.IsAdmin).Returns(role == Roles.Owner);
        current.Setup(c => c.IsDepartmentManager).Returns(role == Roles.Manager);
        current.Setup(c => c.Roles).Returns(new List<string> { role });

        var me = new MyEmployeeContext(Context, current.Object);
        var modules = new PulseModuleReader(Context);
        var learner = new PulseLearnerReader(Context, me, modules, Clock);
        var policy = new PulseRetryPolicyProvider(Context, NullLogger<PulseRetryPolicyProvider>.Instance);
        var baseline = new PulseBaselineReader(Context);
        var workspace = new PulseCourseWorkspace(Context, learner);
        var quiz = new PulseQuizReader(Context);
        var final = new PulseFinalReader(Context);
        var outcomes = new PulseOutcomeReader(Context);
        var scope = new PulseReviewScope(Context, new EmployeeScope(Context, current.Object), current.Object);

        return new UseCases(
            new GetPulseOverviewUseCase(learner),
            new GetPulseBaselineUseCase(learner, baseline),
            new SubmitPulseBaselineUseCase(Context, learner, baseline),
            new GetPulseCourseUseCase(Context, workspace),
            new GetPulseModuleUseCase(workspace, quiz),
            new MarkPulseModuleViewedUseCase(Context, workspace),
            new SubmitPulseModuleQuizUseCase(Context, workspace, quiz),
            new GetPulseFinalUseCase(workspace, final, policy),
            new SubmitPulseFinalUseCase(Context, workspace),
            new GetPulsePracticeUseCase(learner),
            new GetPulseOutcomesUseCase(learner, outcomes),
            new GetPulseOutcomeUseCase(learner, outcomes),
            new GetPulseFinalReviewsUseCase(Context, scope, learner, final, current.Object),
            new DecidePulseFinalUseCase(Context, scope, policy, Mock.Of<IAuditService>(), Clock),
            new RecordPulseFinalSupportUseCase(Context, scope, Clock));
    }

    /// <summary>Đáp án đúng của một câu (test đọc thẳng DB — API không bao giờ trả đáp án).</summary>
    public Task<Guid> CorrectOptionAsync(Guid questionId) =>
        Context.QuestionOptions.AsNoTracking().Where(o => o.QuestionId == questionId && o.IsCorrect).Select(o => o.Id).FirstAsync();

    public Task<Guid> WrongOptionAsync(Guid questionId) =>
        Context.QuestionOptions.AsNoTracking().Where(o => o.QuestionId == questionId && !o.IsCorrect).Select(o => o.Id).FirstAsync();

    /// <summary>Làm bài đầu vào: <paramref name="levelsByDomain"/>[số lĩnh vực] = số mức đầu trả lời đúng liên tiếp.</summary>
    public async Task SubmitBaselineAsync(UseCases uc, IReadOnlyDictionary<int, int> levelsByDomain)
    {
        var baseline = await uc.GetBaseline.ExecuteAsync(new GetPulseBaselineUseCaseInput());
        var answers = new List<PulseAnswerInput>();
        foreach (var domain in baseline.Domains)
        {
            var correctUpTo = levelsByDomain.GetValueOrDefault(domain.Number);
            foreach (var question in domain.Questions)
            {
                var optionId = question.Level <= correctUpTo
                    ? await CorrectOptionAsync(question.QuestionId)
                    : await WrongOptionAsync(question.QuestionId);
                answers.Add(new PulseAnswerInput { QuestionId = question.QuestionId, OptionId = optionId });
            }
        }

        await uc.SubmitBaseline.ExecuteAsync(new SubmitPulseBaselineUseCaseInput { Answers = answers });
        Context.ChangeTracker.Clear();
    }

    /// <summary>Đọc hết trang và trả lời đúng câu ôn tập của mọi mô đun của khóa.</summary>
    public async Task PassAllModulesAsync(UseCases uc, Guid courseId)
    {
        var course = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = courseId });
        foreach (var module in course.Modules)
        {
            await PassModuleAsync(uc, courseId, module.ModuleId);
        }
    }

    public async Task<SubmitPulseModuleQuizUseCaseOutput> PassModuleAsync(UseCases uc, Guid courseId, Guid moduleId)
    {
        await uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = courseId, ModuleId = moduleId });
        Context.ChangeTracker.Clear();
        var module = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = courseId, ModuleId = moduleId });
        var answers = new List<PulseAnswerInput>();
        foreach (var question in module.Quiz!.Questions)
        {
            answers.Add(new PulseAnswerInput { QuestionId = question.QuestionId, OptionId = await CorrectOptionAsync(question.QuestionId) });
        }

        var result = await uc.SubmitQuiz.ExecuteAsync(new SubmitPulseModuleQuizUseCaseInput { CourseId = courseId, ModuleId = moduleId, Answers = answers });
        Context.ChangeTracker.Clear();
        return result;
    }

    public async Task<PulseCourseSummaryDto> CourseAsync(UseCases uc, string code)
    {
        var overview = await uc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        return overview.Courses.Single(c => c.Code == code);
    }

    public sealed record UseCases(
        GetPulseOverviewUseCase Overview,
        GetPulseBaselineUseCase GetBaseline,
        SubmitPulseBaselineUseCase SubmitBaseline,
        GetPulseCourseUseCase GetCourse,
        GetPulseModuleUseCase GetModule,
        MarkPulseModuleViewedUseCase MarkViewed,
        SubmitPulseModuleQuizUseCase SubmitQuiz,
        GetPulseFinalUseCase GetFinal,
        SubmitPulseFinalUseCase SubmitFinal,
        GetPulsePracticeUseCase Practice,
        GetPulseOutcomesUseCase Outcomes,
        GetPulseOutcomeUseCase Outcome,
        GetPulseFinalReviewsUseCase Reviews,
        DecidePulseFinalUseCase Decide,
        RecordPulseFinalSupportUseCase Support);

    public void Dispose() => Context.Dispose();
}
