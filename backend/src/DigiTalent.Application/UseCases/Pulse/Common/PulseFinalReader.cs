using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Chuyển các lần nộp bài cuối khóa thành DTO, kèm tên người chấm và phần trắc nghiệm: người chấm
/// (<paramref name="forReviewer"/>) thấy từng câu, nhân viên chỉ thấy số câu đúng sau khi bài được chấm.
/// </summary>
public class PulseFinalReader
{
    private readonly IApplicationDbContext _context;
    private readonly PulseExamPaper _paper;

    public PulseFinalReader(IApplicationDbContext context, PulseExamPaper paper)
    {
        _context = context;
        _paper = paper;
    }

    public async Task<Dictionary<Guid, PulseFinalAttemptDto>> MapByIdAsync(IReadOnlyCollection<CourseFinalSubmission> submissions, bool forReviewer) =>
        (await MapAsync(submissions, forReviewer)).ToDictionary(a => a.SubmissionId);

    public async Task<List<PulseFinalAttemptDto>> MapAsync(IReadOnlyCollection<CourseFinalSubmission> submissions, bool forReviewer = false)
    {
        var choiceItems = forReviewer
            ? await _paper.LoadItemsAsync(submissions.Where(s => s.ChoiceTotal != null).Select(s => s.Id).ToList())
            : null;
        var userIds = submissions
            .SelectMany(s => new[] { s.ReviewedByUserId, s.SupportRecordedByUserId })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();
        var names = userIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.Users.AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        return submissions.OrderBy(s => s.AttemptNo).Select(s => new PulseFinalAttemptDto
        {
            SubmissionId = s.Id,
            AttemptNo = s.AttemptNo,
            EvidenceText = s.EvidenceText,
            SubmittedAt = s.SubmittedAt,
            Decision = s.Decision,
            DecisionReason = s.DecisionReason,
            ReviewerName = s.ReviewedByUserId is { } reviewer ? names.GetValueOrDefault(reviewer) : null,
            ReviewedAt = s.ReviewedAt,
            RetryOpensAt = s.RetryOpensAt,
            RetryDueAt = s.RetryDueAt,
            SupportAction = s.SupportAction,
            SupportNote = s.SupportNote,
            SupportRecordedAt = s.SupportRecordedAt,
            ProctoringSessionId = s.ProctoringSessionId,
            Choice = PulseExamPaper.Result(s.ChoiceScore, s.ChoiceTotal, s.Decision, forReviewer, choiceItems?.GetValueOrDefault(s.Id)),
        }).ToList();
    }
}
