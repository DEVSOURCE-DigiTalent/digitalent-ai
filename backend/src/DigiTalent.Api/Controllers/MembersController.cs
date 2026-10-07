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

    // POST api/v1/members/invitations — body { rows: [{ email, fullName, role, employeeCode?, departmentId?, jobPositionId? }] }
    [HttpPost("invitations")]
    [HasPermission(Permissions.UserRole.UserCreate)]
    public async Task<ActionResult<ApiResponse<InviteMembersUseCaseOutput>>> Invite(
        [FromBody] InviteMembersUseCaseInput input,
        [FromServices] IUseCase<InviteMembersUseCaseInput, InviteMembersUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<InviteMembersUseCaseOutput>.Ok(result, $"{result.Created.Count} invitation(s) sent."));
    }

    // POST api/v1/members/{id}/resend-invitation — {id} = invitation id
    [HttpPost("{id:guid}/resend-invitation")]
    [HasPermission(Permissions.UserRole.UserCreate)]
    public async Task<ActionResult<ApiResponse<ResendInvitationUseCaseOutput>>> ResendInvitation(
        Guid id,
        [FromServices] IUseCase<ResendInvitationUseCaseInput, ResendInvitationUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new ResendInvitationUseCaseInput { Id = id });
        return Ok(ApiResponse<ResendInvitationUseCaseOutput>.Ok(result, "Invitation resent."));
    }

    // DELETE api/v1/members/invitations/{id} — status REVOKED, not a hard delete
    [HttpDelete("invitations/{id:guid}")]
    [HasPermission(Permissions.UserRole.UserCreate)]
    public async Task<ActionResult<ApiResponse<RevokeInvitationUseCaseOutput>>> RevokeInvitation(
        Guid id,
        [FromServices] IUseCase<RevokeInvitationUseCaseInput, RevokeInvitationUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new RevokeInvitationUseCaseInput { Id = id });
        return Ok(ApiResponse<RevokeInvitationUseCaseOutput>.Ok(result, "Invitation revoked."));
    }
}
