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
/// owner gửi khảo sát, nhân viên làm trắc nghiệm có giám sát; hệ thống tự chấm và cập nhật báo cáo.
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
    public async Task Multiple_choice_submission_is_graded_and_published_without_a_mentor()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var employeeUser = await world.UserAsync(PulseTestWorld.EmployeeEmail);
        foreach (var employee in await world.Context.Employees.Where(e => e.UserId != employeeUser.Id).ToListAsync()) employee.Status = Statuses.Employee.Archived;
        await world.Context.SaveChangesAsync();
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        var before = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        var asEmployee = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee);
        (await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput())).CanStart.Should().BeFalse();
        await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddDays(2) });
        var session = await asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        session.Essays.Should().BeEmpty();
        session.Kind.Should().Be(Statuses.ProctoringKind.TrialAssessment);
        session.Questions.Should().HaveCount(18);
        session.Questions.Select(q => q.Tier).Should().BeInAscendingOrder();
        session.Questions.Select(q => q.Tier).Distinct().Should().BeEquivalentTo(new[] { 1, 2, 3 });
        var employeeUc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await RecordAsync(world, employeeUc, session.SessionId);
        var submitted = await asEmployee.Submit.ExecuteAsync(new SubmitMyTrialAssessmentUseCaseInput {
            ProctoringSessionId = session.SessionId, Answers = await AnswersAsync(world, session.Questions, 2)
        });
        world.Context.ChangeTracker.Clear();
        var result = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        result.Status.Should().Be(TrialProgramRules.ParticipantReviewed);
        result.Essays.Should().BeEmpty();
        result.MentorName.Should().BeNull();
        result.EssayResults.Should().BeNull();
        result.Levels.Should().OnlyContain(level => level == 2);
        (await world.Context.ExamChoiceAnswers.CountAsync(a => a.TrialAssessmentId == submitted.AssessmentId))
            .Should().Be(session.Questions.Count);
        var program = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        program.Stage.Should().Be(TrialProgramRules.StageReported);
        program.Report!.Assessed.Should().Be(1);
        program.Report.Employees.Single().EmployeeId.ToString().Should().Be(before.Participants.Single().EmployeeId!.Value.ToString());
        await FluentActions.Awaiting(() => asEmployee.Submit.ExecuteAsync(new SubmitMyTrialAssessmentUseCaseInput { ProctoringSessionId = session.SessionId }))
            .Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task Deadline_publishes_only_submitted_results_and_never_invents_zero_results_for_absentees()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        var initial = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        initial.Participants.Count.Should().BeGreaterThan(1);
        await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddHours(1) });
        var assessment = new TrialAssessment { OrganizationId = initial.OrganizationId, EmployeeId = initial.Participants.First(p => p.EmployeeId.HasValue).EmployeeId!.Value, SubmittedAt = world.Clock.Now, ReviewedAt = world.Clock.Now, ChoiceScore = 10, ChoiceTotal = 18 };
        world.Context.TrialAssessments.Add(assessment);
        await world.Context.SaveChangesAsync();
        var live = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        live.Stage.Should().Be(TrialProgramRules.StageRequested);
        live.Report!.Assessed.Should().Be(1);
        live.Report.PublishedAt.Should().BeNull();
        live.ReportPublishedAt.Should().BeNull();
        world.Clock.Advance(TimeSpan.FromHours(2));
        var finished = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        finished.Stage.Should().Be(TrialProgramRules.StageReported);
        finished.Report!.Assessed.Should().Be(1);
        finished.Report.Employees.Should().ContainSingle();
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
            var persisted = await world.Context.Questions.AnyAsync(q => q.Id == question.QuestionId);
            answers.Add(new PulseAnswerInput
            {
                QuestionId = question.QuestionId,
                OptionId = !persisted ? question.Options[question.Tier <= correctTiers ? 0 : 1].OptionId : question.Tier <= correctTiers
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
            new GetMyTrialAssessmentUseCase(context, me, reader, ai, Microsoft.Extensions.Logging.Abstractions.NullLogger<GetMyTrialAssessmentUseCase>.Instance),
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
