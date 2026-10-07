using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Invitations;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Public invitation activation (page /activate/:token). Like login, these actions carry no [HasPermission]:
/// the invitee has no account yet — the secret activation token is the authorization.
/// </summary>
[ApiController]
[Route("api/v1/invitations")]
public class InvitationsController : ControllerBase
{
    // GET api/v1/invitations/{token} — invitation shown before activation
    [HttpGet("{token}")]
    public async Task<ActionResult<ApiResponse<GetInvitationUseCaseOutput>>> Get(
        string token,
        [FromServices] IUseCase<GetInvitationUseCaseInput, GetInvitationUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetInvitationUseCaseInput { Token = token });
        return Ok(ApiResponse<GetInvitationUseCaseOutput>.Ok(result));
    }

    // POST api/v1/invitations/activate — body { token, fullName?, password }
    [HttpPost("activate")]
    public async Task<ActionResult<ApiResponse<ActivateInvitationUseCaseOutput>>> Activate(
        [FromBody] ActivateInvitationUseCaseInput input,
        [FromServices] IUseCase<ActivateInvitationUseCaseInput, ActivateInvitationUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ActivateInvitationUseCaseOutput>.Ok(result, "Account activated."));
    }
}
