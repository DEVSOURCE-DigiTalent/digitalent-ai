using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
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

/// <summary>Kho tệp trong bộ nhớ: ghi hình bài làm được tải lên từng mẩu và ghép vào cuối tệp.</summary>
internal sealed class MemoryFileStorage : IFileStorageService
{
    public Dictionary<string, MemoryStream> Files { get; } = new();

    public async Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default)
    {
        var path = $"{folder}/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";
        var file = new MemoryStream();
        await content.CopyToAsync(file, cancellationToken);
        Files[path] = file;
        return path;
    }

    public async Task AppendAsync(string storagePath, Stream content, CancellationToken cancellationToken = default)
    {
        var file = Files.TryGetValue(storagePath, out var existing) ? existing : throw new NotFoundException(storagePath);
        file.Seek(0, SeekOrigin.End);
        await content.CopyToAsync(file, cancellationToken);
    }

    public Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default) =>
        Task.FromResult<Stream>(new MemoryStream(Files[storagePath].ToArray()));

    public Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default) => Task.FromResult(Files.Remove(storagePath));

    public Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default) =>
        Task.FromResult($"/files/{storagePath}");
}

/// <summary>
/// Dữ liệu Development thật (DbSeeder: TT02 + nội dung khóa + PulseContentSeeder) trên EF InMemory.
/// employee@ là Kế toán (mục tiêu: 3/3/2/3/2/2), thuộc phòng OPS do manager@ quản lý; đã có A2-F hoàn thành (luồng cũ),
/// A1-I và A4-I được giao (suất học).
/// </summary>
internal sealed class PulseTestWorld : IDisposable
{
    public const string EmployeeEmail = "employee@digitalent.ai";
    public const string ManagerEmail = "manager@digitalent.ai";
    public const string OwnerEmail = "owner@digitalent.ai";

    public const string Evidence = "Nguồn: sổ cái tháng 9. Tôi đối chiếu từng tổng số với báo cáo gốc và kết luận bước tiếp theo.";

