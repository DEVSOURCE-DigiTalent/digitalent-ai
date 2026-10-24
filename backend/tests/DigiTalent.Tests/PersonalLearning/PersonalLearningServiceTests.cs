using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.PersonalLearning.Dtos;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.PersonalLearning;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.PersonalLearning;

public sealed class PersonalLearningServiceTests
{
    private sealed class TestFixture : IDisposable
    {
        public readonly AppDbContext Db;
        public readonly Mock<ICurrentUser> MockCurrentUser = new();
        public readonly PersonalLearningService Service;
        public readonly Guid CurrentUserId = Guid.NewGuid();

        public TestFixture()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            Db = new AppDbContext(options);

            MockCurrentUser.Setup(u => u.UserId).Returns(CurrentUserId);

            Db.Users.Add(new User
            {
                Id = CurrentUserId,
                Email = "learner@example.com",
                DisplayName = "Nguyễn Văn Học Viên",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });
            Db.SaveChanges();

            Service = new PersonalLearningService(Db, MockCurrentUser.Object, TimeProvider.System);
        }

        public void SetSubscription(string status, string planCode = "IND_PLUS", DateTimeOffset? trialEndsAt = null)
        {
            Db.UserSubscriptions.Add(new UserSubscription
            {
                Id = Guid.NewGuid(),
                UserId = CurrentUserId,
                PlanCode = planCode,
                Status = status,
                StartedAt = DateTimeOffset.UtcNow,
                TrialStartedAt = status == UserSubscriptionStatuses.Trialing ? DateTimeOffset.UtcNow : null,
                TrialEndsAt = trialEndsAt ?? (status == UserSubscriptionStatuses.Trialing ? DateTimeOffset.UtcNow.AddDays(7) : null),
                TrialCourseLimit = 3,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });
            Db.SaveChanges();
        }

