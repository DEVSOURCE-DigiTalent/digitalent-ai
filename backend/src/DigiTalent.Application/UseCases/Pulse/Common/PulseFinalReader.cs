using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Chuyển các lần nộp bài cuối khóa thành DTO, kèm tên người chấm.</summary>
public class PulseFinalReader
{
    private readonly IApplicationDbContext _context;

    public PulseFinalReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<Guid, PulseFinalAttemptDto>> MapByIdAsync(IReadOnlyCollection<CourseFinalSubmission> submissions) =>
        (await MapAsync(submissions)).ToDictionary(a => a.SubmissionId);

    public async Task<List<PulseFinalAttemptDto>> MapAsync(IReadOnlyCollection<CourseFinalSubmission> submissions)
    {
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
        }).ToList();
    }
}
