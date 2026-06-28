namespace DigiTalent.Application.FileStorage.DTOs;

public class FileObjectResponse
{
    public Guid Id { get; set; }
    public string BucketName { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? ChecksumSha256 { get; set; }
    public string AccessLevel { get; set; } = "PRIVATE";
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public Guid? UploadedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class FileDownloadResponse
{
    public Guid FileId { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
