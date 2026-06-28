using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.FileStorage.DTOs;
using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.FileStorage.Services;

public class FileService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;
    private readonly string _uploadDir;

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/csv",
        "application/zip",
    };

    private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

    public FileService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        AuditLogService auditLog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
        _uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(_uploadDir);
    }

    /// <summary>
    /// Upload a file from a stream, store metadata in DB and file on disk.
    /// </summary>
    public async Task<FileObjectResponse> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long fileSize,
        string? bucketName,
        string? relatedEntityType,
        Guid? relatedEntityId,
        string accessLevel = "PRIVATE")
    {
        if (fileSize == 0)
            throw new ArgumentException("File is empty.");

        if (fileSize > MaxFileSizeBytes)
            throw new InvalidOperationException($"File exceeds maximum size of {MaxFileSizeBytes / 1024 / 1024} MB.");

        if (!AllowedMimeTypes.Contains(contentType))
            throw new InvalidOperationException($"File type '{contentType}' is not allowed.");

        bucketName ??= "general";

        // Compute SHA-256 hash
        string checksum;
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hashBytes = await sha256.ComputeHashAsync(fileStream);
            checksum = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        // Reset stream position after hashing
        fileStream.Position = 0;

        // Generate unique object key
        var ext = Path.GetExtension(fileName);
        var objectKey = $"{bucketName}/{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(_uploadDir, objectKey);

        // Ensure subdirectory exists
        var dir = Path.GetDirectoryName(filePath);
        if (dir != null) Directory.CreateDirectory(dir);

        // Write file to disk
        await using (var targetStream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(targetStream);
        }

        var fileObject = new FileObject
        {
            BucketName = bucketName,
            ObjectKey = objectKey,
            OriginalFileName = fileName,
            ContentType = contentType,
            FileSizeBytes = fileSize,
            ChecksumSha256 = checksum,
            AccessLevel = accessLevel,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId,
            UploadedByUserId = _currentUser.UserId,
        };

        _context.FileObjects.Add(fileObject);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "FILE_UPLOAD", "FileObject", fileObject.Id,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(new
            {
                fileObject.OriginalFileName,
                fileObject.FileSizeBytes,
                fileObject.ContentType,
                fileObject.BucketName,
            }));

        return MapToResponse(fileObject);
    }

    /// <summary>
    /// Get download URL for a file (returns a local file path for now; MinIO CDN later).
    /// </summary>
    public async Task<FileDownloadResponse> GetDownloadUrlAsync(Guid fileId)
    {
        var fileObject = await _context.FileObjects.FindAsync(fileId)
            ?? throw new KeyNotFoundException($"File {fileId} not found.");

        // Authorization check
        if (fileObject.AccessLevel == "PRIVATE"
            && fileObject.UploadedByUserId != _currentUser.UserId)
        {
            var hasAccess = _currentUser.Roles.Any(r =>
                r == Shared.Constants.RoleConstants.SystemAdmin
                || r == Shared.Constants.RoleConstants.HRManager);
            if (!hasAccess)
                throw new UnauthorizedAccessException("You do not have access to this file.");
        }

        var filePath = Path.Combine(_uploadDir, fileObject.ObjectKey);
        if (!File.Exists(filePath))
            throw new InvalidOperationException("File not found on disk.");

        // Generate a relative download URL (in production, this could be a presigned MinIO URL)
        var downloadUrl = $"/api/v1/files/{fileId}/download";

        return new FileDownloadResponse
        {
            FileId = fileObject.Id,
            DownloadUrl = downloadUrl,
            OriginalFileName = fileObject.OriginalFileName,
            ContentType = fileObject.ContentType,
            FileSizeBytes = fileObject.FileSizeBytes,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1),
        };
    }

    /// <summary>
    /// Stream the actual file content for download.
    /// </summary>
    public async Task<(Stream Stream, string ContentType, string FileName)> GetFileStreamAsync(Guid fileId)
    {
        var fileObject = await _context.FileObjects.FindAsync(fileId)
            ?? throw new KeyNotFoundException($"File {fileId} not found.");

        var filePath = Path.Combine(_uploadDir, fileObject.ObjectKey);
        if (!File.Exists(filePath))
            throw new InvalidOperationException("File not found on disk.");

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return (stream, fileObject.ContentType, fileObject.OriginalFileName);
    }

    /// <summary>
    /// Delete (soft-delete) a file.
    /// </summary>
    public async Task DeleteAsync(Guid fileId)
    {
        var fileObject = await _context.FileObjects.FindAsync(fileId)
            ?? throw new KeyNotFoundException($"File {fileId} not found.");

        // Only owner or admin can delete
        if (fileObject.UploadedByUserId != _currentUser.UserId
            && !_currentUser.Roles.Any(r =>
                r == Shared.Constants.RoleConstants.SystemAdmin
                || r == Shared.Constants.RoleConstants.HRManager))
        {
            throw new UnauthorizedAccessException("You do not have permission to delete this file.");
        }

        // Delete from disk
        var filePath = Path.Combine(_uploadDir, fileObject.ObjectKey);
        if (File.Exists(filePath))
            File.Delete(filePath);

        _context.FileObjects.Remove(fileObject);
        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "FILE_DELETE", "FileObject", fileId,
            oldValuesJson: System.Text.Json.JsonSerializer.Serialize(new
            {
                fileObject.OriginalFileName,
                fileObject.ObjectKey,
            }));
    }

    // ═══════════════════════════════════════
    // Private Helpers
    // ═══════════════════════════════════════

    private static FileObjectResponse MapToResponse(FileObject entity)
    {
        return new FileObjectResponse
        {
            Id = entity.Id,
            BucketName = entity.BucketName,
            ObjectKey = entity.ObjectKey,
            OriginalFileName = entity.OriginalFileName,
            ContentType = entity.ContentType,
            FileSizeBytes = entity.FileSizeBytes,
            ChecksumSha256 = entity.ChecksumSha256,
            AccessLevel = entity.AccessLevel,
            RelatedEntityType = entity.RelatedEntityType,
            RelatedEntityId = entity.RelatedEntityId,
            UploadedByUserId = entity.UploadedByUserId,
            CreatedAt = entity.CreatedAt,
        };
    }
}
