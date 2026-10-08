using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace DigiTalent.Tests.Me;

/// <summary>
/// Dữ liệu demo Development thật (DbSeeder: TT02 + EmployeeJourneySeeder) trên EF InMemory, để test các trang
/// tổng hợp EM-01..EM-05 và EM-18 với đúng kịch bản employee@ (Kế toán, mức Cơ bản mọi năng lực, 3 khóa, 3 nhiệm vụ,
/// 1 chứng chỉ). Chỉ dùng cho use case đọc — nộp bài dùng ExecuteUpdate nên test trên PostgreSQL (MeTestWorld).
/// </summary>
internal sealed class DemoSeedWorld : IDisposable
{
    public const string EmployeeEmail = "employee@digitalent.ai";
    public const string ManagerEmail = "manager@digitalent.ai";
    public const string AdminEmail = "admin@digitalent.ai";

    public required AppDbContext Context { get; init; }

    public static async Task<DemoSeedWorld> CreateAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"me-demo-{Guid.NewGuid():N}")
            .Options);
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        await DbSeeder.SeedAsync(context, hasher.Object);
        context.ChangeTracker.Clear();
        return new DemoSeedWorld { Context = context };
    }

    public Task<User> UserAsync(string email) => Context.Users.SingleAsync(u => u.Email == email);

    public async Task<Employee> EmployeeAsync(string email)
    {
        var user = await UserAsync(email);
        return await Context.Employees.SingleAsync(e => e.UserId == user.Id);
    }

    /// <summary>Use case /me/* dựng như DI trong Application.DependencyInjection, đăng nhập bằng <paramref name="email"/>.</summary>
    public async Task<UseCases> AsAsync(string email)
    {
        var user = await UserAsync(email);
        var current = new Mock<ICurrentUser>();
        current.Setup(c => c.GetRequiredOrganizationId()).Returns(user.OrganizationId!.Value);
        current.Setup(c => c.OrganizationId).Returns(user.OrganizationId);
        current.Setup(c => c.UserId).Returns(user.Id);
        current.Setup(c => c.IsAuthenticated).Returns(true);

        var me = new MyEmployeeContext(Context, current.Object);
        var progress = new MyLearningProgressService(Context);
        var assessments = new MyAssessmentService(Context, progress, new MyCertificateIssuer(Context, Mock.Of<IAuditService>()));
        var snapshot = new MyCompetencySnapshotBuilder(
            Context, new SkillGapSettingsProvider(Context, NullLogger<SkillGapSettingsProvider>.Instance));
        var courses = new MyCourseReader(Context);
        var tasks = new MyTaskReader(Context);

        return new UseCases(
            new GetMyDashboardUseCase(Context, me, snapshot, courses, tasks, assessments, progress),
            new GetMyCompetencyProfileUseCase(Context, me, snapshot),
            new GetMySkillGapUseCase(Context, me, snapshot),
            new GetMyEvidenceTimelineUseCase(Context, me, tasks),
            new GetMyLearningPathUseCase(Context, me, snapshot, courses,
                new RecommendationWeightsProvider(Context, NullLogger<RecommendationWeightsProvider>.Instance)),
            new GetMyAchievementsUseCase(Context, me, snapshot));
    }

    public sealed record UseCases(
        GetMyDashboardUseCase Dashboard,
        GetMyCompetencyProfileUseCase Profile,
        GetMySkillGapUseCase SkillGap,
        GetMyEvidenceTimelineUseCase Evidence,
        GetMyLearningPathUseCase LearningPath,
        GetMyAchievementsUseCase Achievements);

    public void Dispose() => Context.Dispose();
}
