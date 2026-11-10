using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Tests.Pulse;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

/// <summary>
/// Luồng dùng thử (docs/specs/2026-10-31-trial-ai-report-roadmap.md) trên dữ liệu Development (InMemory): tổ chức demo được
/// đánh dấu dùng thử; owner@ đặt hạn, employee@ làm bài trắc nghiệm có giám sát (máy chấm), bài đóng sớm / hết hạn → báo
/// cáo năng lực với gợi ý AI qua rào chắn, đề xuất phạm vi đào tạo; nhân viên học thử khóa Cơ bản.
/// </summary>
public class TrialProgramFlowTests
{
    [Fact]
    public void Suggested_level_is_the_highest_tier_passed_in_a_row()
    {
        TrialProgramRules.SuggestedLevel(new[] { (1, 1), (1, 1), (1, 1) }).Should().Be(3);
        TrialProgramRules.SuggestedLevel(new[] { (1, 1), (0, 1), (1, 1) }).Should().Be(1);
        TrialProgramRules.SuggestedLevel(new[] { (0, 1), (1, 1), (1, 1) }).Should().Be(0);
        TrialProgramRules.SuggestedLevel(new[] { (1, 2), (2, 2), (0, 0) }).Should().Be(0);
        TrialProgramRules.SuggestedLevel(new[] { (2, 2), (2, 3), (0, 0) }).Should().Be(1);
    }

    [Fact]
    public async Task Owner_sets_deadline_employee_takes_exam_owner_closes_and_gets_ai_report()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        await AddTrialAsync(world, owner);

