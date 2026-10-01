using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng lesson_progress. Tiến độ học từng bài.
/// </summary>
public class LessonProgress : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EnrollmentId { get; set; }
    public Guid LessonId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
