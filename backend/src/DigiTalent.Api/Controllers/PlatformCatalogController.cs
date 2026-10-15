using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Platform Admin — frameworks, catalog versions and the course builder (docs/specs/2026-10-15-platform-admin-v2.md).
/// Courses are added and edited only in the draft version; publishing it moves the anchor (the version in use).
/// Removing modules, blocks or questions edits the draft's working copy; published versions are never changed.
/// </summary>
[ApiController]
[Route("api/v1/platform")]
public class PlatformCatalogController : ControllerBase
{
    // ----- Frameworks --------------------------------------------------------------------------

    // GET api/v1/platform/frameworks
    [HttpGet("frameworks")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworksOutput>>> GetFrameworks(
        [FromServices] IUseCase<GetPlatformFrameworksUseCaseInput, PlatformFrameworksOutput> useCase) =>
        Ok(ApiResponse<PlatformFrameworksOutput>.Ok(await useCase.ExecuteAsync(new GetPlatformFrameworksUseCaseInput())));

    // GET api/v1/platform/frameworks/{id}
    [HttpGet("frameworks/{id:guid}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> GetFramework(
        Guid id,
        [FromServices] IUseCase<GetPlatformFrameworkDetailUseCaseInput, PlatformFrameworkDetail> useCase) =>
        Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(new GetPlatformFrameworkDetailUseCaseInput { FrameworkId = id })));

    // PUT api/v1/platform/frameworks/{id}/draft — body { domains: [{ domainId, description }] }
    [HttpPut("frameworks/{id:guid}/draft")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> SaveFrameworkDraft(
        Guid id,
        [FromBody] SavePlatformFrameworkDraftUseCaseInput input,
        [FromServices] IUseCase<SavePlatformFrameworkDraftUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Framework draft saved."));
    }

    // POST api/v1/platform/frameworks/{id}/publish — body { releaseNote? }
    [HttpPost("frameworks/{id:guid}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> PublishFramework(
        Guid id,
        [FromBody] PublishPlatformFrameworkUseCaseInput input,
        [FromServices] IUseCase<PublishPlatformFrameworkUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Framework published."));
    }

    // POST api/v1/platform/frameworks/{id}/domains — body { name, description? }
    [HttpPost("frameworks/{id:guid}/domains")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> AddFrameworkDomain(
        Guid id,
        [FromBody] AddPlatformFrameworkDomainUseCaseInput input,
        [FromServices] IUseCase<AddPlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Domain added."));
    }

    // PUT api/v1/platform/frameworks/{id}/domains/{domainId} — body { name, description? } (sửa lĩnh vực)
    [HttpPut("frameworks/{id:guid}/domains/{domainId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> UpdateFrameworkDomain(
        Guid id,
        Guid domainId,
        [FromBody] UpdatePlatformFrameworkDomainUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        input.DomainId = domainId;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Domain updated."));
    }

    // DELETE api/v1/platform/frameworks/{id}/domains/{domainId} — xóa lĩnh vực = archive; only without courses
    [HttpDelete("frameworks/{id:guid}/domains/{domainId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> ArchiveFrameworkDomain(
        Guid id,
        Guid domainId,
        [FromServices] IUseCase<ArchivePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase) =>
        Ok(ApiResponse<PlatformFrameworkDetail>.Ok(
            await useCase.ExecuteAsync(new ArchivePlatformFrameworkDomainUseCaseInput { FrameworkId = id, DomainId = domainId }),
            "Domain archived."));
}
