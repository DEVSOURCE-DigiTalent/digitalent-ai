namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Quản lý lưu trữ tệp tin (tài liệu học tập, file nộp bài thực hành, file chứng chỉ PDF).
/// Có thể chuyển đổi linh hoạt giữa lưu trữ Local Disk (khi dev offline) hoặc MinIO/S3 (khi production).
/// </summary>
public interface IFileStorageService
{
    Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default);
    Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default);
}
