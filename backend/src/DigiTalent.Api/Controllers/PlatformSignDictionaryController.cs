using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.SignDictionary;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Platform Admin — sign-language dictionary of the 3D signing avatar (docs/specs/2026-11-24-sign-language-avatar.md,
/// schema v3.12). A sign = a word / letter / digit / tone with the video of a person signing it; the browser takes the
/// motion (MediaPipe Holistic landmarks) and saves it here. "Delete" archives.
/// </summary>
[ApiController]
[Route("api/v1/platform/sign-glosses")]
public class PlatformSignDictionaryController : ControllerBase
{
    // GET api/v1/platform/sign-glosses?search=&kind=&status=&stage=&withoutMotion=&pageIndex=&pageSize=
    [HttpGet]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PagedList<SignGlossDto>>>> List(
        [FromQuery] GetSignGlossesUseCaseInput input,
        [FromServices] IUseCase<GetSignGlossesUseCaseInput, PagedList<SignGlossDto>> useCase) =>
        Ok(ApiResponse<PagedList<SignGlossDto>>.Ok(await useCase.ExecuteAsync(input)));

    // GET api/v1/platform/sign-glosses/summary?search=&kind= — counts of the dictionary's tabs
    [HttpGet("summary")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignGlossSummaryDto>>> Summary(
        [FromQuery] GetSignGlossSummaryUseCaseInput input,
        [FromServices] IUseCase<GetSignGlossSummaryUseCaseInput, SignGlossSummaryDto> useCase) =>
        Ok(ApiResponse<SignGlossSummaryDto>.Ok(await useCase.ExecuteAsync(input)));

    // GET api/v1/platform/sign-glosses/motions?ids=…&ids=…&publishedOnly=false — motions for the avatar preview
    [HttpGet("motions")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<List<SignGlossMotionDto>>>> Motions(
        [FromQuery] List<Guid> ids,
        [FromQuery] bool publishedOnly,
        [FromServices] IUseCase<GetSignGlossMotionsUseCaseInput, List<SignGlossMotionDto>> useCase) =>
        Ok(ApiResponse<List<SignGlossMotionDto>>.Ok(await useCase.ExecuteAsync(new GetSignGlossMotionsUseCaseInput { Ids = ids, PublishedOnly = publishedOnly })));

    // GET api/v1/platform/sign-glosses/match?text=&signLanguage=&region=&variant= — the sign for a text (sign map editor)
    [HttpGet("match")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignMatchDto>>> Match(
        [FromQuery] MatchSignGlossUseCaseInput input,
        [FromServices] IUseCase<MatchSignGlossUseCaseInput, SignMatchDto> useCase) =>
        Ok(ApiResponse<SignMatchDto>.Ok(await useCase.ExecuteAsync(input)));

    // GET api/v1/platform/sign-glosses/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> Get(
        Guid id,
        [FromServices] IUseCase<GetSignGlossUseCaseInput, SignGlossDto> useCase) =>
        Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(new GetSignGlossUseCaseInput { Id = id })));

    // POST api/v1/platform/sign-glosses — body { gloss, kind, videoAssetId?, sourceName?, sourceUrl?, licenseNote?, mirrored }
    [HttpPost]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> Create(
        [FromBody] CreateSignGlossUseCaseInput input,
        [FromServices] IUseCase<CreateSignGlossUseCaseInput, SignGlossDto> useCase) =>
        Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(input), "Sign added."));

    // PUT api/v1/platform/sign-glosses/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> Update(
        Guid id,
        [FromBody] UpdateSignGlossUseCaseInput input,
        [FromServices] IUseCase<UpdateSignGlossUseCaseInput, SignGlossDto> useCase)
    {
        input.Id = id;
        return Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(input), "Sign saved."));
    }

    // PUT api/v1/platform/sign-glosses/{id}/motion — body { layout, fps, frames, startMs?, endMs?, data (base64) }
    [HttpPut("{id:guid}/motion")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    [RequestSizeLimit(4 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> SaveMotion(
        Guid id,
        [FromBody] SaveSignGlossMotionUseCaseInput input,
        [FromServices] IUseCase<SaveSignGlossMotionUseCaseInput, SignGlossDto> useCase)
    {
        input.Id = id;
        return Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(input), "Motion saved."));
    }

    // POST api/v1/platform/sign-glosses/{id}/publish
    [HttpPost("{id:guid}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> Publish(
        Guid id,
        [FromServices] IUseCase<PublishSignGlossUseCaseInput, SignGlossDto> useCase) =>
        Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(new PublishSignGlossUseCaseInput { Id = id }), "Sign published."));

    // DELETE api/v1/platform/sign-glosses/{id} — archives
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<SignGlossDto>>> Archive(
        Guid id,
        [FromServices] IUseCase<ArchiveSignGlossUseCaseInput, SignGlossDto> useCase) =>
        Ok(ApiResponse<SignGlossDto>.Ok(await useCase.ExecuteAsync(new ArchiveSignGlossUseCaseInput { Id = id }), "Sign archived."));
}