        public void Dispose() => Db.Dispose();
    }

    [Fact]
    public async Task GetOverview_ReturnsCompleteOverviewDto()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        var overview = await fixture.Service.GetOverviewAsync();

        Assert.NotNull(overview);
        Assert.Equal("Nguyễn Văn Học Viên", overview.FullName);
        Assert.Equal(6, overview.Domains.Count);
        Assert.False(overview.Assessed);
        Assert.Equal(0, overview.CoveragePercent);
    }

    [Fact]
    public async Task SetTarget_SavesPosition_AndComputesSkillGap()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        var target = await fixture.Service.SetTargetAsync("ACCOUNTANT");

        Assert.Equal("ACCOUNTANT", target.Code);
        Assert.Equal("Kế toán", target.Name);
        Assert.True(target.RequiredCount > 0);

        var gap = await fixture.Service.GetSkillGapAsync();
        Assert.NotNull(gap.Target);
        Assert.Equal("ACCOUNTANT", gap.Target.Code);
        Assert.NotEmpty(gap.Items);
    }

    [Fact]
    public async Task SetTarget_Trial_AllowsOnlyOneChange_EnforcesBR10()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        // First choice: free
        await fixture.Service.SetTargetAsync("ACCOUNTANT");

        // First change: allowed
        await fixture.Service.SetTargetAsync("MARKETING");

        // Second change in trial: forbidden (BR-10)
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => fixture.Service.SetTargetAsync("HR"));
        Assert.Contains("một lần", ex.Message);
    }

    [Fact]
    public async Task Diagnostic_Submit_CalculatesLevels_AndEnforcesBR09()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        var diag = await fixture.Service.GetDiagnosticAsync();
        Assert.Equal(36, diag.Questions.Count);

        // All right: every pair is asked and every domain reaches Nâng cao.
        var answers = PersonalLearningCatalog.EntryQuestions.ToDictionary(q => q.Id, q => q.CorrectIndex);
        var result = await fixture.Service.SubmitDiagnosticAsync(answers);

        Assert.NotNull(result);
        Assert.Equal(36, result.Total);
        Assert.Equal(36, result.Correct);
        Assert.All(result.Domains, d => Assert.Equal(3, d.Level));

        // Second diagnostic in trial: forbidden (BR-09)
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => fixture.Service.SubmitDiagnosticAsync(answers));
        Assert.Contains("một lần", ex.Message);
    }

    [Fact]
    public async Task LessonProgress_FreePlan_ThrowsPlanRequired_EnforcesBR06()
    {
        using var fixture = new TestFixture();
        // Free plan (no active/trial subscription)

        var ex = await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.UpdateLessonProgressAsync("crs-a1-f", "crs-a1-f-l1-1", true));

        Assert.Contains("Gói Miễn phí không mở bài học mới", ex.Message);
    }

    [Fact]
    public async Task LessonProgress_Trial_EnforcesThreeCoursesLimit_EnforcesBR04()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        // Course 1
        await fixture.Service.UpdateLessonProgressAsync("crs-a1-f", "crs-a1-f-l1-1", true);
        // Course 2
        await fixture.Service.UpdateLessonProgressAsync("crs-a2-f", "crs-a2-f-l1-1", true);
        // Course 3
        await fixture.Service.UpdateLessonProgressAsync("crs-a3-f", "crs-a3-f-l1-1", true);

        // Course 4: exceeds trial limit of 3 courses (BR-04)
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.UpdateLessonProgressAsync("crs-a4-f", "crs-a4-f-l1-1", true));

        Assert.Contains("3 lượt học thử", ex.Message);
    }

    [Fact]
    public async Task CourseAssessment_RequiresAllLessons_AndGradesCorrectly()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        // Start course 1
        await fixture.Service.UpdateLessonProgressAsync("crs-a1-f", "crs-a1-f-l1-1", true);

        // Try to take assessment before finishing all lessons
        var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitCourseAssessmentAsync("crs-a1-f", new Dictionary<string, int>()));

        Assert.Contains("Hãy học hết các bài", ex.Message);

        // Complete all 9 lessons of crs-a1-f (3 competencies x 3 lessons)
        for (var m = 1; m <= 3; m++)
        {
            for (var l = 1; l <= 3; l++)
            {
                await fixture.Service.UpdateLessonProgressAsync("crs-a1-f", $"crs-a1-f-l{m}-{l}", true);
            }
        }

        // Submit assessment with correct answers
        var answers = PersonalLearningCatalog.CourseQuestions(1).ToDictionary(q => q.Id, q => q.CorrectIndex);

        var outcome = await fixture.Service.SubmitCourseAssessmentAsync("crs-a1-f", answers);
        Assert.True(outcome.Passed);
        Assert.Equal(100, outcome.ScorePercent);
        // In trial, certificate is marked pending upgrade (BR-12)
        Assert.True(outcome.CertificatePending);
        Assert.Null(outcome.CertificateId);

        var certs = await fixture.Service.GetCertificatesAsync();
        Assert.Single(certs);
        Assert.Equal("PENDING_UPGRADE", certs[0].Status);
    }

    [Fact]
    public async Task SubmitTask_ValidatesContentAndTrialSlot_EnforcesBR08()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);

        // Task for course not in trial slots -> forbidden
        var exSlot = await Assert.ThrowsAsync<ForbiddenException>(() =>
            fixture.Service.SubmitTaskAsync("task-crs-a1-f", new SubmitTaskRequest("https://example.com/doc", "Mô tả bài thực hành ít nhất 20 ký tự chuẩn")));
        Assert.Contains("kỳ dùng thử", exSlot.Message);

        // Open trial slot for crs-a1-f
        await fixture.Service.UpdateLessonProgressAsync("crs-a1-f", "crs-a1-f-l1-1", true);

        // Short content -> bad request
        var exShort = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitTaskAsync("task-crs-a1-f", new SubmitTaskRequest("https://example.com/doc", "Ngắn quá")));
        Assert.Contains("20 ký tự", exShort.Message);

        // A short draft is reviewed at once against the rubric and sent back with the criteria it misses.
        var draft = await fixture.Service.SubmitTaskAsync("task-crs-a1-f",
            new SubmitTaskRequest("https://example.com/report", "Đây là bài làm thực hành áp dụng kiến thức vào thực tế doanh nghiệp", new[] { 0 }));
        Assert.Equal("REVISION_REQUESTED", draft.Status);
        Assert.Equal("AI_RUBRIC", draft.Submission!.Reviewer);
        Assert.Equal(2, draft.Submission.Criteria!.Count(c => !c.Met));
        Assert.Equal(2, draft.AttemptsLeft);

        // Every criterion, a link and a full explanation: approved.
        var approved = await fixture.Service.SubmitTaskAsync("task-crs-a1-f",
            new SubmitTaskRequest("https://example.com/report", GoodExplanation, new[] { 0, 1, 2 }));
        Assert.Equal("APPROVED", approved.Status);
        Assert.True(approved.Submission!.Score >= 80);

        var again = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitTaskAsync("task-crs-a1-f", new SubmitTaskRequest("https://example.com/report", GoodExplanation, new[] { 0, 1, 2 })));
        Assert.Contains("đã được nộp", again.Message);
    }

    private const string GoodExplanation =
        "Báo cáo quy trình tìm kiếm và lưu trữ thông tin của phòng: bộ từ khóa chuẩn, nguồn ưu tiên, quy ước đặt tên tệp "
        + "và cấu trúc thư mục dùng chung. Mỗi tiêu chí có ví dụ trong tài liệu kèm theo, đã thử với dữ liệu tháng 9.";

    private static async Task CompleteAllLessonsAsync(TestFixture fixture, string courseId)
    {
        for (var m = 1; m <= 3; m++)
        {
            for (var l = 1; l <= 3; l++)
            {
                await fixture.Service.UpdateLessonProgressAsync(courseId, $"{courseId}-l{m}-{l}", true);
            }
        }
    }

    [Fact]
    public async Task IntermediateCourse_CompletesOnlyOnceItsPracticeTaskIsApproved()
    {
        using var fixture = new TestFixture();
        fixture.SetSubscription(UserSubscriptionStatuses.Trialing);
        var domainOne = PersonalLearningCatalog.CourseQuestions(1).ToDictionary(q => q.Id, q => q.CorrectIndex);

        // Cơ bản: the assessment alone completes it.
        await CompleteAllLessonsAsync(fixture, "crs-a1-f");
        var basic = await fixture.Service.SubmitCourseAssessmentAsync("crs-a1-f", domainOne);
        Assert.False(basic.TaskRequired);

        // Trung cấp: passed, but the course waits for the practice task.
        await CompleteAllLessonsAsync(fixture, "crs-a1-i");
        var intermediate = await fixture.Service.SubmitCourseAssessmentAsync("crs-a1-i", domainOne);
        Assert.True(intermediate.Passed);
        Assert.True(intermediate.TaskRequired);
        Assert.Null(intermediate.CertificateId);

        var waiting = await fixture.Service.GetCourseDetailAsync("crs-a1-i");
        Assert.True(waiting.AwaitingTask);
        Assert.Equal("IN_PROGRESS", waiting.Status);
        Assert.Single(await fixture.Service.GetCertificatesAsync());

        await fixture.Service.SubmitTaskAsync("task-crs-a1-i", new SubmitTaskRequest("https://example.com/report", GoodExplanation, new[] { 0, 1, 2 }));

        var done = await fixture.Service.GetCourseDetailAsync("crs-a1-i");
        Assert.False(done.AwaitingTask);
        Assert.Equal("COMPLETED", done.Status);
        Assert.Equal(2, (await fixture.Service.GetCertificatesAsync()).Count);
    }

    [Fact]
    public async Task VerifyCertificate_WithCatalogStandardCode_ReturnsValidCertificate()
    {
        using var fixture = new TestFixture();

        var cert = await fixture.Service.VerifyCertificateAsync("DTC-20261007-A2-I");
        Assert.NotNull(cert);
        Assert.Equal("DTC-20261007-A2-I", cert.Code);
        Assert.Equal("A2-I", cert.CourseCode);
        Assert.Equal(2, cert.Level);
        Assert.Equal(95, cert.ScorePercent);
        Assert.NotEmpty(cert.Competencies);
    }

    [Fact]
    public async Task VerifyCertificate_WithInvalidCode_ReturnsNull()
    {
        using var fixture = new TestFixture();

        var cert = await fixture.Service.VerifyCertificateAsync("INVALID-CERT-CODE-123");
        Assert.Null(cert);

        var emptyCert = await fixture.Service.VerifyCertificateAsync("");
        Assert.Null(emptyCert);
    }
}
