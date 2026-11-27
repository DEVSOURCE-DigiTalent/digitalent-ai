using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Research;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/enterprise/rnd")]
public sealed class EnterpriseResearchController(EnterpriseResearch research) : ControllerBase
{
    [HttpGet("settings")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<bool>> GetSettings() => ApiResponse<bool>.Ok(await research.GetEnabledAsync());

    [HttpPut("settings")]
    [HasPermission(Permissions.Research.Configure)]
    public async Task<ApiResponse<bool>> SetSettings([FromBody] bool enabled) =>
        ApiResponse<bool>.Ok(await research.SetEnabledAsync(enabled));

    /// <summary>Who customises the company's courses and what the caller may do (view, edit).</summary>
    [HttpGet("access")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAccess>> GetAccess() => ApiResponse<ResearchAccess>.Ok(await research.GetAccessAsync());

    [HttpGet("courses")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<IReadOnlyList<ResearchCourseItem>>> GetCourses() =>
        ApiResponse<IReadOnlyList<ResearchCourseItem>>.Ok(await research.ListAsync());

    [HttpGet("courses/{id:guid}/preview")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<IReadOnlyList<ResearchModulePreview>>> Preview(Guid id, [FromServices] IPlatformAssetUrlSigner signer) =>
        ApiResponse<IReadOnlyList<ResearchModulePreview>>.Ok(await research.PreviewAsync(id, signer));

    [HttpPut("courses/{id:guid}/draft")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchCourseVersion>> SaveDraft(Guid id, ResearchCourseContent content) =>
        ApiResponse<ResearchCourseVersion>.Ok(await research.SaveAsync(id, content));

    [HttpGet("courses/{id:guid}/editor")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> GetEditor(Guid id, [FromServices] PlatformCourseContentReader reader,
        [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.GetAuthoringAsync(id, reader, sanitizer));

    [HttpPut("courses/{id:guid}/editor")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> SaveEditor(Guid id, ResearchAuthoringInput input,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.SaveAuthoringAsync(id, input, reader, sanitizer));

    [HttpDelete("courses/{id:guid}/editor/draft")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> DiscardDraft(Guid id, [FromQuery] int revision,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.DiscardDraftAsync(id, revision, reader, sanitizer));

    /// <summary>Applies the company version: a new course revision employees learn and take tests on.</summary>
    [HttpPost("courses/{id:guid}/apply")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> Apply(Guid id, ResearchApplyInput input,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.ApplyCompanyVersionAsync(id, input, reader, sanitizer));

    /// <summary>Employees go back to the standard content; the company version stays as R&D's draft.</summary>
    [HttpDelete("courses/{id:guid}/apply")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> RemoveApplied(Guid id, [FromQuery] int revision,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.RemoveCompanyVersionAsync(id, revision, reader, sanitizer));

    [HttpPost("courses/{id:guid}/editor/assets")]
    [HasPermission(Permissions.Research.ManageCourses)]
    [RequestSizeLimit(510L * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 510L * 1024 * 1024)]
    public async Task<ApiResponse<PlatformAssetDto>> UploadEditorAsset(Guid id, IFormFile file,
        [FromServices] IUseCase<UploadPlatformAssetUseCaseInput, PlatformAssetDto> uploader,
        [FromServices] PlatformCourseContentReader reader)
    {
        await using var stream = file.OpenReadStream();
        return ApiResponse<PlatformAssetDto>.Ok(await research.UploadAuthoringAssetAsync(id,
            new UploadPlatformAssetUseCaseInput { Content = stream, FileName = file.FileName, ContentType = file.ContentType, Length = file.Length },
            uploader, reader));
    }
}
