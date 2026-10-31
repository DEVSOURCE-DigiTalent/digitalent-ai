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
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

/// <summary>
/// Luồng dùng thử mới (docs/specs/2026-10-27-enterprise-trial-assessment.md) trên dữ liệu Development (InMemory): tổ chức demo
/// được đánh dấu dùng thử; owner@ gửi yêu cầu, employee@ làm bài tổng hợp có giám sát, platform@ phân công mentor@, mentor
/// chấm và công bố; owner thấy bảng năng lực, nhân viên học thử khóa Cơ bản.
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
    public async Task Owner_request_employee_exam_mentor_review_and_report_unlock_basic_learning()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
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

        // 1. Chủ doanh nghiệp gửi yêu cầu chấm: hạn làm bài + giờ mong muốn chấm.
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        await FluentActions.Awaiting(() => asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput
        {
            TestDeadline = world.Clock.Now.AddMinutes(10),
            PreferredReviewAt = world.Clock.Now.AddDays(1),
        })).Should().ThrowAsync<BadRequestException>();
        var preferredReviewAt = world.Clock.Now.AddDays(3);
        var request = await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput
        {
            TestDeadline = world.Clock.Now.AddDays(2),
            PreferredReviewAt = preferredReviewAt,
            Note = "Chấm buổi sáng",
        });
        request.Stage.Should().Be(TrialProgramRules.StageRequested);
        var platform = await world.UserAsync("platform@digitalent.ai");
        (await world.Context.Notifications.CountAsync(n => n.RecipientUserId == platform.Id && n.Type == TrialProgramRules.NotificationRequested))
            .Should().Be(1);
        world.Context.ChangeTracker.Clear();

        // 2. Trước khi công bố, nhân viên chưa có lộ trình học.
        var employeeUc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        (await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput())).Courses.Should().OnlyContain(c => !c.CanWork);

        // 3. Nhân viên làm bài tổng hợp ba cấp trong phòng thi có giám sát.
        var asEmployee = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee);
        var mine = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        mine.CanStart.Should().BeTrue();
        mine.Domains.Should().HaveCount(6);
        var session = await asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        session.Kind.Should().Be(Statuses.ProctoringKind.TrialAssessment);
        // Một câu cho mỗi ô lĩnh vực × cấp có câu ôn tập (dữ liệu Development đầy đủ: 18 câu), xếp Cơ bản → Nâng cao.
        session.Questions.Should().NotBeEmpty().And.HaveCountLessThanOrEqualTo(18);
        session.Questions.Select(q => q.Tier).Should().BeInAscendingOrder();
        session.Questions.Select(q => q.Tier).Distinct().Should().BeEquivalentTo(new[] { 1, 2, 3 });
        world.Context.ChangeTracker.Clear();
        (await world.Context.ProctoringSessions.AsNoTracking().SingleAsync(s => s.Id == session.SessionId)).CourseId.Should().BeNull();

        var essays = new SubmitMyTrialAssessmentUseCaseInput
        {
            ProctoringSessionId = session.SessionId,
            EssayBasic = PulseTestWorld.Evidence,
            EssayIntermediate = PulseTestWorld.Evidence,
            EssayAdvanced = PulseTestWorld.Evidence,
        };
        // Chưa có bản ghi màn hình và camera → không nộp được.
        essays.Answers = await AnswersAsync(world, session.Questions, correctTiers: 3);
        await FluentActions.Awaiting(() => asEmployee.Submit.ExecuteAsync(essays)).Should().ThrowAsync<BadRequestException>();
        world.Context.ChangeTracker.Clear();
        await RecordAsync(world, employeeUc, session.SessionId);

        // Đúng hết Cơ bản và Trung cấp, sai hết Nâng cao → mức gợi ý 2 ở mọi lĩnh vực.
        essays.Answers = await AnswersAsync(world, session.Questions, correctTiers: 2);
        var submitted = await asEmployee.Submit.ExecuteAsync(essays);
        world.Context.ChangeTracker.Clear();
        var domains = await world.Context.TrialAssessmentDomains.AsNoTracking().Where(d => d.TrialAssessmentId == submitted.AssessmentId).ToListAsync();
        domains.Should().HaveCount(6).And.OnlyContain(d => d.MentorLevel == null && d.AdvancedCorrect == 0 && d.BasicCorrect == d.BasicTotal);
        domains.Where(d => d.BasicTotal > 0 && d.IntermediateTotal > 0).Should().NotBeEmpty().And.OnlyContain(d => d.SuggestedLevel == 2);
        domains.Where(d => d.BasicTotal == 0).Should().OnlyContain(d => d.SuggestedLevel == 0);
        (await world.Context.ExamChoiceAnswers.CountAsync(a => a.TrialAssessmentId == submitted.AssessmentId)).Should().Be(session.Questions.Count);
        await FluentActions.Awaiting(() => asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput()))
            .Should().ThrowAsync<BadRequestException>();

        // 4. Quản trị nền tảng thấy yêu cầu và phân công mentor.
        var asAdmin = await TrialAsAsync(world, "platform@digitalent.ai", Roles.PlatformAdmin);
        var queue = await asAdmin.PlatformTrials.ExecuteAsync(new GetPlatformTrialsUseCaseInput());
        var row = queue.Items.Single();
        row.Stage.Should().Be(TrialProgramRules.StageRequested);
        row.Submitted.Should().Be(1);
        row.PreferredReviewAt.Should().Be(preferredReviewAt);
        var mentor = await world.UserAsync("mentor@digitalent.ai");
        await FluentActions.Awaiting(() => asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = row.OrganizationId, MentorUserId = owner.Id }))
            .Should().ThrowAsync<BadRequestException>();
        await asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = row.OrganizationId, MentorUserId = mentor.Id });
        world.Context.ChangeTracker.Clear();

        // 5. Mentor chấm: thấy bản ghi, số câu đúng theo cấp, ba bài tự luận; quyết định mức từng lĩnh vực rồi công bố.
        var asMentor = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor);
        var detail = await asMentor.MentorTrial.ExecuteAsync(new GetMentorTrialUseCaseInput { OrganizationId = row.OrganizationId });
        var assessment = detail.Assessments.Single();
        assessment.Recording.Should().NotBeNull();
        assessment.Recording!.Segments.Should().HaveCount(2);
        assessment.Essays.Should().HaveCount(3);
        assessment.Domains.Should().HaveCount(6).And.OnlyContain(d => d.Correct[0] == d.Total[0] && d.Correct[1] == d.Total[1] && d.Correct[2] == 0);
        assessment.ChoiceItems.Should().HaveCount(session.Questions.Count);
        assessment.Essays.Should().OnlyContain(e => e.Score == null);
        detail.CanPublish.Should().BeFalse();
        detail.AiAvailable.Should().BeTrue();

        // AI gợi ý điểm tự luận cho mentor (lưu lại, mở lần sau không gọi lại); mentor vẫn tự cho điểm.
        var ai = await asMentor.AiReview.ExecuteAsync(new ReviewTrialEssaysWithAiUseCaseInput { OrganizationId = row.OrganizationId, AssessmentId = assessment.AssessmentId });
        ai.Essays.Select(e => e.Tier).Should().Equal(1, 2, 3);
        ai.Essays.Should().OnlyContain(e => e.Score == 7 && e.Passed);
        world.Context.ChangeTracker.Clear();
        (await asMentor.MentorTrial.ExecuteAsync(new GetMentorTrialUseCaseInput { OrganizationId = row.OrganizationId }))
            .Assessments.Single().AiReview!.Essays.Should().HaveCount(3);

        await FluentActions.Awaiting(() => asMentor.Review.ExecuteAsync(new ReviewTrialAssessmentUseCaseInput
            {
                OrganizationId = row.OrganizationId,
                AssessmentId = assessment.AssessmentId,
                Levels = assessment.Domains.Select(d => new TrialDomainLevelInput { CategoryId = d.CategoryId, Level = 1 }).ToList(),
                EssayScores = new List<int>(),
            }))
            .Should().ThrowAsync<BadRequestException>().Where(e => e.Message.Contains("tự luận"));
        await FluentActions.Awaiting(() => asMentor.Publish.ExecuteAsync(new PublishTrialReportUseCaseInput { OrganizationId = row.OrganizationId }))
            .Should().ThrowAsync<BadRequestException>();

        var levels = assessment.Domains.Select((d, i) => new TrialDomainLevelInput { CategoryId = d.CategoryId, Level = i % 4 }).ToList();
        await asMentor.Review.ExecuteAsync(new ReviewTrialAssessmentUseCaseInput
        {
            OrganizationId = row.OrganizationId,
            AssessmentId = assessment.AssessmentId,
            Levels = levels,
            EssayScores = new List<int> { 6, 5, 3 },
            Note = "Nền tảng tốt.",
        });
        world.Context.ChangeTracker.Clear();
        var scored = (await asMentor.MentorTrial.ExecuteAsync(new GetMentorTrialUseCaseInput { OrganizationId = row.OrganizationId })).Assessments.Single();
        scored.Essays.Select(e => e.Score).Should().Equal(6, 5, 3);
        TrialProgramRules.EssayLevel(scored.Essays.Select(e => e.Score).ToList()).Should().Be(2);
        world.Context.ChangeTracker.Clear();
        await asMentor.Publish.ExecuteAsync(new PublishTrialReportUseCaseInput { OrganizationId = row.OrganizationId });
        world.Context.ChangeTracker.Clear();

        // Mentor khác không thấy doanh nghiệp này.
        var other = await TrialAsAsync(world, "platform@digitalent.ai", Roles.Mentor);
        await FluentActions.Awaiting(() => other.MentorTrial.ExecuteAsync(new GetMentorTrialUseCaseInput { OrganizationId = row.OrganizationId }))
            .Should().ThrowAsync<NotFoundException>();

        // 6. Chủ doanh nghiệp nhận bảng năng lực; nhân viên thấy mức của mình và học thử khóa Cơ bản.
        var program = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        program.Stage.Should().Be(TrialProgramRules.StageReported);
        program.Report.Should().NotBeNull();
        program.Report!.Assessed.Should().Be(1);
        program.Report.Employees.Single().Levels.Should().Equal(levels.Select(l => l.Level));
        program.Report.Summary.Select(s => s.Counts.Sum()).Should().OnlyContain(n => n == 1);

        var result = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        result.Status.Should().Be(TrialProgramRules.ParticipantReviewed);
        result.Levels.Should().Equal(levels.Select(l => l.Level));
        result.ReviewNote.Should().Be("Nền tảng tốt.");

        var overview = await (await world.AsAsync(PulseTestWorld.EmployeeEmail)).Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Courses.Where(c => c.Tier == 1).Should().NotBeEmpty().And.OnlyContain(c => c.Zone == PulseCourseZone.Path);
        overview.Courses.Where(c => c.Tier > 1).Should().OnlyContain(c => c.Zone == PulseCourseZone.AboveCeiling && !c.CanWork);
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
        await FluentActions.Awaiting(() => asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "Ban giám đốc", Position = "Giám đốc" }))
            .Should().ThrowAsync<ConflictException>();
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
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value, OwnerUserId = owner.Id, StartedAt = world.Clock.Now, EndsAt = world.Clock.Now.AddDays(14), PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await (await TrialAsAsync(world, PulseTestWorld.ManagerEmail, Roles.Manager)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().BeEmpty();

        // Phân công mentor: chỉ mentor đó chấm và nhận thông báo bài nộp.
        var trial = await world.Context.TrialWorkspaces.SingleAsync();
        trial.MentorUserId = mentor.Id;
        trial.MentorAssignedAt = world.Clock.Now;
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().Equal(mentor.Id);
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

    private sealed record TrialUseCases(
        GetTrialProgramUseCase Program,
        SubmitTrialRequestUseCase Request,
        GetMyTrialAssessmentUseCase Mine,
        StartMyTrialAssessmentUseCase Start,
        SubmitMyTrialAssessmentUseCase Submit,
        GetPlatformTrialsUseCase PlatformTrials,
        AssignTrialMentorUseCase Assign,
        GetMentorTrialUseCase MentorTrial,
        ReviewTrialAssessmentUseCase Review,
        ReviewTrialEssaysWithAiUseCase AiReview,
        PublishTrialReportUseCase Publish,
        JoinTrialAsParticipantUseCase Join,
        PulseReviewScope ReviewScope);

    private static async Task<TrialUseCases> TrialAsAsync(PulseTestWorld world, string email, string role)
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
        var modules = new PulseModuleReader(context);
        var catalog = new PulseCatalogReader(context);
        var paper = new TrialAssessmentPaper(context, catalog, modules);
        var reader = new TrialProgramReader(context, current.Object, paper, world.Clock);
        var proctoring = new PulseProctoring(context, me, world.Clock);
        var examPaper = new PulseExamPaper(context, new PulseQuizReader(context));
        var ai = new StubGeminiService();
        var signer = new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "trial-test-signing-key-0123456789abcdef" }, world.Clock);

        return new TrialUseCases(
            new GetTrialProgramUseCase(context, reader),
            new SubmitTrialRequestUseCase(context, reader),
            new GetMyTrialAssessmentUseCase(context, me, reader),
            new StartMyTrialAssessmentUseCase(context, me, reader, paper, proctoring),
            new SubmitMyTrialAssessmentUseCase(context, me, reader, paper, proctoring),
            new GetPlatformTrialsUseCase(context),
            new AssignTrialMentorUseCase(context, reader, Mock.Of<IAuditService>()),
            new GetMentorTrialUseCase(context, reader, examPaper, new PulseRecordingReader(context, signer), ai),
            new ReviewTrialAssessmentUseCase(context, reader),
            new ReviewTrialEssaysWithAiUseCase(context, reader, ai),
            new PublishTrialReportUseCase(context, reader),
            new JoinTrialAsParticipantUseCase(context, reader),
            new PulseReviewScope(context, new DigiTalent.Application.Common.Authorization.EmployeeScope(context, current.Object), current.Object));
    }
}
