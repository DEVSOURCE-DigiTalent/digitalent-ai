using DigiTalent.Api.Authorization;
using DigiTalent.Application.FileStorage.DTOs;
using DigiTalent.Application.FileStorage.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1/files")]
[Produces("application/json")]
public class FilesController : ControllerBase
{
    private readonly FileService _fileService;

    public FilesController(FileService fileService)
    {
        _fileService = fileService;
    }

    /// <summary>
    /// Upload a file. Supports multipart/form-data.
    /// </summary>
    [HttpPost("upload")]
    [HasPermission(PermissionConstants.FileUploadMaterial)]
    [ProducesResponseType(typeof(ApiResponse<FileObjectResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] string? bucketName,
        [FromForm] string? relatedEntityType,
        [FromForm] Guid? relatedEntityId,
        [FromForm] string accessLevel = "PRIVATE")
    {
        await using var stream = file.OpenReadStream();
        var result = await _fileService.UploadAsync(
            stream, file.FileName, file.ContentType, file.Length,
            bucketName, relatedEntityType, relatedEntityId, accessLevel);
        return CreatedAtAction(nameof(GetDownloadUrl), new { fileId = result.Id },
            ApiResponse<FileObjectResponse>.Ok(result, "File uploaded"));
    }

    /// <summary>
    /// Get a download URL (or stream URL) for a file.
    /// </summary>
    [HttpGet("{fileId:guid}/download-url")]
    [HasPermission(PermissionConstants.FileDownloadAuthorized)]
    public async Task<IActionResult> GetDownloadUrl(Guid fileId)
        => Ok(ApiResponse<FileDownloadResponse>.Ok(
            await _fileService.GetDownloadUrlAsync(fileId)));

    /// <summary>
    /// Stream the actual file content.
    /// </summary>
    [HttpGet("{fileId:guid}/download")]
    [HasPermission(PermissionConstants.FileDownloadAuthorized)]
    public async Task<IActionResult> Download(Guid fileId)
    {
        var (stream, contentType, fileName) = await _fileService.GetFileStreamAsync(fileId);
        return File(stream, contentType, fileName);
    }

    /// <summary>
    /// Delete a file.
    /// </summary>
    [HttpDelete("{fileId:guid}")]
    [HasPermission(PermissionConstants.FileDeleteArchive)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid fileId)
    {
        await _fileService.DeleteAsync(fileId);
        return NoContent();
    }
}
