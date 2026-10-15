using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class PulseRulesTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 14, 8, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(new[] { true, true, true }, 3, 3)]
    [InlineData(new[] { true, true, false }, 3, 2)]
    [InlineData(new[] { true, false, true }, 3, 1)] // sai L2 chặn L3 dù L3 đúng
    [InlineData(new[] { false, true, true }, 3, 0)]
    [InlineData(new[] { true, true, true }, 2, 2)] // không vượt mục tiêu
    [InlineData(new[] { true }, 3, 1)]              // thiếu câu ở mức cao hơn → dừng
    public void ChainLevel_CountsOnlyConsecutiveCorrectLevelsFromL1(bool[] correct, int target, int expected) =>
        PulseRules.ChainLevel(correct, target).Should().Be(expected);

    [Theory]
    [InlineData(1, 3, 0)]
    [InlineData(2, 3, 0)]
    [InlineData(3, 3, 1)]
    [InlineData(6, 3, 2)]
    [InlineData(7, 3, 2)] // câu ngoài số trang gắn với trang cuối
    [InlineData(4, 1, 0)]
    [InlineData(1, 0, -1)]
    public void QuizPageIndex_PairsTwoQuestionsWithEachPage(int sortOrder, int pageCount, int expected) =>
        PulseRules.QuizPageIndex(sortOrder, pageCount).Should().Be(expected);

    [Fact]
    public void QuizDraw_GivesEachAttemptOtherQuestions_AndTheSameDrawForTheSameAttempt()
    {
        var pool = Enumerable.Range(1, 6).Select(n => QuizQuestion(n)).ToList();
        var employee = Guid.NewGuid();
        var assessment = Guid.NewGuid();
        var draws = Enumerable.Range(1, 4).Select(attempt => PulseQuizReader.Draw(pool, employee, assessment, attempt)).ToList();

        draws.Should().OnlyContain(d => d.Count == PulseRules.ModuleQuizDrawSize);
        draws.Take(3).SelectMany(d => d.Select(q => q.QuestionId)).Should().OnlyHaveUniqueItems()
            .And.BeEquivalentTo(pool.Select(q => q.QuestionId), "ba lần đầu đi hết ngân hàng 6 câu, không lặp câu nào");
        draws[3].Select(q => q.QuestionId).Should().Equal(draws[0].Select(q => q.QuestionId), "hết ngân hàng thì quay lại từ đầu");

        var again = PulseQuizReader.Draw(pool, employee, assessment, 2);
        again.Select(q => q.QuestionId).Should().Equal(draws[1].Select(q => q.QuestionId), "trang học và lúc chấm thấy cùng một bộ câu");
        again.Select(q => q.Options.Select(o => o.OptionId)).Should().BeEquivalentTo(draws[1].Select(q => q.Options.Select(o => o.OptionId)), o => o.WithStrictOrdering());
        foreach (var question in draws.SelectMany(d => d))
        {
            question.Options.Select(o => o.OptionId).Should().BeEquivalentTo(pool.Single(q => q.QuestionId == question.QuestionId).Options.Select(o => o.OptionId));
        }
    }

    [Fact]
    public void QuizDraw_ShufflesOptionsBetweenAttempts()
    {
        var pool = new[] { QuizQuestion(1, optionCount: 4), QuizQuestion(2, optionCount: 4) };
        var orders = Enumerable.Range(1, 12)
            .Select(attempt => string.Join(",", PulseQuizReader.Draw(pool, Guid.NewGuid(), Guid.NewGuid(), attempt)
                .OrderBy(q => q.SortOrder).SelectMany(q => q.Options.Select(o => o.Content))))
            .Distinct()
            .Count();
        orders.Should().BeGreaterThan(1, "thứ tự phương án đổi theo lần làm");
    }

    private static PulseQuizQuestion QuizQuestion(int sortOrder, int optionCount = 3) =>
        new(Guid.NewGuid(), $"Câu {sortOrder}", null, sortOrder,
            Enumerable.Range(1, optionCount).Select(o => new PulseQuizOption(Guid.NewGuid(), $"{sortOrder}.{o}", o == 1)).ToList());

    [Fact]
    public void FinalStatus_FollowsTheSubmissionLifecycle()
    {
        var enrollment = new Enrollment { Status = Statuses.Enrollment.InProgress };
        PulseRules.FinalStatusOf(null, [], false, Now).Should().Be(PulseFinalStatus.NotStarted);
        PulseRules.FinalStatusOf(enrollment, [], false, Now).Should().Be(PulseFinalStatus.Learning);
        PulseRules.FinalStatusOf(enrollment, [], true, Now).Should().Be(PulseFinalStatus.Ready);

        var pending = Submission(1, null);
        PulseRules.FinalStatusOf(enrollment, [pending], true, Now).Should().Be(PulseFinalStatus.Pending);

        var firstNotYet = Submission(1, Statuses.FinalSubmissionDecision.NotYet, opens: Now.AddHours(48), due: Now.AddHours(48).AddDays(7));
        PulseRules.FinalStatusOf(enrollment, [firstNotYet], true, Now).Should().Be(PulseFinalStatus.RetryWait);
        PulseRules.FinalStatusOf(enrollment, [firstNotYet], true, Now.AddHours(49)).Should().Be(PulseFinalStatus.RetryReady);
        PulseRules.FinalStatusOf(enrollment, [firstNotYet], true, Now.AddDays(10)).Should().Be(PulseFinalStatus.DeadlineMissed);

        var secondNotYet = Submission(2, Statuses.FinalSubmissionDecision.NotYet);
        PulseRules.FinalStatusOf(enrollment, [firstNotYet, secondNotYet], true, Now).Should().Be(PulseFinalStatus.Flagged);

        var passed = Submission(2, Statuses.FinalSubmissionDecision.Passed);
        PulseRules.FinalStatusOf(enrollment, [firstNotYet, passed], true, Now).Should().Be(PulseFinalStatus.Approved);

        // Lượt học đã hoàn thành ở luồng cũ (không có bài cuối Pulse) vẫn tính là đã duyệt.
        PulseRules.FinalStatusOf(new Enrollment { Status = Statuses.Enrollment.Completed }, [], false, Now)
            .Should().Be(PulseFinalStatus.Approved);
    }

    [Fact]
    public void OnlyReadyAndRetryReadyAcceptASubmission()
    {
        PulseRules.CanSubmitFinal(PulseFinalStatus.Ready).Should().BeTrue();
        PulseRules.CanSubmitFinal(PulseFinalStatus.RetryReady).Should().BeTrue();
        foreach (var status in new[] { PulseFinalStatus.Learning, PulseFinalStatus.Pending, PulseFinalStatus.RetryWait, PulseFinalStatus.DeadlineMissed, PulseFinalStatus.Flagged, PulseFinalStatus.Approved })
        {
            PulseRules.CanSubmitFinal(status).Should().BeFalse(status);
        }
    }

    [Fact]
    public void AiHint_IsAKeywordCheckForSourceActionAndConclusion()
    {
        PulseRules.AiHint("Nguồn: sổ cái. Tôi đối chiếu tổng số và kết luận bước tiếp theo.").Checks.Should().Equal(true, true, true);
        var weak = PulseRules.AiHint("Mọi thứ đều ổn, tôi đã làm xong.");
        weak.Checks.Should().Equal(false, false, false);
        weak.Summary.Should().Contain("cần làm rõ");
    }

    [Theory]
    [InlineData("1. Khai thác dữ liệu và thông tin", "Khai thác dữ liệu và thông tin")]
    [InlineData("An toàn", "An toàn")]
    [InlineData("12. Giải quyết vấn đề", "Giải quyết vấn đề")]
    [InlineData("Năng lực 2. AI", "Năng lực 2. AI")]
    public void DomainDisplayName_DropsLeadingNumber(string name, string expected) =>
        PulseLearnerReader.DisplayName(name).Should().Be(expected);

    private static CourseFinalSubmission Submission(short attempt, string? decision, DateTimeOffset? opens = null, DateTimeOffset? due = null) => new()
    {
        AttemptNo = attempt,
        Decision = decision,
        SubmittedAt = Now.AddDays(-1),
        RetryOpensAt = opens,
        RetryDueAt = due,
    };
}
