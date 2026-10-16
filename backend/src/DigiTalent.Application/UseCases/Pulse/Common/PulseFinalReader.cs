using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Chuyển các lần nộp bài cuối khóa thành DTO, kèm tên người chấm.</summary>
public class PulseFinalReader
{
    private readonly IApplicationDbContext _context;

    public PulseFinalReader(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Đề theo phiên bản khóa và vị trí; fallback đề chung cho vị trí chưa có ca riêng.</summary>
    public async Task<PulseFinalAssignmentDto?> AssignmentAsync(Guid courseId, string? positionName)
    {
        var assignments = await AssignmentsAsync(new[] { courseId });
        return SelectAssignment(assignments, courseId, positionName);
    }

    /// <summary>Manager đọc cả hàng chờ bằng một truy vấn thay vì truy vấn mỗi bài.</summary>
    public async Task<Dictionary<Guid, List<PulseFinalAssignmentDto>>> AssignmentsAsync(IReadOnlyCollection<Guid> courseIds)
    {
        if (courseIds.Count == 0) return new Dictionary<Guid, List<PulseFinalAssignmentDto>>();
        var templates = await _context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => t.RelatedCourseId != null && courseIds.Contains(t.RelatedCourseId.Value) && t.Status == "ACTIVE")
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return templates.Select(t => (Template: t, Metadata: ParseMetadata(t.GeneralMarkingCriteria)))
            .Where(t => t.Metadata != null)
            .GroupBy(t => t.Template.RelatedCourseId!.Value)
            .ToDictionary(g => g.Key, g => g.Select(t => new PulseFinalAssignmentDto
            {
                Title = t.Template.Title,
                Description = t.Template.Description,
                ExpectedOutput = t.Template.ExpectedOutput,
                Track = t.Metadata!.Track,
                Rubric = t.Metadata.Rubric,
                PassScore = t.Metadata.PassScore,
            }).ToList());
    }

    public static PulseFinalAssignmentDto? SelectAssignment(
        IReadOnlyDictionary<Guid, List<PulseFinalAssignmentDto>> assignments, Guid courseId, string? positionName)
    {
        if (!assignments.TryGetValue(courseId, out var options)) return null;
        var track = TrackOf(positionName);
        return options.FirstOrDefault(t => t.Track == track) ?? options.FirstOrDefault(t => t.Track == "general");
    }

    private static string TrackOf(string? positionName)
    {
        var name = positionName?.ToLowerInvariant() ?? string.Empty;
        if (name.Contains("kế toán") || name.Contains("accounting")) return "accounting";
        if (name.Contains("marketing")) return "marketing";
        if (name.Contains("nhân sự") || name.Contains("human resources") || name == "hr") return "hr";
        if (name.Contains("sales") || name.Contains("crm") || name.Contains("kinh doanh")) return "sales";
        if (name.Contains("ceo") || name.Contains("giám đốc") || name.Contains("tổng giám đốc")) return "ceo";
        return "general";
    }

    private static PulseAssignmentMetadata? ParseMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return null;
            if (!root.TryGetProperty("track", out var track) || track.ValueKind != JsonValueKind.String) return null;
            var rubric = new List<PulseAssignmentCriterionDto>();
            if (root.TryGetProperty("rubric", out var items) && items.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in items.EnumerateArray())
                {
                    if (item.ValueKind != JsonValueKind.Array || item.GetArrayLength() < 2) continue;
                    var row = item.EnumerateArray().ToArray();
                    if (row[0].ValueKind == JsonValueKind.String && row[1].ValueKind == JsonValueKind.Number && row[1].TryGetInt32(out var points))
                        rubric.Add(new PulseAssignmentCriterionDto(row[0].GetString()!, points));
                }
            }
            var pass = root.TryGetProperty("pass", out var passNode) && passNode.ValueKind == JsonValueKind.Number && passNode.TryGetInt32(out var score) ? score : 70;
            return new PulseAssignmentMetadata(track.GetString()!, rubric, pass);
        }
        catch (JsonException) { return null; }
    }

    private sealed record PulseAssignmentMetadata(string Track, List<PulseAssignmentCriterionDto> Rubric, int PassScore);

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
        }).ToList();
    }
}
