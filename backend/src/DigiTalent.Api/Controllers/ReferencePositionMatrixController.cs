using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Platform-owned guidance; organization position requirements are edited separately.</summary>
[ApiController]
[Route("api/v1/reference-positions/levels")]
public sealed class ReferencePositionMatrixController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.PositionRequirement.Read, Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<ReferencePositionMatrix>>> Get([FromServices] ReferencePositionMatrixService service) =>
        Ok(ApiResponse<ReferencePositionMatrix>.Ok(await service.GetAsync()));

    [HttpPut]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<ReferencePositionMatrix>>> Update(
        [FromBody] ReferencePositionMatrix input, [FromServices] ReferencePositionMatrixService service) =>
        Ok(ApiResponse<ReferencePositionMatrix>.Ok(await service.SaveAsync(input)));
}
