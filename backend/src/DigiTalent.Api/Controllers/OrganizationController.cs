using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Settings;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/organization")]
public class OrganizationController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<OrganizationDto>>> GetOrganization(
        [FromServices] IUseCase<GetOrganizationInput, OrganizationDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetOrganizationInput());
        return Ok(ApiResponse<OrganizationDto>.Ok(result));
    }

    [HttpPut("settings")]
    [HasPermission(Permissions.System.BusinessConfigManage)]
    public async Task<ActionResult<ApiResponse<UpdateOrgSettingsOutput>>> UpdateSettings(
        [FromBody] UpdateOrgSettingsInput input,
        [FromServices] IUseCase<UpdateOrgSettingsInput, UpdateOrgSettingsOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateOrgSettingsOutput>.Ok(result));
    }

    [HttpGet("audit-log")]
    [HasPermission(Permissions.System.AuditLogReadSystem)]
    public async Task<ActionResult<ApiResponse<GetAuditLogOutput>>> GetAuditLog(
        [FromQuery] GetAuditLogInput input,
        [FromServices] IUseCase<GetAuditLogInput, GetAuditLogOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetAuditLogOutput>.Ok(result));
    }
}
