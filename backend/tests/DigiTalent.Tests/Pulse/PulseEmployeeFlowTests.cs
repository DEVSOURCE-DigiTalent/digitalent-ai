using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Tests.Pulse;

/// <summary>
/// Luồng nhân viên Pulse trên dữ liệu Development thật (docs/ui-redesign/16-pulse-product-flow-detailed.md,
/// docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md). employee@ = Kế toán, mục tiêu theo lĩnh vực 3/3/2/3/2/2;
/// A2-F đã hoàn thành (luồng cũ), A4-I đang học (luồng cũ), A1-I được giao chưa bắt đầu.
/// </summary>
public class PulseEmployeeFlowTests
{
    private const string CommentReason = "Cần nêu rõ phép tính kiểm tra được.";
    private const string Evidence = PulseTestWorld.Evidence;

    [Fact]
    public async Task Roadmap_CapsThePositionTargetByTheDepartmentCeiling_AndStartsEveryCourseWithAPreAssessment()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);

        var overview = await uc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Reviewer!.Name.Should().Be("Department Manager");
        overview.Reviewer.Role.Should().Be("Quản lý phòng ban");
        overview.Domains.Select(d => d.Target).Should().Equal(3, 3, 2, 3, 2, 2);
        overview.Domains.Select(d => d.PathTop).Should().Equal(new[] { 3, 3, 2, 3, 2, 2 }, "chưa lưu trần: trần = gợi ý từ yêu cầu vị trí, không thấp hơn mục tiêu");
        overview.Domains.Should().OnlyContain(d => d.Status == PulseDomainStatus.Pending || d.Number == 2, "chưa có bài nào được chấm; A2-F đã xong ở luồng cũ");
        overview.Domains.Sum(d => d.Competencies.Count).Should().Be(21);
        overview.Stats.RequiredCompetencies.Should().Be(21);
        overview.Domains[3].Competencies.Where(c => c.Core).Select(c => c.Code).Should().Equal("4.1", "4.2");
        overview.Stats.PathCourses.Should().Be(15);
        overview.Courses.Where(c => c.Zone == PulseCourseZone.Optional).Select(c => c.Code).Should().BeEquivalentTo("A3-A", "A5-A", "M6-A");

        var basic = overview.Courses.Single(c => c.Code == "A1-F");
        basic.SlotStatus.Should().Be(PulseSlotStatus.PreAssessment);
        basic.PreStatus.Should().Be(PulsePreStatus.Required);
        basic.CanStartPreAssessment.Should().BeTrue();
        basic.BlockReason.Should().Be(PulseBlockReason.PreAssessmentRequired, "phải làm bài đánh giá trước khi học");
        overview.Courses.Single(c => c.Code == "A2-F").ApprovedVia.Should().Be(PulseApprovedVia.Legacy);
        overview.Courses.Single(c => c.Code == "A2-I").SlotStatus.Should().Be(PulseSlotStatus.PreAssessment, "cấp Cơ bản đã xong ở luồng cũ");
        overview.Courses.Single(c => c.Code == "A1-I").SlotStatus.Should().Be(PulseSlotStatus.AfterPriorLevel, "có suất nhưng chưa đạt A1-F");
        overview.Courses.Single(c => c.Code == "A4-I").PreStatus.Should().Be(PulsePreStatus.NotNeeded, "đã bắt đầu học trước khi có bài đánh giá");
        overview.NextSteps.Select(c => c.Code).Should().Equal("A1-F", "A2-I", "A3-F");

        // Doanh nghiệp mở Giao tiếp và Giải quyết vấn đề tới Trung cấp; phòng OPS chỉ mở AI ở Cơ bản.
        var employee = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var categories = overview.Domains.Select(d => d.CategoryId).ToList();
        var levels = new short[] { 3, 2, 3, 3, 2, 3 };
        world.Context.CapabilityCeilings.AddRange(categories.Select((id, i) => new CapabilityCeiling
        {
            OrganizationId = employee.OrganizationId,
            CompetencyCategoryId = id,
            CeilingLevel = levels[i],
        }));
        world.Context.CapabilityCeilings.Add(new CapabilityCeiling
        {
            OrganizationId = employee.OrganizationId,
            DepartmentId = employee.DepartmentId,
            CompetencyCategoryId = categories[5],
            CeilingLevel = 1,
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var capped = await uc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        capped.Domains.Select(d => d.Ceiling).Should().Equal(3, 2, 3, 3, 2, 1);
        capped.Domains.Select(d => d.PathTop).Should().Equal(3, 2, 2, 3, 2, 1);
        capped.Courses.Where(c => c.Zone == PulseCourseZone.AboveCeiling).Select(c => c.Code).Should().BeEquivalentTo("A2-A", "A5-A", "M6-I", "M6-A");
        capped.Courses.Single(c => c.Code == "A2-A").SlotStatus.Should().Be(PulseSlotStatus.AboveCeiling);
        capped.Courses.Where(c => c.Zone == PulseCourseZone.Optional).Select(c => c.Code).Should().Equal("A3-A");
        capped.Stats.PathCourses.Should().Be(13);
        capped.Stats.AboveCeilingCourses.Should().Be(4);
    }

    [Fact]
    public async Task ManagerAsLearner_IsReviewedByTheOwner()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var overview = await manager.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Reviewer!.Name.Should().Be("Enterprise Owner");
        overview.Reviewer.Role.Should().Be("Chủ doanh nghiệp");
    }

    [Fact]
    public async Task PreAssessment_Passed_RecognisesTheCourseWithoutASeat_AndOpensTheNextLevel()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var course = await world.CourseAsync(employee, "A1-F");

        var info = await employee.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId });
        info.Status.Should().Be(PulsePreStatus.Required);
        info.CanStart.Should().BeTrue();
        info.Criteria.Should().HaveCount(3);
        info.Submission.Should().BeNull();

        var submitted = await world.SubmitPreAssessmentAsync(employee, "A1-F");
        submitted.DurationMs.Should().Be((long)TimeSpan.FromMinutes(20).TotalMilliseconds);
        var managerUser = await world.UserAsync(PulseTestWorld.ManagerEmail);
        (await world.Context.Notifications.AnyAsync(n => n.RecipientUserId == managerUser.Id && n.Type == SubmitPulsePreAssessmentUseCase.NotificationType))
            .Should().BeTrue("quản lý phòng ban nhận thông báo bài cần chấm");

        var pending = await world.CourseAsync(employee, "A1-F");
        pending.SlotStatus.Should().Be(PulseSlotStatus.PreReview);
        pending.BlockReason.Should().Be(PulseBlockReason.PreAssessmentPending);
        var again = () => employee.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.PreAssessment });
        (await again.Should().ThrowAsync<BadRequestException>("mỗi khóa một bài đánh giá trước khi học"))
            .Which.Errors.Single().Code.Should().Be(StartPulseProctoringUseCase.NotOpen);
        world.Context.ChangeTracker.Clear();

        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        queue.PreAssessmentCount.Should().Be(1);
        var item = queue.Items.Single(i => i.Kind == Statuses.ProctoringKind.PreAssessment);
        item.Status.Should().Be(PulseFinalStatus.Pending);
        item.MaxAttempts.Should().Be(1);
        item.Attempts.Single().EvidenceText.Should().Be(Evidence);
        item.Recording!.Segments.Should().HaveCount(2).And.OnlyContain(s => s.ContentPath != null);
        item.Recording.DurationMs.Should().Be(submitted.DurationMs);
        item.Recording.Events.Select(e => e.Kind).Should().Equal(Statuses.ProctoringEvent.Started, Statuses.ProctoringEvent.Submitted);

        var screen = item.Recording.Segments.Single(s => s.Track == Statuses.ProctoringTrack.Screen);
        var query = screen.ContentPath!.Split('?')[1].Split('&').Select(p => p.Split('=')).ToDictionary(p => p[0], p => p[1]);
        var content = await manager.RecordingContent.ExecuteAsync(new GetPulseRecordingContentUseCaseInput
        {
            RecordingId = screen.RecordingId,
            ExpiresAt = long.Parse(query["exp"]),
            Signature = query["sig"],
        });
        content.ContentType.Should().Be("video/webm");
        using (var copy = new MemoryStream())
        {
            await content.Content.CopyToAsync(copy);
            copy.Length.Should().Be(5);
        }

        var forged = () => manager.RecordingContent.ExecuteAsync(new GetPulseRecordingContentUseCaseInput
        {
            RecordingId = screen.RecordingId,
            ExpiresAt = long.Parse(query["exp"]),
            Signature = "00",
        });
        await forged.Should().ThrowAsync<ForbiddenException>();

        var decision = await manager.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = item.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Đạt đủ ba tiêu chí, nguồn rõ ràng.",
        });
        world.Context.ChangeTracker.Clear();
        decision.Status.Should().Be(PulsePreStatus.Passed);
        decision.EnrollmentId.Should().NotBeNull();
        var completed = await world.Context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == decision.EnrollmentId);
        completed.Status.Should().Be(Statuses.Enrollment.Completed);
        completed.ProgressPercent.Should().Be(100);

        var twice = () => manager.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = item.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.NotYet,
            Reason = "Đổi ý sau khi đã chấm.",
        });
        await twice.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var after = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var recognised = after.Courses.Single(c => c.Code == "A1-F");
        recognised.SlotStatus.Should().Be(PulseSlotStatus.Completed);
        recognised.ApprovedVia.Should().Be(PulseApprovedVia.PreAssessment);
        recognised.PreStatus.Should().Be(PulsePreStatus.Passed);
        recognised.ApprovedAt.Should().Be(world.Clock.Now);
        after.Domains[0].Verified.Should().Be(1);
        after.Domains[0].Source.Should().Be(PulseLevelSource.Course);
        after.Domains[0].Status.Should().Be(PulseDomainStatus.Gap);
        after.Courses.Single(c => c.Code == "A1-I").SlotStatus.Should().Be(PulseSlotStatus.PreAssessment, "cấp kế tiếp mở, cũng bắt đầu bằng bài đánh giá");
        after.LatestOutcome!.Via.Should().Be(PulseApprovedVia.PreAssessment);

        var outcomes = await employee.Outcomes.ExecuteAsync(new GetPulseOutcomesUseCaseInput());
        var outcome = outcomes.Items.Single(o => o.Kind == PulseOutcomeKind.PreAssessment);
        outcome.Subtitle.Should().Be("Khai thác dữ liệu và thông tin · Cơ bản");
        (await employee.Outcome.ExecuteAsync(new GetPulseOutcomeUseCaseInput { OutcomeId = outcome.Id })).ReviewNote.Should().Contain("ba tiêu chí");

        var employeeUser = await world.UserAsync(PulseTestWorld.EmployeeEmail);
        (await world.Context.Notifications.AnyAsync(n => n.RecipientUserId == employeeUser.Id && n.Type == DecidePulsePreAssessmentUseCase.NotificationType))
            .Should().BeTrue();
    }

    [Fact]
    public async Task PreAssessment_NotYet_OpensTheCourseForLearning_ThenTheProctoredFinal()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);

        var course = await world.OpenForLearningAsync(employee, "A4-F");
        course.PreStatus.Should().Be(PulsePreStatus.NotYet);
        course.SlotStatus.Should().Be(PulseSlotStatus.ToLearn);
        course.CanWork.Should().BeTrue();
        (await employee.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId }))
            .Submission!.DecisionReason.Should().NotBeNullOrEmpty();

        await world.PassAllModulesAsync(employee, course.CourseId);
        var ready = await world.CourseAsync(employee, "A4-F");
        ready.SlotStatus.Should().Be(PulseSlotStatus.FinalReady);
        ready.CanStartFinal.Should().BeTrue();
        ready.ProgressPercent.Should().Be(100);
        ready.Modules.Should().OnlyContain(m => m.Passed);

        var noSession = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = Guid.NewGuid() });
        (await noSession.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(PulseProctoring.SessionMismatch);
        world.Context.ChangeTracker.Clear();

        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);
        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var item = queue.Items.Single(i => i.Kind == Statuses.ProctoringKind.Final);
        item.SubmissionId.Should().Be(submitted.SubmissionId);
        item.Recording!.Kind.Should().Be(Statuses.ProctoringKind.Final);
        item.Attempts.Single().ProctoringSessionId.Should().Be(item.ProctoringSessionId);

        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Đạt đủ ba tiêu chí, nguồn rõ ràng." });
        world.Context.ChangeTracker.Clear();

        var after = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var passed = after.Courses.Single(c => c.Code == "A4-F");
        passed.SlotStatus.Should().Be(PulseSlotStatus.Completed);
        passed.ApprovedVia.Should().Be(PulseApprovedVia.Final);
        after.Domains[3].Verified.Should().Be(1);
        after.LatestOutcome!.Via.Should().Be(PulseApprovedVia.Final);
        var next = after.Courses.Single(c => c.Code == "A4-I");
        next.SlotStatus.Should().Be(PulseSlotStatus.InProgress, "A4-I đã học dở từ luồng cũ, không cần bài đánh giá");
        next.CanWork.Should().BeTrue();
        (await employee.Outcomes.ExecuteAsync(new GetPulseOutcomesUseCaseInput())).Items.Should().Contain(o => o.Kind == PulseOutcomeKind.Course);
    }

    [Fact]
    public async Task Proctoring_NeedsTheEntireScreen_OrderedChunks_AndBothRecordings()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var course = await world.CourseAsync(employee, "A3-F");

        var abandoned = await employee.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.PreAssessment });
        world.Context.ChangeTracker.Clear();
        var session = await employee.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.PreAssessment });
        world.Context.ChangeTracker.Clear();
        (await world.Context.ProctoringSessions.AsNoTracking().SingleAsync(s => s.Id == abandoned.SessionId)).Status
            .Should().Be(Statuses.ProctoringSession.Abandoned, "mở bài làm lần nữa bỏ phiên cũ");
        var final = () => employee.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.Final });
        await final.Should().ThrowAsync<ForbiddenException>("chưa học thì chưa có bài cuối khóa");
        world.Context.ChangeTracker.Clear();

        var window = () => employee.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
        {
            SessionId = session.SessionId, Track = Statuses.ProctoringTrack.Screen, ContentType = "video/webm", DisplaySurface = "window",
        });
        (await window.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(StartPulseRecordingUseCase.ScreenNotEntire);
        world.Context.ChangeTracker.Clear();

        var screen = await employee.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
        {
            SessionId = session.SessionId, Track = Statuses.ProctoringTrack.Screen, ContentType = "video/webm;codecs=vp8", DisplaySurface = "monitor",
        });
        world.Context.ChangeTracker.Clear();
        Task<AppendPulseRecordingChunkUseCaseOutput> Chunk(Guid recordingId, int seq) => employee.AppendChunk.ExecuteAsync(new AppendPulseRecordingChunkUseCaseInput
        {
            SessionId = session.SessionId, RecordingId = recordingId, Seq = seq, Content = new MemoryStream(new byte[] { 1, 2, 3, 4, 5 }),
        });

        (await FluentActions.Awaiting(() => Chunk(screen.RecordingId, 1)).Should().ThrowAsync<BadRequestException>())
            .Which.Errors.Single().Code.Should().Be(AppendPulseRecordingChunkUseCase.OutOfOrder);
        world.Context.ChangeTracker.Clear();
        (await Chunk(screen.RecordingId, 0)).Received.Should().Be(1);
        world.Context.ChangeTracker.Clear();
        (await Chunk(screen.RecordingId, 0)).Duplicate.Should().BeTrue("gửi lại sau lỗi mạng không ghép trùng");
        world.Context.ChangeTracker.Clear();
        (await Chunk(screen.RecordingId, 1)).SizeBytes.Should().Be(10);
        world.Context.ChangeTracker.Clear();
        var storedScreen = await world.Context.ProctoringRecordings.AsNoTracking().SingleAsync(r => r.Id == screen.RecordingId);
        world.Storage.Files[storedScreen.StoragePath!].Length.Should().Be(10);

        var withoutCamera = () => employee.SubmitPreAssessment.ExecuteAsync(new SubmitPulsePreAssessmentUseCaseInput
        {
            CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = session.SessionId,
        });
        (await withoutCamera.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(PulseProctoring.RecordingMissing);
        world.Context.ChangeTracker.Clear();

        await employee.RecordEvents.ExecuteAsync(new RecordPulseProctoringEventsUseCaseInput
        {
            SessionId = session.SessionId,
            Events =
            {
                new PulseProctoringEventInput { Kind = Statuses.ProctoringEvent.FaceCheckOn, OffsetMs = 1_000 },
                new PulseProctoringEventInput { Kind = Statuses.ProctoringEvent.ShareStopped, OffsetMs = 60_000 },
                new PulseProctoringEventInput { Kind = Statuses.ProctoringEvent.ShareResumed, OffsetMs = 75_000 },
                new PulseProctoringEventInput { Kind = Statuses.ProctoringEvent.TabHidden, OffsetMs = 90_000, DurationMs = 5_000 },
                new PulseProctoringEventInput { Kind = Statuses.ProctoringEvent.MultipleFaces, OffsetMs = 120_000, DurationMs = 4_000, Detail = "2 khuôn mặt" },
            },
        });
        world.Context.ChangeTracker.Clear();
        var resumed = await employee.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
        {
            SessionId = session.SessionId, Track = Statuses.ProctoringTrack.Screen, StartOffsetMs = 75_000, ContentType = "video/webm", DisplaySurface = "monitor",
        });
        world.Context.ChangeTracker.Clear();
        resumed.SegmentNo.Should().Be(2);
        await Chunk(resumed.RecordingId, 0);
        world.Context.ChangeTracker.Clear();
        var camera = await employee.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
        {
            SessionId = session.SessionId, Track = Statuses.ProctoringTrack.Camera, ContentType = "video/webm;codecs=vp8,opus",
        });
        world.Context.ChangeTracker.Clear();
        await Chunk(camera.RecordingId, 0);
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromMinutes(3));
        await employee.SubmitPreAssessment.ExecuteAsync(new SubmitPulsePreAssessmentUseCaseInput
        {
            CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = session.SessionId, Answers = await world.AnswersAsync(session.Questions),
        });
        world.Context.ChangeTracker.Clear();

        var late = () => Chunk(camera.RecordingId, 1);
        (await late.Should().ThrowAsync<BadRequestException>("phiên đã đóng khi nộp bài"))
            .Which.Errors.Single().Code.Should().Be(PulseProctoring.SessionClosed);
        world.Context.ChangeTracker.Clear();

        var recording = (await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).Items.Single().Recording!;
        recording.FlaggedCount.Should().Be(3);
        recording.Events.Where(e => e.Flagged).Select(e => e.Kind).Should().Equal(
            Statuses.ProctoringEvent.ShareStopped, Statuses.ProctoringEvent.TabHidden, Statuses.ProctoringEvent.MultipleFaces);
        recording.Risk.FaceCheck.Should().Be(PulseProctoringRisk.FaceCheckOn);
        recording.Risk.Score.Should().Be(33, "ngừng chia sẻ 15 giây (12) + rời tab (6) + hai khuôn mặt (15)");
        recording.Risk.Level.Should().Be(PulseProctoringRisk.Medium);
        recording.Risk.Moments.Select(m => m.StartMs).Should().Equal(60_000, 90_000, 120_000);
        var screens = recording.Segments.Where(s => s.Track == Statuses.ProctoringTrack.Screen).OrderBy(s => s.SegmentNo).ToList();
        screens.Should().HaveCount(2);
        screens[0].EndOffsetMs.Should().Be(75_000, "đoạn cũ khép tại lúc chia sẻ lại");
        screens[1].EndOffsetMs.Should().Be(recording.DurationMs, "đoạn còn mở khép khi nộp bài");
        screens[0].DisplaySurface.Should().Be("monitor");
    }

    [Fact]
    public async Task ModuleQuiz_NeedsViewedSlides_PreviousModule_AndEveryAnswerRight()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.OpenForLearningAsync(uc, "A1-F");

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("MODULE");
        detail.Modules.Should().HaveCountGreaterThan(1);
        detail.Modules.Select(m => m.Unlocked).Should().StartWith(new[] { true, false });
        var first = detail.Modules[0];
        var second = detail.Modules[1];

        var module = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = first.ModuleId });
        module.Slides.Should().NotBeEmpty().And.OnlyContain(s => !string.IsNullOrEmpty(s.ContentBody));
        module.Quiz!.Questions.Should().HaveCount(PulseRules.ModuleQuizDrawSize);
        module.Quiz.AttemptNo.Should().Be(1);
        var wrongAnswers = new List<PulseAnswerInput>();
        foreach (var question in module.Quiz.Questions)
        {
            wrongAnswers.Add(new PulseAnswerInput { QuestionId = question.QuestionId, OptionId = await world.WrongOptionAsync(question.QuestionId) });
        }

        var beforeViewing = () => uc.SubmitQuiz.ExecuteAsync(new SubmitPulseModuleQuizUseCaseInput { CourseId = course.CourseId, ModuleId = first.ModuleId, Answers = wrongAnswers });
        (await beforeViewing.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(PulseBlockReason.SlidesNotViewed);
        world.Context.ChangeTracker.Clear();

        var secondModule = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = second.ModuleId });
        secondModule.Quiz.Should().BeNull();
        secondModule.QuizBlockReason.Should().Be(PulseBlockReason.PreviousModuleRequired);

        await uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = first.ModuleId });
        world.Context.ChangeTracker.Clear();
        var failed = await uc.SubmitQuiz.ExecuteAsync(new SubmitPulseModuleQuizUseCaseInput { CourseId = course.CourseId, ModuleId = first.ModuleId, Answers = wrongAnswers });
        failed.Passed.Should().BeFalse();
        failed.Wrong.Should().HaveCount(2).And.OnlyContain(w => w.LessonId != null && !string.IsNullOrEmpty(w.PageTitle), "chỉ báo trang cần xem lại");
        failed.Review!.Pages.Select(p => p.LessonId).Should().BeEquivalentTo(failed.Wrong.Select(w => w.LessonId!.Value).Distinct());
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromMinutes(5));
        foreach (var page in failed.Review.Pages)
        {
            await uc.MarkPage.ExecuteAsync(new MarkPulsePageViewedUseCaseInput { CourseId = course.CourseId, ModuleId = first.ModuleId, LessonId = page.LessonId });
            world.Context.ChangeTracker.Clear();
        }

        var passed = await world.PassModuleAsync(uc, course.CourseId, first.ModuleId);
        passed.Passed.Should().BeTrue();
        passed.NextModuleId.Should().Be(second.ModuleId);

        var enrollment = await world.Context.Enrollments.SingleAsync(e => e.CourseId == course.CourseId);
        enrollment.Status.Should().Be(Statuses.Enrollment.InProgress, "khóa Cơ bản tự mở lượt học khi bắt đầu");
        enrollment.ProgressPercent.Should().BeGreaterThan(0);
        (await world.Context.AssessmentAttempts.CountAsync(a => a.EnrollmentId == enrollment.Id)).Should().Be(2, "mỗi lần làm đều được lưu");
        (await world.CourseAsync(uc, "A1-F")).ProgressPercent.Should().BeGreaterThan(0).And.BeLessThan(100);
    }

    [Fact]
    public async Task ModuleQuiz_AfterAWrongAttempt_NeedsTheRelatedPageReopened_ThenDrawsOtherQuestions()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.OpenForLearningAsync(uc, "A1-F");
        var moduleId = (await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId })).Modules[0].ModuleId;
        Task<GetPulseModuleUseCaseOutput> Module() => uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = moduleId });
        Task<SubmitPulseModuleQuizUseCaseOutput> Submit(List<PulseAnswerInput> answers, int? attemptNo) =>
            uc.SubmitQuiz.ExecuteAsync(new SubmitPulseModuleQuizUseCaseInput { CourseId = course.CourseId, ModuleId = moduleId, AttemptNo = attemptNo, Answers = answers });
        async Task<List<PulseAnswerInput>> Answers(PulseQuizDto quiz, int wrongCount)
        {
            var answers = new List<PulseAnswerInput>();
            foreach (var (question, i) in quiz.Questions.Select((q, i) => (q, i)))
            {
                answers.Add(new PulseAnswerInput
                {
                    QuestionId = question.QuestionId,
                    OptionId = i < wrongCount ? await world.WrongOptionAsync(question.QuestionId) : await world.CorrectOptionAsync(question.QuestionId),
                });
            }

            return answers;
        }

        await uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = moduleId });
        world.Context.ChangeTracker.Clear();
        var first = (await Module()).Quiz!;
        var firstAnswers = await Answers(first, wrongCount: 1);
        world.Clock.Advance(TimeSpan.FromMinutes(1));
        var failed = await Submit(firstAnswers, first.AttemptNo);
        world.Context.ChangeTracker.Clear();
        failed.Score.Should().Be(1);
        var wrongPage = failed.Wrong.Single().LessonId!.Value;
        failed.Review!.Pages.Should().ContainSingle(p => p.LessonId == wrongPage);

        // Chưa mở lại trang: không có câu hỏi, nộp cũng bị chặn — kể cả khi trang đã đọc trước lần làm.
        var blocked = await Module();
        blocked.Quiz.Should().BeNull();
        blocked.QuizBlockReason.Should().Be(PulseBlockReason.ReviewRequired);
        blocked.Review!.Done.Should().BeFalse();
        blocked.Review.Pages.Single().LessonId.Should().Be(wrongPage);
        (await FluentActions.Awaiting(() => Submit(firstAnswers, first.AttemptNo)).Should().ThrowAsync<BadRequestException>())
            .Which.Errors.Single().Code.Should().Be(PulseBlockReason.ReviewRequired);
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromMinutes(3));
        var otherPage = blocked.Slides.Select(s => s.LessonId).FirstOrDefault(id => id != wrongPage);
        if (otherPage != Guid.Empty)
        {
            var other = await uc.MarkPage.ExecuteAsync(new MarkPulsePageViewedUseCaseInput { CourseId = course.CourseId, ModuleId = moduleId, LessonId = otherPage });
            other.Review!.Done.Should().BeFalse("mở trang khác không thay cho trang của câu chưa đúng");
            world.Context.ChangeTracker.Clear();
        }

        var reviewed = await uc.MarkPage.ExecuteAsync(new MarkPulsePageViewedUseCaseInput { CourseId = course.CourseId, ModuleId = moduleId, LessonId = wrongPage });
        world.Context.ChangeTracker.Clear();
        reviewed.Review!.Done.Should().BeTrue();

        var second = (await Module()).Quiz!;
        second.AttemptNo.Should().Be(2);
        second.Questions.Select(q => q.QuestionId).Should().NotIntersectWith(first.Questions.Select(q => q.QuestionId), "lần sau là câu khác");
        (await FluentActions.Awaiting(() => Submit(firstAnswers, first.AttemptNo)).Should().ThrowAsync<BadRequestException>())
            .Which.Errors.Single().Code.Should().Be(PulseBlockReason.QuizChanged);
        world.Context.ChangeTracker.Clear();

        var passed = await Submit(await Answers(second, wrongCount: 0), second.AttemptNo);
        world.Context.ChangeTracker.Clear();
        passed.Passed.Should().BeTrue();
        passed.Review.Should().BeNull();
        var after = await Module();
        after.QuizPassed.Should().BeTrue();
        after.Review.Should().BeNull();
    }

    [Fact]
    public async Task ModuleQuizBank_HasTwoQuestionsPerPage_AndTopsUpALegacyTwoQuestionQuiz()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var db = world.Context;
        var quizIds = await db.Assessments.AsNoTracking()
            .Where(a => a.ModuleId != null && a.AssessmentType == Statuses.AssessmentType.Quiz)
            .Select(a => a.Id)
            .ToListAsync();
        var sortOrdersByQuiz = (await db.AssessmentQuestions.AsNoTracking().Where(l => quizIds.Contains(l.AssessmentId)).ToListAsync())
            .GroupBy(l => l.AssessmentId)
            .Select(g => g.Select(l => l.SortOrder).Order().ToList())
            .ToList();
        quizIds.Should().NotBeEmpty();
        sortOrdersByQuiz.Should().HaveCount(quizIds.Count).And.OnlyContain(orders => orders.SequenceEqual(new[] { 1, 2, 3, 4, 5, 6 }));

        // Bản cũ: mô đun thứ 2 của khóa chỉ có cặp câu tình huống (nay là câu 3–4), xếp ở vị trí 1–2.
        var course = await db.Courses.AsNoTracking().SingleAsync(c => c.Code == "A1-F");
        var module = await db.CourseModules.AsNoTracking()
            .Where(m => m.CourseId == course.Id && m.Status == Statuses.CourseContent.Active)
            .OrderBy(m => m.SortOrder).Skip(1).FirstAsync();
        var quizId = await db.Assessments.AsNoTracking().Where(a => a.ModuleId == module.Id).Select(a => a.Id).SingleAsync();
        var links = await db.AssessmentQuestions.Where(l => l.AssessmentId == quizId).ToListAsync();
        var legacy = links.Where(l => l.SortOrder is 3 or 4).OrderBy(l => l.SortOrder).ToList();
        legacy[0].SortOrder = 1;
        legacy[1].SortOrder = 2;
        db.AssessmentQuestions.RemoveRange(links.Except(legacy));
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var author = await db.Users.AsNoTracking().FirstAsync(u => u.Email == PulseTestWorld.OwnerEmail);
        await PulseContentSeeder.SeedAsync(db, course.OrganizationId, author.Id);
        await PulseContentSeeder.SeedAsync(db, course.OrganizationId, author.Id);
        db.ChangeTracker.Clear();

        var topped = await db.AssessmentQuestions.AsNoTracking().Where(l => l.AssessmentId == quizId).ToListAsync();
        topped.Select(l => l.SortOrder).Order().Should().Equal(1, 2, 3, 4, 5, 6);
        topped.Where(l => l.SortOrder is 3 or 4).Select(l => l.QuestionId)
            .Should().BeEquivalentTo(legacy.Select(l => l.QuestionId), "câu cũ được giữ và về đúng trang tình huống");
    }

    [Fact]
    public async Task ExamChoice_TenCourseQuizQuestions_HiddenUntilReviewed_AndBelowTheMarkCannotPass()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var course = await world.CourseAsync(employee, "A1-F");

        var info = await employee.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId });
        info.ChoiceCount.Should().Be(10);
        info.ChoicePassMark.Should().Be(7);

        // Đề phát lúc bắt đầu phiên: 10 câu rút từ câu ôn tập của các mô đun, rải đều mọi mô đun.
        var sessionId = await world.ProctorAsync(employee, course.CourseId, Statuses.ProctoringKind.PreAssessment);
        var paper = world.LastPaper;
        paper.Select(q => q.Number).Should().Equal(Enumerable.Range(1, 10));
        paper.Select(q => q.QuestionId).Should().OnlyHaveUniqueItems();
        paper.Select(q => q.Content).Should().OnlyHaveUniqueItems("câu mẫu lặp giữa các mô đun chỉ vào đề một lần");
        var bank = await (
                from assessment in world.Context.Assessments.AsNoTracking()
                join link in world.Context.AssessmentQuestions.AsNoTracking() on assessment.Id equals link.AssessmentId
                where assessment.CourseId == course.CourseId && assessment.ModuleId != null
                select new { link.QuestionId, ModuleId = assessment.ModuleId!.Value })
            .ToListAsync();
        var drawn = bank.Where(b => paper.Any(q => q.QuestionId == b.QuestionId)).ToList();
        drawn.Should().HaveCount(10, "mọi câu của đề đều là câu ôn tập của khóa");
        drawn.Select(b => b.ModuleId).Distinct().Should().HaveCount(bank.Select(b => b.ModuleId).Distinct().Count());

        var nine = (await world.AnswersAsync(paper)).Take(9).ToList();
        var incomplete = () => employee.SubmitPreAssessment.ExecuteAsync(new SubmitPulsePreAssessmentUseCaseInput
        {
            CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = sessionId, Answers = nine,
        });
        (await incomplete.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(PulseExamPaper.AnswersInvalid);
        world.Context.ChangeTracker.Clear();

        var submitted = await employee.SubmitPreAssessment.ExecuteAsync(new SubmitPulsePreAssessmentUseCaseInput
        {
            CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = sessionId, Answers = await world.AnswersAsync(paper, correct: 6),
        });
        world.Context.ChangeTracker.Clear();
        (await employee.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId }))
            .Submission!.Choice.Should().BeNull("nhân viên chỉ biết kết quả khi người chấm chấm xong");

        var item = (await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).Items.Single(i => i.Kind == Statuses.ProctoringKind.PreAssessment);
        var choice = item.Attempts.Single().Choice!;
        (choice.Score, choice.Total, choice.PassMark, choice.Passed).Should().Be((6, 10, 7, false));
        choice.Items!.Select(i => i.Number).Should().Equal(Enumerable.Range(1, 10));
        choice.Items!.Select(i => i.IsCorrect).Should().Equal(true, true, true, true, true, true, false, false, false, false);
        choice.Items![0].Selected.Should().Be(choice.Items[0].Correct);
        choice.Items![9].Selected.Should().NotBe(choice.Items[9].Correct);
        choice.Items![0].Question.Should().NotBeNullOrWhiteSpace();

        var pass = () => manager.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = submitted.PreAssessmentId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Đạt đủ ba tiêu chí, nguồn rõ ràng.",
        });
        (await pass.Should().ThrowAsync<BadRequestException>("6/10 câu trắc nghiệm chưa đủ 7 câu"))
            .Which.Errors.Single().Code.Should().Be(PulseExamPaper.BelowPass);
        world.Context.ChangeTracker.Clear();
        await manager.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = submitted.PreAssessmentId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = "Trắc nghiệm 6/10, hãy học khóa.",
        });
        world.Context.ChangeTracker.Clear();
        var decided = (await employee.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId })).Submission!.Choice!;
        (decided.Score, decided.Total, decided.Passed).Should().Be((6, 10, false));
        decided.Items.Should().BeNull("nhân viên không thấy đáp án");

        // Bài cuối khóa: đề khác bài đánh giá; đủ 7 câu đúng thì người chấm cho đạt được.
        await world.PassAllModulesAsync(employee, course.CourseId);
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).ChoiceCount.Should().Be(10);
        var final = await world.SubmitFinalAsync(employee, course.CourseId, correct: 7);
        world.LastPaper.Select(q => q.QuestionId).Intersect(paper.Select(q => q.QuestionId)).Should().HaveCountLessThanOrEqualTo(2, "ngân hàng 18 câu: lần làm sau rút nhóm câu kế tiếp");
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Attempts.Single().Choice.Should().BeNull();
        var finalChoice = (await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).Items
            .Single(i => i.Kind == Statuses.ProctoringKind.Final).Attempts.Single().Choice!;
        (finalChoice.Score, finalChoice.Passed).Should().Be((7, true));
        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = final.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Trắc nghiệm 7/10, tự luận đủ ba tiêu chí.",
        });
        world.Context.ChangeTracker.Clear();
        var approved = await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId });
        approved.Status.Should().Be(PulseFinalStatus.Approved);
        approved.Attempts.Single().Choice!.Score.Should().Be(7);
    }

    [Fact]
    public async Task FinalAssignment_RetryWindow_ThenFlag_ThenSupport()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var course = await world.OpenForLearningAsync(employee, "A1-F");

        var early = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = Guid.NewGuid() });
        (await early.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("MODULES_INCOMPLETE");
        world.Context.ChangeTracker.Clear();

        await world.PassAllModulesAsync(employee, course.CourseId);
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.Ready);

        var first = await world.SubmitFinalAsync(employee, course.CourseId);
        first.AttemptNo.Should().Be(1);
        var managerUser = await world.UserAsync(PulseTestWorld.ManagerEmail);
        (await world.Context.Notifications.AnyAsync(n => n.RecipientUserId == managerUser.Id && n.Type == SubmitPulseFinalUseCase.NotificationType))
            .Should().BeTrue("quản lý phòng ban nhận thông báo bài cần chấm");

        var whilePending = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = Guid.NewGuid() });
        await whilePending.Should().ThrowAsync<ConflictException>();
        var proctorWhilePending = () => employee.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.Final });
        await proctorWhilePending.Should().ThrowAsync<BadRequestException>();
        world.Context.ChangeTracker.Clear();

        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var item = queue.Items.Single(i => i.Status == PulseFinalStatus.Pending);
        item.Kind.Should().Be(Statuses.ProctoringKind.Final);
        item.AiHint!.Checks.Should().Equal(true, true, true);
        item.DomainName.Should().Be(course.DomainName, "the queue names a domain like the employee pages, without the \"1. \" of the category");
        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = item.SubmissionId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = CommentReason });
        world.Context.ChangeTracker.Clear();

        var waiting = await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId });
        waiting.Status.Should().Be(PulseFinalStatus.RetryWait);
        waiting.CanSubmit.Should().BeFalse();
        waiting.ClosedMessage.Should().NotBeNullOrEmpty();
        waiting.Attempts.Single().RetryOpensAt.Should().Be(world.Clock.Now.AddHours(48));
        waiting.Attempts.Single().RetryDueAt.Should().Be(world.Clock.Now.AddHours(48).AddDays(7));
        waiting.Attempts.Single().DecisionReason.Should().Be(CommentReason);

        world.Clock.Advance(TimeSpan.FromHours(49));
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.RetryReady);
        var second = await world.SubmitFinalAsync(employee, course.CourseId, Evidence + " (lần 2)");
        second.AttemptNo.Should().Be(2);

        var supportTooEarly = () => manager.Support.ExecuteAsync(new RecordPulseFinalSupportUseCaseInput { SubmissionId = second.SubmissionId, Action = Statuses.FinalSupportAction.Coaching });
        await supportTooEarly.Should().ThrowAsync<BadRequestException>();
        world.Context.ChangeTracker.Clear();

        var decision = await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = second.SubmissionId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = "Vẫn thiếu kết luận có căn cứ." });
        world.Context.ChangeTracker.Clear();
        decision.Status.Should().Be(PulseFinalStatus.Flagged);

        await manager.Support.ExecuteAsync(new RecordPulseFinalSupportUseCaseInput { SubmissionId = second.SubmissionId, Action = Statuses.FinalSupportAction.Coaching, Note = "Kèm cặp hai buổi." });
        world.Context.ChangeTracker.Clear();

        var flagged = await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId });
        flagged.Status.Should().Be(PulseFinalStatus.Flagged);
        flagged.Attempts.Last().SupportAction.Should().Be(Statuses.FinalSupportAction.Coaching);
        var third = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = Guid.NewGuid() });
        await third.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var overview = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Courses.Single(c => c.Code == "A1-F").SlotStatus.Should().Be(PulseSlotStatus.NeedsSupport);
        overview.Domains[0].Verified.Should().Be(0, "hai lần chưa đạt không nâng mức năng lực");
    }

    [Fact]
    public async Task MissingTheSecondDeadline_IsASupportCase()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var course = await world.OpenForLearningAsync(employee, "A1-F");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var first = await world.SubmitFinalAsync(employee, course.CourseId);
        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = first.SubmissionId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = CommentReason });
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromDays(10));
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.DeadlineMissed);
        var late = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence, ProctoringSessionId = Guid.NewGuid() });
        await late.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        queue.DeadlineMissedCount.Should().Be(1);
        await manager.Support.ExecuteAsync(new RecordPulseFinalSupportUseCaseInput { SubmissionId = first.SubmissionId, Action = Statuses.FinalSupportAction.FreshCycle });
    }

    [Fact]
    public async Task PaidCourseWithoutSeat_ShowsOnlyTheFirstSampleSlide()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "A3-I");
        course.Access.Should().Be(PulseCourseAccess.Preview);
        course.SlotStatus.Should().Be(PulseSlotStatus.AfterPriorLevel);

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("LOCKED");
        detail.Modules.Select(m => m.Viewable).Should().Equal(new[] { true }.Concat(Enumerable.Repeat(false, detail.Modules.Count - 1)));

        var sample = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        sample.Sample.Should().BeTrue();
        sample.Slides.Should().HaveCount(1);
        sample.Quiz.Should().BeNull();

        var locked = () => uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[1].ModuleId });
        await locked.Should().ThrowAsync<ForbiddenException>();
        var record = () => uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        await record.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task BeforeThePreAssessment_SlidesAreReadable_ButProgressIsNotRecorded()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "A1-F");
        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("PRE_ASSESSMENT");

        foreach (var item in detail.Modules.Where(m => m.HasQuiz))
        {
            item.QuizBankQuestionCount.Should().BeGreaterThanOrEqualTo(item.QuizQuestionCount);
            item.QuizQuestionCount.Should().Be(Math.Min(2, item.QuizBankQuestionCount));
        }

        var module = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        module.Slides.Should().HaveCountGreaterThan(1);
        module.QuizBlockReason.Should().Be(PulseBlockReason.PreAssessmentRequired);
        var record = () => uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        await record.Should().ThrowAsync<ForbiddenException>();
        (await world.Context.Enrollments.CountAsync(e => e.CourseId == course.CourseId)).Should().Be(0);
    }

    [Fact]
    public async Task ManagerOfAnotherDepartment_CannotSeeOrDecide()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.OpenForLearningAsync(employee, "A1-F");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);
        var pre = await world.SubmitPreAssessmentAsync(employee, "A3-F");

        var organizationId = (await world.EmployeeAsync(PulseTestWorld.EmployeeEmail)).OrganizationId;
        var otherDepartment = new Department { OrganizationId = organizationId, Code = "SALES-X", Name = "Kinh doanh" };
        world.Context.Departments.Add(otherDepartment);
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var outsider = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager, otherDepartment.Id);
        (await outsider.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).Items.Should().BeEmpty();
        var decide = () => outsider.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Không thuộc phòng ban." });
        await decide.Should().ThrowAsync<NotFoundException>();
        var decidePre = () => outsider.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput { PreAssessmentId = pre.PreAssessmentId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Không thuộc phòng ban." });
        await decidePre.Should().ThrowAsync<NotFoundException>();

        var owner = await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner);
        (await owner.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).PendingCount.Should().Be(2, "chủ doanh nghiệp thấy toàn tổ chức");

        var self = () => employee.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Tự duyệt bài của mình." });
        await self.Should().ThrowAsync<NotFoundException>("không ai tự chấm bài của chính mình");
        var selfPre = () => employee.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput { PreAssessmentId = pre.PreAssessmentId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Tự duyệt bài của mình." });
        await selfPre.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Practice_ListsWorkableFinals_AndSubmittedPreAssessments()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.OpenForLearningAsync(uc, "A1-F");
        await world.PassAllModulesAsync(uc, course.CourseId);
        await world.SubmitPreAssessmentAsync(uc, "A3-F");

        var practice = await uc.Practice.ExecuteAsync(new GetPulsePracticeUseCaseInput());
        practice.Finals.Select(f => f.Course.Code).Should().Contain("A1-F").And.Contain("A2-F")
            .And.NotContain("A1-I", "suất đang giữ nằm ở lộ trình, chưa phải việc cần làm");
        practice.Finals.First().Course.FinalStatus.Should().Be(PulseFinalStatus.Ready, "việc nộp được xếp lên đầu");
        practice.PreAssessments.Select(p => p.Course.Code).Should().Equal("A3-F", "A1-F");
        practice.PreAssessments.First().LastDecision.Should().BeNull("bài chờ chấm xếp trước");
        practice.Criteria.Should().HaveCount(3);
    }
}
