using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng courses. Khóa học, có đánh phiên bản.
/// </summary>
public class Course : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public int VersionNo { get; set; }
    public Guid? SupersedesCourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Description { get; set; }
    public string? Purpose { get; set; }
    public short? EntryLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public bool CertificateEnabled { get; set; }
    public int? CertificateValidityDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public long RowVersion { get; set; }
}
