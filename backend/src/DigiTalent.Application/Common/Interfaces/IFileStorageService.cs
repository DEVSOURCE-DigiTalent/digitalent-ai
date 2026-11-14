namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Quản lý lưu trữ tệp tin (tài liệu học tập, file nộp bài thực hành, file chứng chỉ PDF).
/// Có thể chuyển đổi linh hoạt giữa lưu trữ Local Disk (khi dev offline) hoặc MinIO/S3 (khi production).
/// </summary>
public interface IFileStorageService
{
    Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default);

    /// <summary>Ghép thêm nội dung vào cuối một tệp đã tải lên (ghi hình bài làm được tải lên từng mẩu).</summary>
    Task AppendAsync(string storagePath, Stream content, CancellationToken cancellationToken = default);

    Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default);
}

public sealed record StoredObjectMetadata(long SizeBytes, string? ContentType);

/// <summary>
/// Hỗ trợ cấp Presigned URL (upload/tải trực tiếp từ trình duyệt tới Object Storage như MinIO/S3, không qua API server).
/// </summary>
public interface IDirectFileStorageService
{
    bool SupportsDirectAccess { get; }

    Task<string?> GetPresignedUploadUrlAsync(
        string storageKey,
        string contentType,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default);

    Task<string?> GetPresignedDownloadUrlAsync(
        string storageKey,
        TimeSpan expiresIn,
        string? fileName = null,
        bool inline = true,
        CancellationToken cancellationToken = default);

    Task<StoredObjectMetadata?> GetMetadataAsync(
        string storageKey,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Hợp nhất các mẩu ghi hình (chunks) đã ghép bằng AppendAsync thành một đối tượng hoàn chỉnh trên Object Storage.
/// </summary>
public interface IChunkedFileFinalizer
{
    Task FinalizeAsync(string storagePath, string? contentType = null, CancellationToken cancellationToken = default);
}
