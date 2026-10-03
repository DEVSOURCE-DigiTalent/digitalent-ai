using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng task_submissions. Bài nộp của nhân viên, có đánh phiên bản.
/// </summary>
public class TaskSubmission : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskAssignmentId { get; set; }
    public int VersionNo { get; set; }
    public Guid? SupersedesSubmissionId { get; set; }
    public string? SubmissionNote { get; set; }
    public string? SubmissionUrl { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
