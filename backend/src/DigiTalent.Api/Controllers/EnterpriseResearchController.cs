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
        ApiResponse<ResearchCourseVersion>.Ok(await research.SaveAsync(id, content, apply: false));

    [HttpPut("courses/{id:guid}/applied")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchCourseVersion>> Apply(Guid id, ResearchCourseContent content) =>
        ApiResponse<ResearchCourseVersion>.Ok(await research.SaveAsync(id, content, apply: true));

    [HttpGet("courses/{id:guid}/editor")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> GetEditor(Guid id, [FromServices] PlatformCourseContentReader reader) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.GetAuthoringAsync(id, reader));

    [HttpPut("courses/{id:guid}/editor")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> SaveEditor(Guid id, ResearchAuthoringInput input,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.SaveAuthoringAsync(id, input, reader, sanitizer));

    [HttpPut("courses/{id:guid}/editor/applied")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> ApplyEditor(Guid id, ResearchAuthoringInput input,
        [FromServices] PlatformCourseContentReader reader, [FromServices] IHtmlContentSanitizer sanitizer) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.SaveAuthoringAsync(id, input, reader, sanitizer, apply: true));

    [HttpDelete("courses/{id:guid}/editor/draft")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> DiscardEditor(Guid id, [FromQuery] int revision,
        [FromServices] PlatformCourseContentReader reader) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.RemoveAuthoringAsync(id, revision, reader, applied: false));

    [HttpDelete("courses/{id:guid}/editor/applied")]
    [HasPermission(Permissions.Research.ManageCourses)]
    public async Task<ApiResponse<ResearchAuthoringVersion>> RemoveAppliedEditor(Guid id, [FromQuery] int revision,
        [FromServices] PlatformCourseContentReader reader) =>
        ApiResponse<ResearchAuthoringVersion>.Ok(await research.RemoveAuthoringAsync(id, revision, reader, applied: true));

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
