using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Dùng thử doanh nghiệp (docs/specs/2026-10-31-trial-ai-report-roadmap.md), phía chủ doanh nghiệp: mời nhân viên, đặt hạn
/// làm bài, theo dõi bài làm, đóng bài sớm, xem báo cáo năng lực và đề xuất phạm vi đào tạo.
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

    // PUT api/v1/trial/request — body { testDeadline }
    [HttpPut("request")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<SubmitTrialRequestUseCaseOutput>>> SubmitRequest(
        [FromBody] SubmitTrialRequestUseCaseInput input,
        [FromServices] IUseCase<SubmitTrialRequestUseCaseInput, SubmitTrialRequestUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitTrialRequestUseCaseOutput>.Ok(result));
    }

    // POST api/v1/trial/close — "Xem kết quả ngay": đóng bài trước hạn (cần ít nhất một bài đã nộp)
    [HttpPost("close")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<CloseTrialAssessmentUseCaseOutput>>> Close(
        [FromServices] IUseCase<CloseTrialAssessmentUseCaseInput, CloseTrialAssessmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CloseTrialAssessmentUseCaseInput());
        return Ok(ApiResponse<CloseTrialAssessmentUseCaseOutput>.Ok(result, "Đã đóng bài và tạo báo cáo."));
    }

    // GET api/v1/trial/roadmap — đề xuất phạm vi đào tạo từ kết quả trắc nghiệm (sau khi bài đóng; available = false trước đó)
    [HttpGet("roadmap")]
    [HasPermission(Permissions.Trial.Manage)]
    public async Task<ActionResult<ApiResponse<GetTrialRoadmapUseCaseOutput>>> GetRoadmap(
        [FromServices] IUseCase<GetTrialRoadmapUseCaseInput, GetTrialRoadmapUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetTrialRoadmapUseCaseInput());
        return Ok(ApiResponse<GetTrialRoadmapUseCaseOutput>.Ok(result));
    }
}
