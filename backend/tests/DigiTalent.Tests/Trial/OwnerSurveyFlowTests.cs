using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Lessons;
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
public class OwnerSurveyFlowTests
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
        world.Context.CapabilityCeilings.RemoveRange(world.Context.CapabilityCeilings
            .Where(c => c.OrganizationId == before.OrganizationId));
        await world.Context.SaveChangesAsync();
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
        result.ReportPublished.Should().BeTrue();
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

        var trialLearning = await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        trialLearning.AwaitingFramework.Should().BeTrue();
        trialLearning.HasTargets.Should().BeFalse();
        trialLearning.Courses.Should().NotBeEmpty().And.OnlyContain(c => c.Tier == 1 && c.CanWork);
        var intermediate = await world.Context.Courses.FirstAsync(c =>
            c.OrganizationId == before.OrganizationId && c.Code == "M1-I");
        await FluentActions.Awaiting(() => employeeUc.GetCourse.ExecuteAsync(
            new GetPulseCourseUseCaseInput { CourseId = intermediate.Id })).Should().ThrowAsync<NotFoundException>();
        var employeeProfile = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(u => u.GetRequiredOrganizationId()).Returns(before.OrganizationId);
        currentUser.SetupGet(u => u.EmployeeId).Returns(employeeProfile.Id);
        var lessonId = await (from lesson in world.Context.Lessons
                              join module in world.Context.CourseModules on lesson.ModuleId equals module.Id
                              where module.CourseId == intermediate.Id
                              select lesson.Id).FirstAsync();
        await FluentActions.Awaiting(() => new GetLessonUseCase(world.Context, currentUser.Object)
            .ExecuteAsync(new GetLessonInput { Id = lessonId })).Should().ThrowAsync<ForbiddenException>();

        var paused = await world.Context.PlatformCourses.FirstAsync(c => c.Level == 1 && c.Code == "M2-F");
        paused.SalesStatus = Statuses.PlatformCourseSales.Paused;
        await world.Context.SaveChangesAsync();
        (await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput())).Courses
            .Should().NotContain(c => c.Code == paused.Code);

        var categoryId = trialLearning.Domains.First().CategoryId;
        world.Context.CapabilityCeilings.Add(new CapabilityCeiling
        {
            OrganizationId = before.OrganizationId, CompetencyCategoryId = categoryId, CeilingLevel = 1,
        });
        await world.Context.SaveChangesAsync();
        var roadmap = await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        roadmap.AwaitingFramework.Should().BeFalse();
        roadmap.HasTargets.Should().BeTrue();

        await FluentActions.Awaiting(() => asEmployee.Submit.ExecuteAsync(new SubmitMyTrialAssessmentUseCaseInput { ProctoringSessionId = session.SessionId }))
            .Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task Stored_quiz_results_feed_live_report_without_a_manual_review_timestamp()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput { TestDeadline = world.Clock.Now.AddHours(1) });
        var requested = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        var categories = requested.Report!.Domains;
        var assessment = new TrialAssessment
        {
            OrganizationId = employee.OrganizationId, EmployeeId = employee.Id,
            ChoiceScore = (short)(categories.Count * 3 - 1), ChoiceTotal = (short)(categories.Count * 3),
            SubmittedAt = world.Clock.Now.AddDays(-1), EssayBasic = "Historical survey response",
        };
        world.Context.TrialAssessments.Add(assessment);
        await world.Context.SaveChangesAsync();
        var mine = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee);
        (await mine.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput())).Status.Should().Be(TrialProgramRules.ParticipantSubmitted);
        world.Context.TrialAssessmentDomains.AddRange(categories.Select((category, index) => new TrialAssessmentDomain
        {
            TrialAssessmentId = assessment.Id, CategoryId = category.CategoryId,
            BasicCorrect = (short)(index == 0 ? 0 : 1), BasicTotal = 1,
            IntermediateCorrect = 1, IntermediateTotal = 1,
            AdvancedCorrect = 1, AdvancedTotal = 1, SuggestedLevel = (short)(index == 0 ? 0 : 3),
        }));
        await world.Context.SaveChangesAsync();

        var result = await mine.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        result.Status.Should().Be(TrialProgramRules.ParticipantReviewed);
        result.ChoiceScore.Should().Be(assessment.ChoiceScore);
        result.ChoiceTotal.Should().Be(assessment.ChoiceTotal);
        result.ReportPublished.Should().BeFalse();

        var live = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        live.Stage.Should().Be(TrialProgramRules.StageRequested);
        live.Report!.Employees.Should().ContainSingle().Which.AssessmentId.Should().Be(assessment.Id);
        live.Report.Summary.Should().OnlyContain(domain => domain.Counts.Sum() == 1);
        live.Participants.Single(p => p.EmployeeId == employee.Id).Status.Should().Be(TrialProgramRules.ParticipantReviewed);

        world.Clock.Advance(TimeSpan.FromHours(2));
        (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Stage.Should().Be(TrialProgramRules.StageReported);
        (await world.Context.TrialAssessments.AsNoTracking().SingleAsync(a => a.Id == assessment.Id)).ReviewedAt.Should().BeNull();
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
