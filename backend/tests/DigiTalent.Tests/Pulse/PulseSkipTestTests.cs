using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Pulse;

/// <summary>
/// Bài kiểm tra đầu vào của khóa (PulseSkipTest): 20 câu trắc nghiệm từ ngân hàng ôn tập các mô-đun, tự chấm, không giám sát,
/// không người chấm, một lần làm, bắt buộc trước khi học. Đúng từ 80% thì mọi mô-đun được tính là đã qua và bài đánh giá cuối
/// khóa mở; chưa đạt (hoặc bỏ dở quá giờ) thì học tuần tự.
/// </summary>
public class PulseSkipTestTests
{
    [Fact]
    public async Task Passing_CountsEveryModuleAsPassed_AndUnlocksTheFinal()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "M1-F");
        course.PreStatus.Should().Be(PulsePreStatus.Required, "bài đầu vào bắt buộc trước khi học");

        var before = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        before.NextAction.Should().Be("PRE_ASSESSMENT");
        var learnFirst = () => uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = before.Modules[0].ModuleId });
        await learnFirst.Should().ThrowAsync<ForbiddenException>("chưa làm bài đầu vào thì chưa học được");
        world.Context.ChangeTracker.Clear();

        var test = await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        test.Status.Should().Be(PulseSkipTestStatus.Available);
        test.QuestionCount.Should().BeInRange(PulseRules.SkipTestMinQuestions, PulseRules.SkipTestQuestionCount);
        test.PassMark.Should().Be(PulseRules.SkipTestPassMark(test.QuestionCount));
        test.AttemptsLeft.Should().Be(1);
        test.Attempt.Should().BeNull("đề chỉ phát khi bắt đầu");

        var started = await uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        world.Context.ChangeTracker.Clear();
        started.Status.Should().Be(PulseSkipTestStatus.InProgress);
        started.Attempt!.AttemptNo.Should().Be(1);
        started.Attempt.DeadlineAt.Should().Be(world.Clock.Now.AddMinutes(PulseRules.SkipTestTimeLimitMinutes));
        started.Attempt.Questions.Should().HaveCount(test.QuestionCount);
        started.Attempt.Questions.Select(q => q.QuestionId).Should().OnlyHaveUniqueItems();
        (await world.Context.Enrollments.SingleAsync(e => e.CourseId == course.CourseId)).Status
            .Should().Be(Statuses.Enrollment.NotStarted, "đang làm bài đầu vào chưa tính là bắt đầu học");
        await learnFirst.Should().ThrowAsync<ForbiddenException>("đang làm bài đầu vào thì chưa mở mô-đun");
        world.Context.ChangeTracker.Clear();

        var again = await uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        world.Context.ChangeTracker.Clear();
        again.Attempt!.AttemptNo.Should().Be(1, "bắt đầu lại khi đang làm trả về đúng lần đang mở");
        again.Attempt.Questions.Select(q => q.QuestionId).Should().Equal(started.Attempt.Questions.Select(q => q.QuestionId));

        world.Clock.Advance(TimeSpan.FromMinutes(10));
        var answers = await world.AnswersAsync(started.Attempt.Questions, test.PassMark);
        var result = await uc.SubmitSkipTest.ExecuteAsync(new SubmitPulseSkipTestUseCaseInput { CourseId = course.CourseId, AttemptNo = 1, Answers = answers });
        world.Context.ChangeTracker.Clear();

        result.Result.Passed.Should().BeTrue();
        result.Result.Score.Should().Be(test.PassMark);
        result.Result.Modules.Sum(m => m.Total).Should().Be(test.QuestionCount);
        result.Result.Modules.Select(m => m.Index).Should().HaveCountGreaterThan(1, "đề rải đều các mô-đun");
        result.FinalUnlocked.Should().BeTrue();
        result.Status.Should().Be(PulseSkipTestStatus.Passed);

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("FINAL");
        detail.Modules.Should().OnlyContain(m => m.Passed);
        detail.SkipTest!.Status.Should().Be(PulseSkipTestStatus.Passed);
        var enrollment = await world.Context.Enrollments.SingleAsync(e => e.CourseId == course.CourseId);
        enrollment.ProgressPercent.Should().Be(100);
        enrollment.Status.Should().Be(Statuses.Enrollment.InProgress);
        (await world.Context.CoursePreAssessments.CountAsync()).Should().Be(0, "không còn bài đầu vào có tự luận cho người chấm");

        var final = await world.SubmitFinalAsync(uc, course.CourseId);
        final.Should().NotBeNull("bài cuối khóa mở sau khi đạt bài đầu vào");
    }

    [Fact]
    public async Task BelowThePassMark_OpensTheModulesForLearning_AndUsesUpTheOnlyAttempt()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "M1-F");

        var started = await uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        world.Context.ChangeTracker.Clear();
        var answers = await world.AnswersAsync(started.Attempt!.Questions, started.PassMark - 1);
        var result = await uc.SubmitSkipTest.ExecuteAsync(new SubmitPulseSkipTestUseCaseInput { CourseId = course.CourseId, AttemptNo = 1, Answers = answers });
        world.Context.ChangeTracker.Clear();
        result.Result.Passed.Should().BeFalse();
        result.Result.Score.Should().Be(started.PassMark - 1);
        result.FinalUnlocked.Should().BeFalse();

        PulseRules.SkipTestMaxAttempts.Should().Be(1, "bài kiểm tra đầu vào chỉ được làm một lần");
        var test = await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        test.Status.Should().Be(PulseSkipTestStatus.Exhausted);
        test.AttemptsLeft.Should().Be(0);
        test.Results.Should().ContainSingle();

        var startAgain = () => uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        (await startAgain.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("SKIP_TEST_EXHAUSTED");
        world.Context.ChangeTracker.Clear();

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("MODULE", "chưa đạt thì học tuần tự");
        detail.Course.PreStatus.Should().Be(PulsePreStatus.NotNeeded);
        detail.Modules.Should().OnlyContain(m => !m.Passed);
        var first = await world.PassModuleAsync(uc, course.CourseId, detail.Modules[0].ModuleId);
        first.Passed.Should().BeTrue("mô-đun mở để học sau bài đầu vào");
    }

    [Fact]
    public async Task SubmittingAfterTheTimeLimit_DoesNotPass()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "M1-F");

        var started = await uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        world.Context.ChangeTracker.Clear();
        world.Clock.Advance(TimeSpan.FromMinutes(PulseRules.SkipTestTimeLimitMinutes) + TimeSpan.FromSeconds(PulseRules.SkipTestGraceSeconds + 1));

        var answers = await world.AnswersAsync(started.Attempt!.Questions);
        var result = await uc.SubmitSkipTest.ExecuteAsync(new SubmitPulseSkipTestUseCaseInput { CourseId = course.CourseId, AttemptNo = 1, Answers = answers });
        world.Context.ChangeTracker.Clear();

        result.Result.Passed.Should().BeFalse();
        result.Result.Expired.Should().BeTrue();
        result.Status.Should().Be(PulseSkipTestStatus.Exhausted, "chỉ có một lần làm");
    }

    [Fact]
    public async Task AbandonedAttempt_UsesUpTheOnlyAttempt_ButCanBeResumedWithinTheTimeLimit()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "M1-F");

        var started = await uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromMinutes(15));
        var resumed = await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        resumed.Status.Should().Be(PulseSkipTestStatus.InProgress, "tải lại trang trong giờ thì làm tiếp đúng đề cũ");
        resumed.Attempt!.Questions.Select(q => q.QuestionId).Should().Equal(started.Attempt!.Questions.Select(q => q.QuestionId));

        world.Clock.Advance(TimeSpan.FromHours(2));
        var abandoned = await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        abandoned.Status.Should().Be(PulseSkipTestStatus.Exhausted);
        abandoned.Results.Should().ContainSingle().Which.Expired.Should().BeTrue();

        var startAgain = () => uc.StartSkipTest.ExecuteAsync(new StartPulseSkipTestUseCaseInput { CourseId = course.CourseId });
        (await startAgain.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("SKIP_TEST_EXHAUSTED");
        (await world.Context.AssessmentAttempts.CountAsync(a => a.Status == Statuses.AssessmentAttempt.Started)).Should().Be(1, "không mở lần làm mới");
        world.Context.ChangeTracker.Clear();

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("MODULE", "bỏ dở quá giờ vẫn tính là đã làm bài đầu vào, khóa mở để học");
    }

    [Fact]
    public async Task OldPendingPreAssessment_IsReplacedByTheEntryTest_AndLeavesTheReviewQueue()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var owner = await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner);
        var mentor = await world.AsAsync("mentor@digitalent.ai", Roles.Mentor);

        // Bài đánh giá đầu vào cũ (trắc nghiệm + tự luận) nộp trước khi đổi luồng, còn chờ người chấm.
        var pending = await world.SeedLegacyPreAssessmentAsync(PulseTestWorld.EmployeeEmail, "M1-F", decision: null);
        var course = await world.CourseAsync(uc, "M1-F");
        course.PreStatus.Should().Be(PulsePreStatus.Required, "bài cũ chờ chấm không còn tính: nhân viên làm bài kiểm tra đầu vào mới");
        course.SlotStatus.Should().Be(PulseSlotStatus.PreAssessment);
        course.CanStartPreAssessment.Should().BeFalse();

        var old = await uc.GetPreAssessment.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = course.CourseId });
        old.Status.Should().Be(PulsePreStatus.Required, "trang bài cũ chuyển sang bài kiểm tra đầu vào");
        old.CanStart.Should().BeFalse();
        old.Submission.Should().BeNull("bài tự luận cũ không còn hiện như bài đang chờ chấm");
        (await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = course.CourseId })).Status
            .Should().Be(PulseSkipTestStatus.Available);

        foreach (var reviewer in new[] { owner, mentor })
        {
            var queue = await reviewer.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
            queue.PreAssessmentCount.Should().Be(0, "không còn bài đầu vào nào cần người chấm");
            queue.Items.Should().NotContain(i => i.Kind == Statuses.ProctoringKind.PreAssessment);
            (await reviewer.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { IncludeReviewed = true })).Items
                .Should().NotContain(i => i.SubmissionId == pending.Id);
        }

        var decide = () => owner.DecidePreAssessment.ExecuteAsync(new DecidePulsePreAssessmentUseCaseInput
        {
            PreAssessmentId = pending.Id, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Chấm bài cũ sau khi đổi luồng.",
        });
        (await decide.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("PRE_ASSESSMENT_SUPERSEDED");
        world.Context.ChangeTracker.Clear();

        var reopen = () => uc.StartProctoring.ExecuteAsync(new StartPulseProctoringUseCaseInput { CourseId = course.CourseId, Kind = Statuses.ProctoringKind.PreAssessment });
        (await reopen.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(StartPulseProctoringUseCase.NotOpen);
        world.Context.ChangeTracker.Clear();

        var opened = await world.PassEntryTestAsync(uc, "M1-F");
        opened.SlotStatus.Should().Be(PulseSlotStatus.FinalReady, "bài kiểm tra đầu vào mới quyết định, không phải bài cũ");
    }

    [Fact]
    public async Task OldDecidedPreAssessments_StayAsHistory()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var owner = await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner);

        // Đã đạt theo luồng cũ: khóa vẫn được công nhận.
        await world.SeedLegacyPreAssessmentAsync(PulseTestWorld.EmployeeEmail, "M1-F", Statuses.FinalSubmissionDecision.Passed);
        var recognised = await world.CourseAsync(uc, "M1-F");
        recognised.Approved.Should().BeTrue();
        recognised.ApprovedVia.Should().Be(PulseApprovedVia.PreAssessment);
        recognised.PreStatus.Should().Be(PulsePreStatus.Passed);
        (await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = recognised.CourseId })).Status
            .Should().Be(PulseSkipTestStatus.NotNeeded);
        (await uc.Outcomes.ExecuteAsync(new GetPulseOutcomesUseCaseInput())).Items.Should().Contain(o => o.Kind == PulseOutcomeKind.PreAssessment);

        // Chưa đạt theo luồng cũ: đã qua bước đầu vào, học tuần tự, không làm thêm bài kiểm tra đầu vào.
        await world.SeedLegacyPreAssessmentAsync(PulseTestWorld.EmployeeEmail, "M3-F", Statuses.FinalSubmissionDecision.NotYet);
        var learning = await world.CourseAsync(uc, "M3-F");
        learning.PreStatus.Should().Be(PulsePreStatus.NotYet);
        learning.CanWork.Should().BeTrue();
        var test = await uc.GetSkipTest.ExecuteAsync(new GetPulseSkipTestUseCaseInput { CourseId = learning.CourseId });
        test.Status.Should().Be(PulseSkipTestStatus.NotNeeded);
        test.Message.Should().NotBeNullOrWhiteSpace();

        // Lịch sử đã chấm vẫn xem được trong hàng chờ (bộ lọc "đã chấm").
        (await owner.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { IncludeReviewed = true })).Items
            .Count(i => i.Kind == Statuses.ProctoringKind.PreAssessment).Should().Be(2);
    }

    [Fact]
    public void Draw_TakesFinalQuizQuestionsFirst_SpreadsOverModules_AndIsStablePerAttempt()
    {
        var pool = new List<PulseSkipPoolQuestion>();
        for (var module = 0; module < 4; module++)
        {
            for (var i = 0; i < 10; i++)
            {
                var options = new List<PulseQuizOption>
                {
                    new(Guid.NewGuid(), "Đúng", true),
                    new(Guid.NewGuid(), "Sai", false),
                };
                pool.Add(new PulseSkipPoolQuestion(new PulseQuizQuestion(Guid.NewGuid(), $"M{module} câu {i}", null, i + 1, options), module, IsFinalQuiz: i < 5));
            }
        }

        var employeeId = Guid.NewGuid();
        var courseId = Guid.NewGuid();
        var first = PulseSkipTest.Draw(pool, employeeId, courseId, 1);
        first.Should().HaveCount(PulseRules.SkipTestQuestionCount);
        first.Should().OnlyContain(p => p.IsFinalQuiz, "20 câu cuối khóa của giáo trình đi trước");
        first.GroupBy(p => p.ModuleIndex).Should().HaveCount(4).And.OnlyContain(g => g.Count() == 5);
        PulseSkipTest.Draw(pool, employeeId, courseId, 1).Select(p => p.Question.QuestionId)
            .Should().Equal(first.Select(p => p.Question.QuestionId), "cùng lần làm luôn ra cùng đề");

        var second = PulseSkipTest.Draw(pool, employeeId, courseId, 2);
        second.Select(p => p.Question.QuestionId).Should().NotIntersectWith(first.Select(p => p.Question.QuestionId), "lần sau lấy đoạn câu kế tiếp");
        PulseRules.SkipTestPassMark(20).Should().Be(16);
        PulseRules.SkipTestPassMark(12).Should().Be(10);
    }
}
