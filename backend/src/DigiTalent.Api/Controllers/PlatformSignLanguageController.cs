using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Platform Admin — sign-language video of a lesson video (docs/specs/2026-11-24-sign-language-video.md, schema v3.13):
/// the captions are matched to the sign dictionary (sign map), the admin reviews it, the server joins the dictionary
/// clips into a video in sync with the captions (background job), the admin previews and publishes it for learners.
/// Separate from the captions: making captions never counts as making a sign-language video. Read
/// <c>platform.catalog.read</c>, change <c>platform.catalog.manage</c> (course content editors).
/// </summary>
[ApiController]
[Route("api/v1/platform")]
public class PlatformSignLanguageController : ControllerBase
{
    // GET api/v1/platform/assets/{assetId}/sign-language — NONE + prerequisites, or the draft, its map and outputs
    [HttpGet("assets/{assetId:guid}/sign-language")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> Get(
        Guid assetId,
        [FromQuery] string? signLanguage,
        [FromServices] IUseCase<GetSignLanguageVideoUseCaseInput, SignLanguageVideoDto> useCase) =>
        Ok(ApiResponse<SignLanguageVideoDto>.Ok(await useCase.ExecuteAsync(new GetSignLanguageVideoUseCaseInput { AssetId = assetId, SignLanguage = signLanguage })));

    // POST api/v1/platform/assets/{assetId}/sign-language/analyze — body { captionSource, renderMode, renderer, signLanguage, region, variant }
    [HttpPost("assets/{assetId:guid}/sign-language/analyze")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> Analyze(
        Guid assetId,
        [FromBody] AnalyzeSignLanguageVideoUseCaseInput input,
        [FromServices] IUseCase<AnalyzeSignLanguageVideoUseCaseInput, SignLanguageVideoDto> useCase)
    {
        input.AssetId = assetId;
        return Ok(ApiResponse<SignLanguageVideoDto>.Ok(await useCase.ExecuteAsync(input), "Sign map ready."));
    }

    // PUT api/v1/platform/sign-language/{trackId}/segments — body { segments: [{ index, items?, reviewStatus?, reviewNote? }] }
    [HttpPut("sign-language/{trackId:guid}/segments")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> SaveSegments(
        Guid trackId,
        [FromBody] SaveSignLanguageSegmentsUseCaseInput input,
        [FromServices] IUseCase<SaveSignLanguageSegmentsUseCaseInput, SignLanguageVideoDto> useCase)
    {
        input.TrackId = trackId;
        return Ok(ApiResponse<SignLanguageVideoDto>.Ok(await useCase.ExecuteAsync(input), "Sign map saved."));
    }

    // POST api/v1/platform/sign-language/{trackId}/render — body { force } — 202: rendered in the background, poll /status
    [HttpPost("sign-language/{trackId:guid}/render")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> Render(
        Guid trackId,
        [FromBody] RenderSignLanguageVideoUseCaseInput? input,
        [FromServices] IUseCase<RenderSignLanguageVideoUseCaseInput, SignLanguageVideoDto> useCase) =>
        Accepted(ApiResponse<SignLanguageVideoDto>.Ok(
            await useCase.ExecuteAsync(new RenderSignLanguageVideoUseCaseInput { TrackId = trackId, Force = input?.Force ?? false }), "Sign video render started."));

    // GET api/v1/platform/sign-language/{trackId}/avatar-job — what the browser renders for the 3D avatar (frame grid, signs)
    [HttpGet("sign-language/{trackId:guid}/avatar-job")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignAvatarJobDto>>> AvatarJob(
        Guid trackId,
        [FromServices] IUseCase<GetSignAvatarJobUseCaseInput, SignAvatarJobDto> useCase) =>
        Ok(ApiResponse<SignAvatarJobDto>.Ok(await useCase.ExecuteAsync(new GetSignAvatarJobUseCaseInput { TrackId = trackId })));

    // POST api/v1/platform/sign-language/{trackId}/avatar-track — multipart: file (H.264 Annex B / IVF), fingerprint, format,
    // frameRate, frameCount, transparent (OVERLAY: colour | alpha frames), placements (JSON) — 202: the server composes it
    // with the lesson video, poll /status
    [HttpPost("sign-language/{trackId:guid}/avatar-track")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    [RequestSizeLimit(SignVideo.AvatarTrack.MaxBytes + 4 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = SignVideo.AvatarTrack.MaxBytes + 4 * 1024 * 1024, ValueLengthLimit = 8 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> UploadAvatarTrack(
        Guid trackId,
        IFormFile file,
        [FromForm] string fingerprint,
        [FromForm] string format,
        [FromForm] string frameRate,
        [FromForm] int frameCount,
        [FromForm] bool? transparent,
        [FromForm] string? placements,
        [FromServices] IUseCase<UploadSignAvatarTrackUseCaseInput, SignLanguageVideoDto> useCase)
    {
        List<SignAvatarPlacementInput> parsed;
        try
        {
            parsed = string.IsNullOrWhiteSpace(placements)
                ? new List<SignAvatarPlacementInput>()
                : JsonSerializer.Deserialize<List<SignAvatarPlacementInput>>(placements, new JsonSerializerOptions(JsonSerializerDefaults.Web)) ?? new();
        }
        catch (JsonException)
        {
            throw new BadRequestException("Danh sách vị trí ký hiệu không đọc được.", "placements", SignVideo.Errors.AvatarTrackInvalid);
        }

        await using var stream = file.OpenReadStream();
        var result = await useCase.ExecuteAsync(new UploadSignAvatarTrackUseCaseInput
        {
            TrackId = trackId,
            Content = stream,
            SizeBytes = file.Length,
            Fingerprint = fingerprint,
            Format = format,
            FrameRate = frameRate,
            FrameCount = frameCount,
            Transparent = transparent ?? false,
            Placements = parsed,
        });
        return Accepted(ApiResponse<SignLanguageVideoDto>.Ok(result, "Avatar track received; composing the sign video."));
    }

    // GET api/v1/platform/sign-language/{trackId}/status — light state for polling
    [HttpGet("sign-language/{trackId:guid}/status")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignVideoStatusDto>>> Status(
        Guid trackId,
        [FromServices] IUseCase<GetSignLanguageVideoStatusUseCaseInput, SignVideoStatusDto> useCase) =>
        Ok(ApiResponse<SignVideoStatusDto>.Ok(await useCase.ExecuteAsync(new GetSignLanguageVideoStatusUseCaseInput { TrackId = trackId })));

    // GET api/v1/platform/sign-language/{trackId}/preview — the last rendered video of the draft (signed link)
    [HttpGet("sign-language/{trackId:guid}/preview")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignVideoOutputDto>>> Preview(
        Guid trackId,
        [FromServices] IUseCase<GetSignLanguageVideoPreviewUseCaseInput, SignVideoOutputDto> useCase) =>
        Ok(ApiResponse<SignVideoOutputDto>.Ok(await useCase.ExecuteAsync(new GetSignLanguageVideoPreviewUseCaseInput { TrackId = trackId })));

    // POST api/v1/platform/sign-language/{trackId}/publish — learners see it at once
    [HttpPost("sign-language/{trackId:guid}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> Publish(
        Guid trackId,
        [FromServices] IUseCase<PublishSignLanguageVideoUseCaseInput, SignLanguageVideoDto> useCase) =>
        Ok(ApiResponse<SignLanguageVideoDto>.Ok(
            await useCase.ExecuteAsync(new PublishSignLanguageVideoUseCaseInput { TrackId = trackId }), "Sign video published."));

    // POST api/v1/platform/sign-language/{trackId}/retry — 202: renders again after a failed or lost render
    [HttpPost("sign-language/{trackId:guid}/retry")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> Retry(
        Guid trackId,
        [FromServices] IUseCase<RetrySignLanguageVideoUseCaseInput, SignLanguageVideoDto> useCase) =>
        Accepted(ApiResponse<SignLanguageVideoDto>.Ok(
            await useCase.ExecuteAsync(new RetrySignLanguageVideoUseCaseInput { TrackId = trackId }), "Sign video render started again."));

    // DELETE api/v1/platform/sign-language/{trackId}/draft — back to what learners see (or nothing if never published)
    [HttpDelete("sign-language/{trackId:guid}/draft")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignLanguageVideoDto>>> DiscardDraft(
        Guid trackId,
        [FromServices] IUseCase<DiscardSignLanguageVideoDraftUseCaseInput, SignLanguageVideoDto> useCase) =>
        Ok(ApiResponse<SignLanguageVideoDto>.Ok(
            await useCase.ExecuteAsync(new DiscardSignLanguageVideoDraftUseCaseInput { TrackId = trackId }), "Sign video draft discarded."));
}
