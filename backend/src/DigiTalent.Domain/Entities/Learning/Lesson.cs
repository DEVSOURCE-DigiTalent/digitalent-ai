using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng lessons. Bài học trong chương.
/// </summary>
public class Lesson : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ModuleId { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string LessonType { get; set; } = string.Empty;
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string CompletionRule { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