        // 1. Chủ doanh nghiệp đặt hạn làm bài (≥ 30 phút) → bài mở.
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        await FluentActions.Awaiting(() => asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddMinutes(10) }))
            .Should().ThrowAsync<BadRequestException>();
        var request = await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddDays(2) });
        request.Stage.Should().Be(TrialProgramRules.StageOpen);
        await FluentActions.Awaiting(() => asOwner.Close.ExecuteAsync(new CloseTrialAssessmentUseCaseInput()))
            .Should().ThrowAsync<BadRequestException>().Where(e => e.Message.Contains("Chưa có bài"));
        world.Context.ChangeTracker.Clear();

        // 2. Trước khi bài đóng, nhân viên chưa mở thêm khóa nào (khóa demo đã ghi danh sẵn của employee@ không tính).
        var employeeUc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        (await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput())).Courses
            .Where(c => c.EnrollmentStatus == null).Should().NotBeEmpty().And.OnlyContain(c => !c.CanWork);

        // 3. Nhân viên làm bài trắc nghiệm ba cấp trong phòng thi có giám sát; máy chấm ngay khi nộp.
        var asEmployee = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee);
        var mine = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        mine.CanStart.Should().BeTrue();
        mine.Domains.Should().HaveCount(6);
        var session = await asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        session.Kind.Should().Be(Statuses.ProctoringKind.TrialAssessment);
        session.Questions.Should().NotBeEmpty().And.HaveCountLessThanOrEqualTo(18);
        session.Questions.Select(q => q.Tier).Should().BeInAscendingOrder();
        world.Context.ChangeTracker.Clear();

        var submission = new SubmitMyTrialAssessmentUseCaseInput { ProctoringSessionId = session.SessionId };
        submission.Answers = await AnswersAsync(world, session.Questions, correctTiers: 3);
        await FluentActions.Awaiting(() => asEmployee.Submit.ExecuteAsync(submission)).Should().ThrowAsync<BadRequestException>();
        world.Context.ChangeTracker.Clear();
        await RecordAsync(world, employeeUc, session.SessionId);

        // Đúng hết Cơ bản và Trung cấp, sai hết Nâng cao → mức 2 ở mọi lĩnh vực có đủ câu.
        submission.Answers = await AnswersAsync(world, session.Questions, correctTiers: 2);
        var submitted = await asEmployee.Submit.ExecuteAsync(submission);
        world.Context.ChangeTracker.Clear();
        var domains = await world.Context.TrialAssessmentDomains.AsNoTracking().Where(d => d.TrialAssessmentId == submitted.AssessmentId).ToListAsync();
        domains.Should().HaveCount(6).And.OnlyContain(d => d.MentorLevel == null && d.AdvancedCorrect == 0 && d.BasicCorrect == d.BasicTotal);
        domains.Where(d => d.BasicTotal > 0 && d.IntermediateTotal > 0).Should().NotBeEmpty().And.OnlyContain(d => d.SuggestedLevel == 2);
        (await world.Context.TrialAssessments.AsNoTracking().SingleAsync(a => a.Id == submitted.AssessmentId)).ReviewedAt.Should().BeNull();

        // Còn người chưa nộp và chưa hết hạn → bài vẫn mở.
        var open = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        open.Stage.Should().Be(TrialProgramRules.StageOpen);
        open.Report.Should().BeNull();
        open.Participants.Should().Contain(p => p.Status == TrialProgramRules.ParticipantSubmitted);
        world.Context.ChangeTracker.Clear();

        // 4. "Xem kết quả ngay": bài đóng, báo cáo hiện ngay bằng câu mẫu, AI viết nền.
        var closed = await asOwner.Close.ExecuteAsync(new CloseTrialAssessmentUseCaseInput());
        closed.Assessed.Should().Be(1);
        asOwner.Queue.Items.Should().ContainSingle();
        world.Context.ChangeTracker.Clear();

        var pending = (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Report!;
        pending.Insights.Status.Should().Be(Statuses.TrialReportAi.Pending);
        pending.Insights.CeilingReasons.Should().HaveCount(6).And.OnlyContain(r => r.Source == TrialInsightSource.Template);
        world.Context.ChangeTracker.Clear();

        await asOwner.Writer.WriteAsync(asOwner.Queue.Items.Single(), CancellationToken.None);
        world.Context.ChangeTracker.Clear();
        var saved = await world.Context.TrialReports.AsNoTracking().SingleAsync();
        saved.AiStatus.Should().Be(Statuses.TrialReportAi.Done);
        saved.AiModel.Should().Be(StubGeminiService.Model);
        saved.AiReplaced.Should().Be(0);

        var program = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        program.Stage.Should().Be(TrialProgramRules.StageReported);
        var report = program.Report!;
        report.Assessed.Should().Be(1);
        report.Employees.Single().Levels.Should().Equal(domains.OrderBy(d => report.Domains.FindIndex(x => x.CategoryId == d.CategoryId)).Select(d => (int)d.SuggestedLevel));
        report.Summary.Select(s => s.Counts.Sum()).Should().OnlyContain(n => n == 1);
        report.Summary.Where(s => s.CorrectRates[2] != null).Should().OnlyContain(s => s.CorrectRates[0] == 100 && s.CorrectRates[2] == 0);
        // Mức 2, đề xuất mở Nâng cao → câu sai trong phạm vi là câu Nâng cao.
        report.Summary.Where(s => s.MostMissed != null).Should().NotBeEmpty()
            .And.OnlyContain(s => s.MostMissed!.Wrong == 1 && s.MostMissed.Answered == 1 && s.MostMissed.Tier == 3);
        report.Departments.Should().ContainSingle().Which.People.Should().Be(1);
        report.Insights.Status.Should().Be(Statuses.TrialReportAi.Done);
        report.Insights.CeilingReasons.Should().OnlyContain(r => r.Source == TrialInsightSource.Ai);

        // 5. Đề xuất phạm vi: trung vị Trung cấp → mở Nâng cao; giá theo cấp.
        var roadmap = await asOwner.Roadmap.ExecuteAsync(new GetTrialRoadmapUseCaseInput());
        roadmap.Available.Should().BeTrue();
        roadmap.People.Should().ContainSingle();
        roadmap.Options.Select(o => o.Kind).Should().Equal(TrialCeilingPlanner.OptionSaving, TrialCeilingPlanner.OptionBalanced, TrialCeilingPlanner.OptionFull);
        var balanced = roadmap.Options.Single(o => o.Kind == TrialCeilingPlanner.OptionBalanced).Organization;
        balanced.Where((_, i) => roadmap.People[0].Levels[i] == 2).Should().OnlyContain(level => level == 3);
        roadmap.Prices.Should().Equal(0, 0, 399_000, 699_000);

        // 6. Nhân viên thấy mức của mình, không làm lại được, và học thử khóa Cơ bản.
        world.Context.ChangeTracker.Clear();
        var result = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        result.Status.Should().Be(TrialProgramRules.StageReported);
        result.Levels.Should().Equal(report.Employees.Single().Levels);
        await FluentActions.Awaiting(() => asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput()))
            .Should().ThrowAsync<BadRequestException>();
        var overview = await (await world.AsAsync(PulseTestWorld.EmployeeEmail)).Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Courses.Where(c => c.Tier == 1).Should().NotBeEmpty().And.OnlyContain(c => c.Zone == PulseCourseZone.Path);
        overview.Courses.Where(c => c.Tier == 1).Should().OnlyContain(c => c.CanWork);
        overview.Courses.Where(c => c.Tier > 1 && c.EnrollmentStatus == null).Should().NotBeEmpty().And.OnlyContain(c => !c.CanWork);

        // 7. Quản trị nền tảng thấy báo cáo và cho AI viết lại.
        var asAdmin = await TrialAsAsync(world, "platform@digitalent.ai", Roles.PlatformAdmin);
        var row = (await asAdmin.PlatformTrials.ExecuteAsync(new GetPlatformTrialsUseCaseInput())).Items.Single();
        row.Stage.Should().Be(TrialProgramRules.StageReported);
        row.Submitted.Should().Be(1);
        row.InsightStatus.Should().Be(Statuses.TrialReportAi.Done);
        world.Context.ChangeTracker.Clear();
        (await asAdmin.Regenerate.ExecuteAsync(new RegenerateTrialInsightsUseCaseInput { OrganizationId = row.OrganizationId }))
            .Status.Should().Be(Statuses.TrialReportAi.Pending);
        asAdmin.Queue.Items.Should().ContainSingle();
    }

    [Fact]
    public async Task Test_closes_when_the_deadline_passes_and_ai_failures_fall_back_to_templates()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        await AddTrialAsync(world, owner);
        var noAi = new StubGeminiService { TrialDraft = _ => null };
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner, noAi);
        await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddHours(2) });
        world.Context.ChangeTracker.Clear();

        // Hết hạn mà chưa ai nộp: không đóng (chủ doanh nghiệp còn đổi hạn được), nhân viên không vào bài được nữa.
        world.Clock.Advance(TimeSpan.FromHours(3));
        (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Stage.Should().Be(TrialProgramRules.StageOpen);
        var asEmployee = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee, noAi);
        (await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput())).CanStart.Should().BeFalse();
        world.Context.ChangeTracker.Clear();

        // Đổi hạn, nhân viên nộp, rồi hết hạn: lần đọc tiếp theo đóng bài.
        await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddHours(2) });
        world.Context.ChangeTracker.Clear();
        var employeeUc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var session = await asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        world.Context.ChangeTracker.Clear();
        await RecordAsync(world, employeeUc, session.SessionId);
        await asEmployee.Submit.ExecuteAsync(new SubmitMyTrialAssessmentUseCaseInput
        {
            ProctoringSessionId = session.SessionId,
            Answers = await AnswersAsync(world, session.Questions, correctTiers: 0),
        });
        world.Context.ChangeTracker.Clear();
        world.Clock.Advance(TimeSpan.FromHours(3));

        var mine = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        mine.ReportPublished.Should().BeTrue();
        mine.Levels.Should().OnlyContain(level => level == 0);
        world.Context.ChangeTracker.Clear();

        // AI không trả lời → câu mẫu (FALLBACK), báo cáo vẫn đủ: mọi lĩnh vực chưa đạt Cơ bản → giữ Cơ bản.
        await asOwner.Writer.WriteAsync(asEmployee.Queue.Items.Single(), CancellationToken.None);
        world.Context.ChangeTracker.Clear();
        var report = (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Report!;
        report.Insights.Status.Should().Be(Statuses.TrialReportAi.Fallback);
        report.Insights.CeilingReasons.Should().OnlyContain(r => r.Source == TrialInsightSource.Template && r.Text == "1/1 chưa đạt Cơ bản → giữ Cơ bản");
        report.Insights.Priorities.Should().HaveCount(3).And.OnlyContain(p => p.Text == "1/1 chưa đạt Cơ bản");
        // Sai hết → đề xuất giữ Cơ bản → câu sai nhiều nhất chỉ lấy trong cấp Cơ bản (không phải câu Nâng cao ai cũng sai).
        report.Summary.Should().OnlyContain(s => s.MostMissed != null && s.MostMissed.Tier == 1);
        (await world.Context.TrialReports.AsNoTracking().SingleAsync()).AiModel.Should().BeNull();
    }

    [Fact]
    public async Task Owner_can_join_the_test_once_as_a_participant()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var ownerRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Owner);
        var organization = new DigiTalent.Domain.Entities.Organization { Code = "TRIAL-JOIN", Name = "Sao Mai" };
        var owner = new User { Email = "chu@saomai.test", DisplayName = "Chủ Sao Mai", PasswordHash = "x", OrganizationId = organization.Id };
        owner.UserRoles.Add(new UserRole { RoleId = ownerRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Organizations.Add(organization);
        world.Context.Users.Add(owner);
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = organization.Id, OwnerUserId = owner.Id, StartedAt = world.Clock.Now, EndsAt = world.Clock.Now.AddDays(14), PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var asOwner = await TrialAsAsync(world, "chu@saomai.test", Roles.Owner);
        (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Participants.Should().BeEmpty();
        await FluentActions.Awaiting(() => asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "", Position = "Giám đốc" }))
            .Should().ThrowAsync<BadRequestException>();
        await asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "Ban giám đốc", Position = "Giám đốc" });
        world.Context.ChangeTracker.Clear();

        var roles = await world.Context.UserRoles.Where(r => r.UserId == owner.Id).Select(r => r.Role.Code).ToListAsync();
        roles.Should().BeEquivalentTo(new[] { Roles.Owner, Roles.Employee });
        var me = (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Participants.Should().ContainSingle().Subject;
        me.IsOwner.Should().BeTrue();
        me.DepartmentName.Should().Be("Ban giám đốc");
        me.Status.Should().Be(TrialProgramRules.ParticipantActive);
        var joinedAgain = await asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "Ban giám đốc", Position = "Giám đốc" });
        joinedAgain.EmployeeId.Should().Be(me.EmployeeId!.Value);
    }

    [Fact]
    public async Task In_a_trial_organization_only_the_assigned_mentor_reviews_course_work()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentor = await world.UserAsync("mentor@digitalent.ai");
        var employee = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);

        // Doanh nghiệp thường: chủ doanh nghiệp chấm được, mentor không thấy ai.
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();

        // Dùng thử, chưa phân công: không ai chấm, không ai nhận thông báo.
        await AddTrialAsync(world, owner);
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await (await TrialAsAsync(world, PulseTestWorld.ManagerEmail, Roles.Manager)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().BeEmpty();

        // Quản trị nền tảng phân công mentor chấm bài học thử (bất kỳ lúc nào): chỉ mentor đó chấm và nhận thông báo bài nộp.
        var asAdmin = await TrialAsAsync(world, "platform@digitalent.ai", Roles.PlatformAdmin);
        await FluentActions.Awaiting(() => asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = owner.Id }))
            .Should().ThrowAsync<BadRequestException>();
        await asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = mentor.Id });
        world.Context.ChangeTracker.Clear();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().Equal(mentor.Id);
    }

    private static async Task AddTrialAsync(PulseTestWorld world, User owner)
    {
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value,
            OwnerUserId = owner.Id,
            StartedAt = world.Clock.Now,
            EndsAt = world.Clock.Now.AddDays(14),
            PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
    }

    private static async Task<List<PulseAnswerInput>> AnswersAsync(PulseTestWorld world, IReadOnlyList<TrialExamQuestionDto> questions, int correctTiers)
    {
        var answers = new List<PulseAnswerInput>();
        foreach (var question in questions)
        {
            answers.Add(new PulseAnswerInput
            {
                QuestionId = question.QuestionId,
                OptionId = question.Tier <= correctTiers
                    ? await world.CorrectOptionAsync(question.QuestionId)
                    : await world.WrongOptionAsync(question.QuestionId),
            });
        }

        return answers;
    }

    /// <summary>Một mẩu ghi toàn bộ màn hình và một mẩu camera cho phiên.</summary>
    private static async Task RecordAsync(PulseTestWorld world, PulseTestWorld.UseCases uc, Guid sessionId)
    {
        foreach (var track in Statuses.ProctoringTrack.All)
        {
            var recording = await uc.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
            {
                SessionId = sessionId,
                Track = track,
                StartOffsetMs = 0,
                ContentType = "video/webm;codecs=vp8,opus",
                DisplaySurface = track == Statuses.ProctoringTrack.Screen ? "monitor" : null,
            });
            world.Context.ChangeTracker.Clear();
            await uc.AppendChunk.ExecuteAsync(new AppendPulseRecordingChunkUseCaseInput
            {
                SessionId = sessionId,
                RecordingId = recording.RecordingId,
                Seq = 0,
                Content = new MemoryStream(new byte[] { 0x1A, 0x45, 0xDF, 0xA3, 0x01 }),
            });
            world.Context.ChangeTracker.Clear();
        }

        world.Clock.Advance(TimeSpan.FromMinutes(30));
    }

    /// <summary>Hàng đợi gợi ý AI ghi lại id báo cáo (test tự gọi <see cref="TrialInsightWriter"/>).</summary>
    private sealed class RecordingInsightQueue : ITrialInsightQueue
    {
        public List<Guid> Items { get; } = new();

        public void Enqueue(Guid reportId) => Items.Add(reportId);
    }

    private sealed record TrialUseCases(
        GetTrialProgramUseCase Program,
        SubmitTrialRequestUseCase Request,
        CloseTrialAssessmentUseCase Close,
        GetTrialRoadmapUseCase Roadmap,
        GetMyTrialAssessmentUseCase Mine,
        StartMyTrialAssessmentUseCase Start,
        SubmitMyTrialAssessmentUseCase Submit,
        GetPlatformTrialsUseCase PlatformTrials,
        RegenerateTrialInsightsUseCase Regenerate,
        AssignTrialMentorUseCase Assign,
        JoinTrialAsParticipantUseCase Join,
        PulseReviewScope ReviewScope,
        TrialInsightWriter Writer,
        RecordingInsightQueue Queue);

    private static async Task<TrialUseCases> TrialAsAsync(PulseTestWorld world, string email, string role, StubGeminiService? ai = null)
    {
        var context = world.Context;
        var user = await world.UserAsync(email);
        var employee = await context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == user.Id);
        var current = new Mock<ICurrentUser>();
        if (user.OrganizationId is { } organizationId)
        {
            current.Setup(c => c.GetRequiredOrganizationId()).Returns(organizationId);
        }

        current.Setup(c => c.OrganizationId).Returns(user.OrganizationId);
        current.Setup(c => c.UserId).Returns(user.Id);
        current.Setup(c => c.EmployeeId).Returns(employee?.Id);
        current.Setup(c => c.IsAuthenticated).Returns(true);
        current.Setup(c => c.Roles).Returns(new List<string> { role });
        current.Setup(c => c.IsAdmin).Returns(role == Roles.Owner);

        var me = new MyEmployeeContext(context, current.Object);
        var paper = new TrialAssessmentPaper(context, new PulseCatalogReader(context), new PulseModuleReader(context));
        var reader = new TrialProgramReader(context, current.Object, paper, world.Clock);
        var proctoring = new PulseProctoring(context, me, world.Clock);
        var gemini = ai ?? new StubGeminiService();
        var signer = new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "trial-test-signing-key-0123456789abcdef" }, world.Clock);
        var builder = new TrialReportBuilder(context, paper, new PulseRecordingReader(context, signer));
        var queue = new RecordingInsightQueue();
        var closer = new TrialCloser(context, reader, gemini, queue);

        return new TrialUseCases(
            new GetTrialProgramUseCase(context, reader, closer, builder),
            new SubmitTrialRequestUseCase(context, reader),
            new CloseTrialAssessmentUseCase(reader, closer),
            new GetTrialRoadmapUseCase(context, current.Object, builder),
            new GetMyTrialAssessmentUseCase(context, me, reader, closer),
            new StartMyTrialAssessmentUseCase(context, me, reader, paper, proctoring),
            new SubmitMyTrialAssessmentUseCase(context, me, reader, paper, proctoring, closer),
            new GetPlatformTrialsUseCase(context),
            new RegenerateTrialInsightsUseCase(context, closer),
            new AssignTrialMentorUseCase(context, reader, Mock.Of<IAuditService>()),
            new JoinTrialAsParticipantUseCase(context, reader),
            new PulseReviewScope(context, new DigiTalent.Application.Common.Authorization.EmployeeScope(context, current.Object), current.Object),
            new TrialInsightWriter(context, builder, gemini, world.Clock, NullLogger<TrialInsightWriter>.Instance),
            queue);
    }
}
