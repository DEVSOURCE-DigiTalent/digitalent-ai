using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng file_objects. Thông tin file lưu trên MinIO/S3.
/// </summary>
public class FileObject : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OrganizationId { get; set; }
    public string Bucket { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long SizeBytes { get; set; }
    public string? Checksum { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public Guid? UploadedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
