using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Access;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Enterprise roles and their permissions (OW-13 "Phân quyền"). Roles are granted through PUT api/v1/members/{id}.
/// </summary>
[ApiController]
[Route("api/v1/roles")]
public class RolesController : ControllerBase
{
    // GET api/v1/roles
    [HttpGet]
    [HasPermission(Permissions.UserRole.RoleRead)]
    public async Task<ActionResult<ApiResponse<GetRolesUseCaseOutput>>> GetAll(
        [FromServices] IUseCase<GetRolesUseCaseInput, GetRolesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetRolesUseCaseInput());
        return Ok(ApiResponse<GetRolesUseCaseOutput>.Ok(result));
    }
}
