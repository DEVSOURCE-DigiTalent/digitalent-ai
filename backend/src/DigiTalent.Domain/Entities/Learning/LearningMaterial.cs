using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng learning_materials. Tài liệu học tập (file hoặc link).
/// </summary>
public class LearningMaterial : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MaterialType { get; set; } = string.Empty;
    public Guid? FileObjectId { get; set; }
    public string? ExternalUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
