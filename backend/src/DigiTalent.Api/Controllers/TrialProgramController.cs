using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Dùng thử doanh nghiệp (docs/specs/2026-10-27-enterprise-trial-assessment.md), phía chủ doanh nghiệp: mời nhân viên, đặt hạn
/// làm bài và giờ mong muốn chấm, theo dõi bài làm và xem bảng năng lực sau khi mentor công bố.
/// </summary>
[ApiController]
[Route("api/v1/trial")]
public class TrialProgramController : ControllerBase
{
    // GET api/v1/trial
    [HttpGet]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<GetTrialProgramUseCaseOutput>>> Get(
        [FromServices] IUseCase<GetTrialProgramUseCaseInput, GetTrialProgramUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetTrialProgramUseCaseInput());
        return Ok(ApiResponse<GetTrialProgramUseCaseOutput>.Ok(result));
    }

    // POST api/v1/trial/participants — body { rows: [{ fullName, email, department, position }] }
    [HttpPost("participants")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<InviteTrialParticipantsUseCaseOutput>>> Invite(
        [FromBody] InviteTrialParticipantsUseCaseInput input,
        [FromServices] IUseCase<InviteTrialParticipantsUseCaseInput, InviteTrialParticipantsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<InviteTrialParticipantsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/trial/me/join — body { department, position }: chủ doanh nghiệp tự tham gia làm bài và học thử
    [HttpPost("me/join")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<JoinTrialAsParticipantUseCaseOutput>>> Join(
        [FromBody] JoinTrialAsParticipantUseCaseInput input,
        [FromServices] IUseCase<JoinTrialAsParticipantUseCaseInput, JoinTrialAsParticipantUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<JoinTrialAsParticipantUseCaseOutput>.Ok(result, "Đã tham gia làm bài."));
    }

    // PUT api/v1/trial/request — body { testDeadline, preferredReviewAt, note }
    [HttpPut("request")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<SubmitTrialRequestUseCaseOutput>>> SubmitRequest(
        [FromBody] SubmitTrialRequestUseCaseInput input,
        [FromServices] IUseCase<SubmitTrialRequestUseCaseInput, SubmitTrialRequestUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitTrialRequestUseCaseOutput>.Ok(result));
    }
}