    public required AppDbContext Context { get; init; }
    public ManualClock Clock { get; } = new();
    public MemoryFileStorage Storage { get; } = new();

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
        var catalog = new PulseCatalogReader(Context);
        var ceilings = new CapabilityCeilingReader(Context, catalog);
        var learner = new PulseLearnerReader(Context, me, modules, catalog, ceilings, Clock);
        var policy = new PulseRetryPolicyProvider(Context, NullLogger<PulseRetryPolicyProvider>.Instance);
        var workspace = new PulseCourseWorkspace(Context, learner);
        var quiz = new PulseQuizReader(Context);
        var final = new PulseFinalReader(Context);
        var outcomes = new PulseOutcomeReader(Context);
        var scope = new PulseReviewScope(Context, new EmployeeScope(Context, current.Object), current.Object);
        var proctoring = new PulseProctoring(Context, me, Clock);
        var signer = new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "pulse-test-signing-key-0123456789abcdef" }, Clock);
        var recordings = new PulseRecordingReader(Context, signer);
        var audit = Mock.Of<IAuditService>();

        return new UseCases(
            new GetPulseOverviewUseCase(learner),
            new GetPulseCourseUseCase(Context, workspace),
            new GetPulseModuleUseCase(workspace, quiz),
            new MarkPulseModuleViewedUseCase(Context, workspace),
            new MarkPulsePageViewedUseCase(Context, workspace, quiz),
            new SubmitPulseModuleQuizUseCase(Context, workspace, quiz),
            new GetPulsePreAssessmentUseCase(Context, workspace),
            new SubmitPulsePreAssessmentUseCase(Context, workspace, proctoring),
            new DecidePulsePreAssessmentUseCase(Context, scope, audit, Clock),
            new StartPulseProctoringUseCase(Context, workspace, proctoring),
            new StartPulseRecordingUseCase(Context, proctoring),
            new AppendPulseRecordingChunkUseCase(Context, proctoring, Storage),
            new EndPulseRecordingUseCase(Context, proctoring),
            new RecordPulseProctoringEventsUseCase(Context, proctoring),
            new GetPulseRecordingContentUseCase(Context, Storage, signer),
            new GetPulseFinalUseCase(workspace, final, policy),
            new SubmitPulseFinalUseCase(Context, workspace, proctoring),
            new GetPulsePracticeUseCase(learner),
            new GetPulseOutcomesUseCase(learner, outcomes),
            new GetPulseOutcomeUseCase(learner, outcomes),
            new GetPulseFinalReviewsUseCase(Context, scope, catalog, final, recordings, current.Object, Clock),
            new DecidePulseFinalUseCase(Context, scope, policy, audit, Clock),
            new RecordPulseFinalSupportUseCase(Context, scope, Clock));
    }

    /// <summary>Đáp án đúng của một câu (test đọc thẳng DB — API không bao giờ trả đáp án).</summary>
    public Task<Guid> CorrectOptionAsync(Guid questionId) =>
        Context.QuestionOptions.AsNoTracking().Where(o => o.QuestionId == questionId && o.IsCorrect).Select(o => o.Id).FirstAsync();

    public Task<Guid> WrongOptionAsync(Guid questionId) =>
        Context.QuestionOptions.AsNoTracking().Where(o => o.QuestionId == questionId && !o.IsCorrect).Select(o => o.Id).FirstAsync();

    /// <summary>
    /// Một phiên làm bài có giám sát đầy đủ: bắt đầu phiên, ghi một mẩu toàn bộ màn hình và một mẩu camera (kèm micro).
    /// </summary>
    public async Task<Guid> ProctorAsync(UseCases uc, Guid courseId, string kind)
    {
        var session = await uc.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = courseId, Kind = kind });
        Context.ChangeTracker.Clear();
        foreach (var track in Statuses.ProctoringTrack.All)
        {
            var recording = await uc.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
            {
                SessionId = session.SessionId,
                Track = track,
                StartOffsetMs = 0,
                ContentType = "video/webm;codecs=vp8,opus",
                DisplaySurface = track == Statuses.ProctoringTrack.Screen ? "monitor" : null,
            });
            Context.ChangeTracker.Clear();
            await uc.AppendChunk.ExecuteAsync(new AppendPulseRecordingChunkUseCaseInput
            {
                SessionId = session.SessionId,
                RecordingId = recording.RecordingId,
                Seq = 0,
                Content = new MemoryStream(new byte[] { 0x1A, 0x45, 0xDF, 0xA3, 0x01 }),
            });
            Context.ChangeTracker.Clear();
        }

        Clock.Advance(TimeSpan.FromMinutes(20));
        return session.SessionId;
    }

    /// <summary>Làm và nộp bài đánh giá trước khi học của khóa <paramref name="code"/>.</summary>
    public async Task<SubmitPulsePreAssessmentUseCaseOutput> SubmitPreAssessmentAsync(UseCases uc, string code)
    {
        var course = await CourseAsync(uc, code);
        var sessionId = await ProctorAsync(uc, course.CourseId, Statuses.ProctoringKind.PreAssessment);
        var result = await uc.SubmitPreAssessment.ExecuteAsync(new SubmitPulsePreAssessmentUseCaseInput
        {
            CourseId = course.CourseId,
            EvidenceText = Evidence,
            ProctoringSessionId = sessionId,
        });
        Context.ChangeTracker.Clear();
        return result;
    }

    /// <summary>Nộp bài đánh giá trước khi học rồi người chấm ghi quyết định.</summary>
    public async Task DecidePreAssessmentAsync(UseCases employee, UseCases reviewer, string code, string decision)
    {
        var submitted = await SubmitPreAssessmentAsync(employee, code);
        await reviewer.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = submitted.PreAssessmentId,
            Decision = decision,
            Reason = decision == Statuses.FinalSubmissionDecision.Passed ? "Đạt đủ ba tiêu chí, nguồn rõ ràng." : "Chưa nêu được phép tính kiểm tra được.",
        });
        Context.ChangeTracker.Clear();
    }

    /// <summary>Bài đánh giá trước khi học chưa đạt → khóa mở để học (bước chuẩn bị của các test học mô đun).</summary>
    public async Task<PulseCourseSummaryDto> OpenForLearningAsync(UseCases employee, string code)
    {
        var manager = await AsAsync(ManagerEmail, Roles.Manager);
        await DecidePreAssessmentAsync(employee, manager, code, Statuses.FinalSubmissionDecision.NotYet);
        return await CourseAsync(employee, code);
    }

    /// <summary>Làm bài cuối khóa có giám sát và nộp.</summary>
    public async Task<SubmitPulseFinalUseCaseOutput> SubmitFinalAsync(UseCases uc, Guid courseId, string evidence = Evidence)
    {
        var sessionId = await ProctorAsync(uc, courseId, Statuses.ProctoringKind.Final);
        var result = await uc.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = courseId, EvidenceText = evidence, ProctoringSessionId = sessionId });
        Context.ChangeTracker.Clear();
        return result;
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
        GetPulseCourseUseCase GetCourse,
        GetPulseModuleUseCase GetModule,
        MarkPulseModuleViewedUseCase MarkViewed,
        MarkPulsePageViewedUseCase MarkPage,
        SubmitPulseModuleQuizUseCase SubmitQuiz,
        GetPulsePreAssessmentUseCase GetPreAssessment,
        SubmitPulsePreAssessmentUseCase SubmitPreAssessment,
        DecidePulsePreAssessmentUseCase DecidePreAssessment,
        StartPulseProctoringUseCase StartProctoring,
        StartPulseRecordingUseCase StartRecording,
        AppendPulseRecordingChunkUseCase AppendChunk,
        EndPulseRecordingUseCase EndRecording,
        RecordPulseProctoringEventsUseCase RecordEvents,
        GetPulseRecordingContentUseCase RecordingContent,
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
