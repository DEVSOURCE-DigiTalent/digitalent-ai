using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng assessments. Bài kiểm tra của khóa học, có đánh phiên bản.
/// </summary>
public class Assessment : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;   // v2.3: mã ổn định qua các phiên bản
    public int VersionNo { get; set; }
    public Guid? SupersedesAssessmentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }
    public decimal PassingScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public long RowVersion { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
