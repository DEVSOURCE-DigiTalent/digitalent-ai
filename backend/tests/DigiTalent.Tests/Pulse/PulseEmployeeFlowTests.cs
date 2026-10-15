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
/// Luồng nhân viên Pulse trên dữ liệu Development thật (docs/ui-redesign/16-pulse-product-flow-detailed.md §7–§12).
/// employee@ = Kế toán, mục tiêu theo lĩnh vực 3/3/2/3/2/2; đã có A2-F hoàn thành (luồng cũ), A1-I và A4-I được giao.
/// </summary>
public class PulseEmployeeFlowTests
{
    private const string CommentReason = "Cần nêu rõ phép tính kiểm tra được.";
    private const string Evidence = "Nguồn: sổ cái tháng 9. Tôi đối chiếu từng tổng số với báo cáo gốc và kết luận bước tiếp theo.";

    [Fact]
    public async Task Baseline_ServesTargetLevelsOnly_ScoresConsecutiveLevels_AndCannotBeRetaken()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);

        var before = await uc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        before.Assessed.Should().BeFalse();
        before.Domains.Select(d => d.Target).Should().Equal(3, 3, 2, 3, 2, 2);
        before.Domains.Should().OnlyContain(d => d.Status == PulseDomainStatus.Pending, "chưa đo thì không có khoảng cách");
        before.Courses.Where(c => c.Tier == 1 && c.Code != "A2-F").Should().OnlyContain(c => c.SlotStatus == PulseSlotStatus.AfterBaseline);

        var baseline = await uc.GetBaseline.ExecuteAsync(new GetPulseBaselineUseCaseInput());
        baseline.BlockReason.Should().BeNull();
        baseline.Domains.Select(d => d.Questions.Count).Should().Equal(3, 3, 2, 3, 2, 2);
        baseline.Domains.SelectMany(d => d.Questions).Should().OnlyContain(q => q.Options.Count == 2);

        var incomplete = () => uc.SubmitBaseline.ExecuteAsync(new SubmitPulseBaselineUseCaseInput
        {
            Answers = baseline.Domains[0].Questions.Select(q => new PulseAnswerInput { QuestionId = q.QuestionId, OptionId = q.Options[0].OptionId }).ToList(),
        });
        await incomplete.Should().ThrowAsync<BadRequestException>();

        // D1: đúng L1, sai L2, đúng L3 → 1. D2: đúng hết → 3. Còn lại sai L1 → 0.
        var answers = new List<PulseAnswerInput>();
        foreach (var domain in baseline.Domains)
        {
            foreach (var question in domain.Questions)
            {
                var correct = domain.Number switch { 1 => question.Level != 2, 2 => true, _ => false };
                answers.Add(new PulseAnswerInput
                {
                    QuestionId = question.QuestionId,
                    OptionId = correct ? await world.CorrectOptionAsync(question.QuestionId) : await world.WrongOptionAsync(question.QuestionId),
                });
            }
        }

        var result = await uc.SubmitBaseline.ExecuteAsync(new SubmitPulseBaselineUseCaseInput { Answers = answers });
        result.Domains.Select(d => d.Baseline).Should().Equal(1, 3, 0, 0, 0, 0);
        world.Context.ChangeTracker.Clear();

        var retake = () => uc.SubmitBaseline.ExecuteAsync(new SubmitPulseBaselineUseCaseInput { Answers = answers });
        await retake.Should().ThrowAsync<ConflictException>();

        var after = await uc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        after.Assessed.Should().BeTrue();
        after.Domains[0].Status.Should().Be(PulseDomainStatus.Gap);
        after.Domains[1].Status.Should().Be(PulseDomainStatus.Met);
        after.Domains[2].Status.Should().Be(PulseDomainStatus.Pending, "đầu vào 0 vẫn là chưa xác nhận, không tô như khoảng cách");
        after.NextCourse!.Code.Should().Be("A1-F", "lĩnh vực có khoảng cách đã đo được ưu tiên, bắt đầu từ cấp Cơ bản");
        after.Courses.Single(c => c.Code == "A1-F").SlotStatus.Should().Be(PulseSlotStatus.FreeToStart);
        after.Courses.Single(c => c.Code == "A1-I").SlotStatus.Should().Be(PulseSlotStatus.SeatHeld, "suất đã có nhưng chưa được duyệt khóa Cơ bản");
        (await world.Context.CapabilityBaselineAnswers.CountAsync()).Should().Be(answers.Count);
    }

    [Fact]
    public async Task ModuleQuiz_NeedsViewedSlides_PreviousModule_AndEveryAnswerRight()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await world.SubmitBaselineAsync(uc, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(uc, "A1-F");

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
    }

    [Fact]
    public async Task ModuleQuiz_AfterAWrongAttempt_NeedsTheRelatedPageReopened_ThenDrawsOtherQuestions()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await world.SubmitBaselineAsync(uc, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(uc, "A1-F");
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
    public async Task FinalAssignment_RetryWindow_ThenFlag_ThenSupport()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        await world.SubmitBaselineAsync(employee, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(employee, "A1-F");

        var early = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        (await early.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("MODULES_INCOMPLETE");
        world.Context.ChangeTracker.Clear();

        await world.PassAllModulesAsync(employee, course.CourseId);
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.Ready);

        var first = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        world.Context.ChangeTracker.Clear();
        first.AttemptNo.Should().Be(1);
        var managerUser = await world.UserAsync(PulseTestWorld.ManagerEmail);
        (await world.Context.Notifications.AnyAsync(n => n.RecipientUserId == managerUser.Id && n.Type == SubmitPulseFinalUseCase.NotificationType))
            .Should().BeTrue("quản lý phòng ban nhận thông báo bài cần chấm");

        var whilePending = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        await whilePending.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var item = queue.Items.Single(i => i.Status == PulseFinalStatus.Pending);
        item.AiHint!.Checks.Should().Equal(true, true, true);
        item.DomainName.Should().Be(course.DomainName, "the queue names a domain like the employee pages, without the \"1. \" of the category");
        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = item.SubmissionId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = CommentReason });
        world.Context.ChangeTracker.Clear();

        var waiting = await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId });
        waiting.Status.Should().Be(PulseFinalStatus.RetryWait);
        waiting.CanSubmit.Should().BeFalse();
        waiting.Attempts.Single().RetryOpensAt.Should().Be(world.Clock.Now.AddHours(48));
        waiting.Attempts.Single().RetryDueAt.Should().Be(world.Clock.Now.AddHours(48).AddDays(7));
        waiting.Attempts.Single().DecisionReason.Should().Be(CommentReason);

        world.Clock.Advance(TimeSpan.FromHours(49));
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.RetryReady);
        var second = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence + " (lần 2)" });
        world.Context.ChangeTracker.Clear();
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
        var third = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        await third.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var overview = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        overview.Courses.Single(c => c.Code == "A1-F").SlotStatus.Should().Be(PulseSlotStatus.NeedsSupport);
        overview.Domains[0].Verified.Should().Be(1, "hai lần chưa đạt không nâng mức năng lực");
    }

    [Fact]
    public async Task MissingTheSecondDeadline_IsASupportCase()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        await world.SubmitBaselineAsync(employee, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(employee, "A1-F");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var first = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        world.Context.ChangeTracker.Clear();
        await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = first.SubmissionId, Decision = Statuses.FinalSubmissionDecision.NotYet, Reason = CommentReason });
        world.Context.ChangeTracker.Clear();

        world.Clock.Advance(TimeSpan.FromDays(10));
        (await employee.GetFinal.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = course.CourseId })).Status.Should().Be(PulseFinalStatus.DeadlineMissed);
        var late = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        await late.Should().ThrowAsync<ConflictException>();
        world.Context.ChangeTracker.Clear();

        var queue = await manager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        queue.DeadlineMissedCount.Should().Be(1);
        await manager.Support.ExecuteAsync(new RecordPulseFinalSupportUseCaseInput { SubmissionId = first.SubmissionId, Action = Statuses.FinalSupportAction.FreshCycle });
    }

    [Fact]
    public async Task ApprovedFinal_RaisesVerifiedLevel_KeepsBaseline_AndBecomesAnOutcome()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var manager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        await world.SubmitBaselineAsync(employee, new Dictionary<int, int>()); // mọi lĩnh vực đầu vào 0
        var course = await world.CourseAsync(employee, "A4-F");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        world.Context.ChangeTracker.Clear();

        var before = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        before.Domains[3].Verified.Should().Be(0, "nộp bài chưa làm tăng mức đã xác nhận");
        before.Courses.Single(c => c.Code == "A4-F").SlotStatus.Should().Be(PulseSlotStatus.InReview);

        var decision = await manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Đạt đủ ba tiêu chí, nguồn rõ ràng." });
        world.Context.ChangeTracker.Clear();
        decision.Status.Should().Be(PulseFinalStatus.Approved);
        decision.EnrollmentStatus.Should().Be(Statuses.Enrollment.Completed);

        var after = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var safety = after.Domains[3];
        safety.Baseline.Should().Be(0, "mức đầu vào giữ nguyên");
        safety.Verified.Should().Be(1);
        safety.Source.Should().Be(PulseLevelSource.Course);
        safety.Status.Should().Be(PulseDomainStatus.Gap);
        after.LatestOutcome!.Gained.Should().BeTrue();
        after.Courses.Single(c => c.Code == "A4-F").SlotStatus.Should().Be(PulseSlotStatus.Completed);
        after.Courses.Single(c => c.Code == "A4-I").CanWork.Should().BeTrue("suất Trung cấp đã có, nay đủ điều kiện vì Cơ bản được duyệt");

        var outcomes = await employee.Outcomes.ExecuteAsync(new GetPulseOutcomesUseCaseInput());
        var outcome = outcomes.Items.Single(o => o.Kind == PulseOutcomeKind.Course);
        outcome.Subtitle.Should().Be("An toàn · Cơ bản");
        (await employee.Outcome.ExecuteAsync(new GetPulseOutcomeUseCaseInput { OutcomeId = outcome.Id })).ReviewNote.Should().Contain("ba tiêu chí");
    }

    [Fact]
    public async Task PaidCourseWithoutSeat_ShowsOnlyTheFirstSampleSlide()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await world.SubmitBaselineAsync(uc, new Dictionary<int, int> { [3] = 1 });
        var course = await world.CourseAsync(uc, "A3-I");
        course.Access.Should().Be(PulseCourseAccess.Preview);
        course.SlotStatus.Should().Be(PulseSlotStatus.AfterPriorLevel);

        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("PREVIEW");
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
    public async Task BeforeBaseline_BasicSlidesAreReadable_ButProgressIsNotRecorded()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.CourseAsync(uc, "A1-F");
        var detail = await uc.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = course.CourseId });
        detail.NextAction.Should().Be("BASELINE");

        var module = await uc.GetModule.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        module.Slides.Should().HaveCountGreaterThan(1);
        module.QuizBlockReason.Should().Be(PulseBlockReason.NotAssessed);
        var record = () => uc.MarkViewed.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = course.CourseId, ModuleId = detail.Modules[0].ModuleId });
        await record.Should().ThrowAsync<ForbiddenException>();
        (await world.Context.Enrollments.CountAsync(e => e.CourseId == course.CourseId)).Should().Be(0);
    }

    [Fact]
    public async Task ManagerOfAnotherDepartment_CannotSeeOrDecide()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await world.SubmitBaselineAsync(employee, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(employee, "A1-F");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput { CourseId = course.CourseId, EvidenceText = Evidence });
        world.Context.ChangeTracker.Clear();

        var organizationId = (await world.EmployeeAsync(PulseTestWorld.EmployeeEmail)).OrganizationId;
        var otherDepartment = new Department { OrganizationId = organizationId, Code = "SALES-X", Name = "Kinh doanh" };
        world.Context.Departments.Add(otherDepartment);
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var outsider = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager, otherDepartment.Id);
        (await outsider.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).Items.Should().BeEmpty();
        var decide = () => outsider.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Không thuộc phòng ban." });
        await decide.Should().ThrowAsync<NotFoundException>();

        var owner = await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner);
        (await owner.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput())).PendingCount.Should().Be(1, "chủ doanh nghiệp thấy toàn tổ chức");

        var self = () => employee.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput { SubmissionId = submitted.SubmissionId, Decision = Statuses.FinalSubmissionDecision.Passed, Reason = "Tự duyệt bài của mình." });
        await self.Should().ThrowAsync<NotFoundException>("không ai tự chấm bài của chính mình");
    }

    [Fact]
    public async Task Practice_ListsWorkableFinals_NotHeldSeats()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var uc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await world.SubmitBaselineAsync(uc, new Dictionary<int, int> { [1] = 1 });
        var course = await world.CourseAsync(uc, "A1-F");
        await world.PassAllModulesAsync(uc, course.CourseId);

        var practice = await uc.Practice.ExecuteAsync(new GetPulsePracticeUseCaseInput());
        practice.Finals.Select(f => f.Course.Code).Should().Contain("A1-F").And.Contain("A2-F")
            .And.NotContain("A1-I", "suất đang giữ nằm ở lộ trình, chưa phải việc cần làm");
        practice.Finals.First().Course.FinalStatus.Should().Be(PulseFinalStatus.Ready, "việc nộp được xếp lên đầu");
        practice.Criteria.Should().HaveCount(3);
    }
}
