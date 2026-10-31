using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Kết quả chấm phần trắc nghiệm: số câu đúng, số câu của đề và từng câu trả lời (chưa gắn bài nộp).</summary>
public sealed record PulseChoiceGrade(short Score, short Total, IReadOnlyList<ExamChoiceAnswer> Answers);

/// <summary>
/// Phần trắc nghiệm của bài làm có giám sát (đánh giá trước khi học, bài cuối khóa — v3.3 §20.6): tối đa
/// <see cref="PulseRules.ExamChoiceCount"/> câu rút từ câu ôn tập các mô đun của khóa, rải đều các mô đun. Mỗi nhân viên × khóa
/// có một thứ tự câu cố định; bài đánh giá trước khi học lấy nhóm câu đầu, lần nộp bài cuối thứ k lấy nhóm thứ k + 1, nên các
/// lần làm không trùng câu khi ngân hàng đủ lớn. Phương án trộn theo lần làm. Cùng đầu vào luôn cho cùng đề, nên lúc bắt đầu
/// phiên và lúc nộp thấy đúng một bộ câu. Chấm tự động lúc nộp; nhân viên chỉ thấy kết quả sau khi người chấm quyết định.
/// </summary>
public class PulseExamPaper
{
    public const string AnswersInvalid = "CHOICE_ANSWERS_INVALID";
    public const string BelowPass = "CHOICE_BELOW_PASS";

    private const int SeedSalt = 7919;

    private readonly IApplicationDbContext _context;
    private readonly PulseQuizReader _quiz;

    public PulseExamPaper(IApplicationDbContext context, PulseQuizReader quiz)
    {
        _context = context;
        _quiz = quiz;
    }

    /// <summary>Nhóm câu của bài: 0 = đánh giá trước khi học, k = lần nộp bài cuối thứ k.</summary>
    public static int SlotOf(string kind, int finalAttemptNo) =>
        kind == Statuses.ProctoringKind.PreAssessment ? 0 : finalAttemptNo;

    /// <summary>
    /// Số câu của đề với các mô đun này (0 khi khóa chưa có câu ôn tập nào); ước lượng theo số câu của ngân hàng, đề thật có
    /// thể ít hơn khi ngân hàng nhỏ có câu trùng nội dung.
    /// </summary>
    public static int SizeOf(IReadOnlyList<PulseModuleInfo> modules) =>
        Math.Min(PulseRules.ExamChoiceCount, modules.Where(m => m.QuizAssessmentId.HasValue).Sum(m => m.QuizQuestionCount));

    public async Task<IReadOnlyList<PulseQuizQuestion>> DrawAsync(IReadOnlyList<PulseModuleInfo> modules, Guid employeeId, Guid courseId, int slot)
    {
        var pools = new List<IReadOnlyList<PulseQuizQuestion>>();
        foreach (var module in modules.Where(m => m.QuizAssessmentId.HasValue))
        {
            pools.Add(await _quiz.LoadQuestionsAsync(module.QuizAssessmentId!.Value));
        }

        return Draw(pools, employeeId, courseId, slot);
    }

    /// <summary>
    /// Đề của nhóm <paramref name="slot"/>: câu của từng mô đun được xếp ngẫu nhiên (cố định cho nhân viên × khóa) rồi xen kẽ
    /// các mô đun (câu 1 của mỗi mô đun, rồi câu 2…), bỏ câu trùng nội dung (ngân hàng ôn tập có câu mẫu lặp giữa các mô đun);
    /// nhóm thứ n là đoạn kế tiếp của dãy đó (vòng lại khi hết câu).
    /// </summary>
    public static IReadOnlyList<PulseQuizQuestion> Draw(IReadOnlyList<IReadOnlyList<PulseQuizQuestion>> modulePools, Guid employeeId, Guid courseId, int slot)
    {
        var random = new Random(PulseQuizReader.Seed(employeeId, courseId, SeedSalt));
        var queues = modulePools
            .Where(pool => pool.Count > 0)
            .Select(pool => PulseQuizReader.Shuffle(pool.OrderBy(q => q.SortOrder).ThenBy(q => q.QuestionId).ToList(), random))
            .ToList();
        var order = new List<PulseQuizQuestion>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var round = 0; queues.Any(q => round < q.Count); round++)
        {
            order.AddRange(queues.Where(q => round < q.Count).Select(q => q[round]).Where(q => seen.Add(q.Content.Trim())));
        }

        if (order.Count == 0)
        {
            return order;
        }

