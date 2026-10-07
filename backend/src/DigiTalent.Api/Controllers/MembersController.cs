using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Members of the organization (OW-02 list, OW-03 detail, OW-13 role changes): people with an account or an
/// employee profile, and pending invitations. The {id} is the row id returned by the list.
/// </summary>
[ApiController]
[Route("api/v1/members")]
public class MembersController : ControllerBase
{
    // GET api/v1/members?pageIndex=1&pageSize=20&search=linh&status=ACTIVE&role=MANAGER&departmentId=...&jobPositionId=...&jobGrade=G1
    [HttpGet]
    [HasPermission(Permissions.UserRole.UserRead)]
    public async Task<ActionResult<ApiResponse<GetPagedMembersUseCaseOutput>>> GetPaged(
        [FromQuery] GetPagedMembersUseCaseInput input,
        [FromServices] IUseCase<GetPagedMembersUseCaseInput, GetPagedMembersUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedMembersUseCaseOutput>.Ok(result));
    }

    // GET api/v1/members/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.UserRole.UserRead)]
    public async Task<ActionResult<ApiResponse<GetMemberByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetMemberByIdUseCaseInput, GetMemberByIdUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMemberByIdUseCaseInput { Id = id });
        return Ok(ApiResponse<GetMemberByIdUseCaseOutput>.Ok(result));
    }
}
