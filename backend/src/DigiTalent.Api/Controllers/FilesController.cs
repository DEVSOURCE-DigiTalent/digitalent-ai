using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/files")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public FilesController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Tải tệp tin lên hệ thống (tài liệu học tập, bài nộp thực hành, v.v.).
    /// </summary>
    [HttpPost("upload")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<FileUploadResult>>> Upload(
        [FromForm] IFormFile file,
        [FromQuery] string folder = "general",
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new BadRequestException("File is empty or not provided.");
        }

        // Giới hạn dung lượng tối đa 100MB
        if (file.Length > 100 * 1024 * 1024)
        {
            throw new BadRequestException("File size exceeds 100MB limit.");
        }

        await using var stream = file.OpenReadStream();
        var storagePath = await _fileStorageService.UploadAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder,
            cancellationToken);

        var downloadUrl = await _fileStorageService.GetDownloadUrlAsync(storagePath, cancellationToken: cancellationToken);

        var result = new FileUploadResult
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            SizeBytes = file.Length,
            StoragePath = storagePath,
            Url = downloadUrl,
        };

        return Ok(ApiResponse<FileUploadResult>.Ok(result, "File uploaded successfully."));
    }

    /// <summary>
    /// Tải về hoặc xem tệp tin đã lưu.
    /// </summary>
    [HttpGet("{*storagePath}")]
    [Authorize]
    public async Task<IActionResult> Download(string storagePath, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            throw new BadRequestException("Storage path is required.");
        }

        var stream = await _fileStorageService.DownloadAsync(storagePath, cancellationToken);
        var fileName = Path.GetFileName(storagePath);

        if (!_contentTypeProvider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return File(stream, contentType, fileName);
    }
}

public class FileUploadResult
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}