        var size = Math.Min(PulseRules.ExamChoiceCount, order.Count);
        var start = Math.Max(slot, 0) * size;
        var optionRandom = new Random(PulseQuizReader.Seed(employeeId, courseId, SeedSalt + 1 + Math.Max(slot, 0)));
        return Enumerable.Range(0, size)
            .Select(i => order[(start + i) % order.Count])
            .Select(q => q with { Options = PulseQuizReader.Shuffle(q.Options.ToList(), optionRandom) })
            .ToList();
    }

    /// <summary>Đề phát cho nhân viên lúc bắt đầu phiên (không kèm đáp án).</summary>
    public static List<PulseExamQuestionDto> ToDto(IReadOnlyList<PulseQuizQuestion> paper) =>
        paper.Select((q, index) => new PulseExamQuestionDto
        {
            QuestionId = q.QuestionId,
            Number = index + 1,
            Content = q.Content,
            Options = q.Options.Select(o => new PulseOptionDto { OptionId = o.OptionId, Content = o.Content }).ToList(),
        }).ToList();

    /// <summary>
    /// Chấm phần trắc nghiệm: phải trả lời đúng một phương án cho mỗi câu của đề, không thêm câu ngoài đề. null khi khóa
    /// không có câu ôn tập nào (bài chỉ có phần tự luận).
    /// </summary>
    public static PulseChoiceGrade? Grade(IReadOnlyList<PulseQuizQuestion> paper, IReadOnlyList<PulseAnswerInput>? answers)
    {
        if (paper.Count == 0)
        {
            return null;
        }

        var given = (answers ?? Array.Empty<PulseAnswerInput>()).ToList();
        var byQuestion = given.GroupBy(a => a.QuestionId).ToDictionary(g => g.Key, g => g.ToList());
        var complete = given.Count == paper.Count
                       && paper.All(q => byQuestion.TryGetValue(q.QuestionId, out var list)
                                         && list.Count == 1
                                         && q.Options.Any(o => o.OptionId == list[0].OptionId));
        if (!complete)
        {
            throw new BadRequestException($"Hãy chọn một đáp án cho mỗi câu trong {paper.Count} câu trắc nghiệm của đề.", "answers", AnswersInvalid);
        }

        var rows = paper.Select((q, index) =>
        {
            var optionId = byQuestion[q.QuestionId][0].OptionId;
            return new ExamChoiceAnswer
            {
                QuestionId = q.QuestionId,
                SelectedOptionId = optionId,
                IsCorrect = q.Options.First(o => o.OptionId == optionId).IsCorrect,
                SortOrder = (short)(index + 1),
            };
        }).ToList();
        return new PulseChoiceGrade((short)rows.Count(r => r.IsCorrect), (short)rows.Count, rows);
    }

    /// <summary>Chặn quyết định "Đạt" khi phần trắc nghiệm chưa đủ số câu đúng.</summary>
    public static void EnsureCanPass(string decision, short? score, short? total)
    {
        if (decision == Statuses.FinalSubmissionDecision.Passed && !PulseRules.ChoicePassed(score, total))
        {
            throw new BadRequestException(
                $"Phần trắc nghiệm đúng {score}/{total} câu, chưa đủ {PulseRules.ChoicePassMark(total!.Value)} câu để đạt. Hãy chọn \"Chưa đạt\".",
                "decision",
                BelowPass);
        }
    }

    /// <summary>
    /// Kết quả trắc nghiệm của các bài làm, theo id bài nộp (bài cuối khóa, bài đánh giá trước khi học hoặc bài dùng thử). Người chấm thấy
    /// từng câu (câu hỏi, phương án đã chọn, đáp án đúng); nhân viên chỉ thấy số câu đúng.
    /// </summary>
    public async Task<Dictionary<Guid, List<PulseChoiceItemDto>>> LoadItemsAsync(IReadOnlyCollection<Guid> ownerIds)
    {
        if (ownerIds.Count == 0)
        {
            return new Dictionary<Guid, List<PulseChoiceItemDto>>();
        }

        var rows = await (
                from answer in _context.ExamChoiceAnswers.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on answer.QuestionId equals question.Id
                join selected in _context.QuestionOptions.AsNoTracking() on answer.SelectedOptionId equals selected.Id
                where (answer.FinalSubmissionId != null && ownerIds.Contains(answer.FinalSubmissionId.Value))
                      || (answer.PreAssessmentId != null && ownerIds.Contains(answer.PreAssessmentId.Value))
                      || (answer.TrialAssessmentId != null && ownerIds.Contains(answer.TrialAssessmentId.Value))
                select new
                {
                    OwnerId = answer.FinalSubmissionId ?? answer.PreAssessmentId ?? answer.TrialAssessmentId!.Value,
                    answer.SortOrder,
                    answer.IsCorrect,
                    answer.QuestionId,
                    Question = question.Content,
                    Selected = selected.Content,
                })
            .ToListAsync();
        var questionIds = rows.Select(r => r.QuestionId).Distinct().ToList();
        var correct = await _context.QuestionOptions.AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId) && o.IsCorrect)
            .OrderBy(o => o.SortOrder)
            .Select(o => new { o.QuestionId, o.Content })
            .ToListAsync();
        var correctByQuestion = correct.GroupBy(o => o.QuestionId).ToDictionary(g => g.Key, g => g.First().Content);

        return rows
            .GroupBy(r => r.OwnerId)
            .ToDictionary(g => g.Key, g => g
                .OrderBy(r => r.SortOrder)
                .Select(r => new PulseChoiceItemDto
                {
                    Number = r.SortOrder,
                    Question = r.Question,
                    Selected = r.Selected,
                    Correct = correctByQuestion.GetValueOrDefault(r.QuestionId) ?? string.Empty,
                    IsCorrect = r.IsCorrect,
                })
                .ToList());
    }

    /// <summary>
    /// Kết quả trắc nghiệm của một bài nộp; null với bài nộp trước khi có trắc nghiệm, hoặc với nhân viên khi bài chưa được chấm.
    /// </summary>
    public static PulseChoiceResultDto? Result(short? score, short? total, string? decision, bool forReviewer, List<PulseChoiceItemDto>? items)
    {
        if (score is not { } s || total is not { } t || (!forReviewer && decision == null))
        {
            return null;
        }

        return new PulseChoiceResultDto
        {
            Score = s,
            Total = t,
            PassMark = PulseRules.ChoicePassMark(t),
            Passed = PulseRules.ChoicePassed(s, t),
            Items = forReviewer ? items ?? new List<PulseChoiceItemDto>() : null,
        };
    }
}
