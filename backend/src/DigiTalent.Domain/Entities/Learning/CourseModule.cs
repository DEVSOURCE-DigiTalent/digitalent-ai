using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng course_modules. Chương trong khóa học.
/// </summary>
public class CourseModule : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Purpose { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
