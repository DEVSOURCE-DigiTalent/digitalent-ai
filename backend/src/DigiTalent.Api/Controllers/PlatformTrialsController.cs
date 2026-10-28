using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Quản trị nền tảng: hàng chờ yêu cầu chấm bài dùng thử, phân công mentor, tài khoản mentor.</summary>
[ApiController]
[Route("api/v1/platform")]
public class PlatformTrialsController : ControllerBase
{
    // GET api/v1/platform/trials?stage=
    [HttpGet("trials")]
    [HasPermission(Permissions.Platform.TrialManage)]
    public async Task<ActionResult<ApiResponse<GetPlatformTrialsUseCaseOutput>>> GetTrials(
        [FromQuery] GetPlatformTrialsUseCaseInput input,
        [FromServices] IUseCase<GetPlatformTrialsUseCaseInput, GetPlatformTrialsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPlatformTrialsUseCaseOutput>.Ok(result));
    }

    // PUT api/v1/platform/trials/{organizationId}/mentor — body { mentorUserId }
    [HttpPut("trials/{organizationId:guid}/mentor")]
    [HasPermission(Permissions.Platform.TrialManage)]
    public async Task<ActionResult<ApiResponse<AssignTrialMentorUseCaseOutput>>> AssignMentor(
        Guid organizationId,
        [FromBody] AssignTrialMentorUseCaseInput input,
        [FromServices] IUseCase<AssignTrialMentorUseCaseInput, AssignTrialMentorUseCaseOutput> useCase)
    {
        input.OrganizationId = organizationId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<AssignTrialMentorUseCaseOutput>.Ok(result, "Đã phân công mentor."));
    }

    // GET api/v1/platform/mentors
    [HttpGet("mentors")]
    [HasPermission(Permissions.Platform.TrialManage)]
    public async Task<ActionResult<ApiResponse<GetMentorsUseCaseOutput>>> GetMentors(
        [FromServices] IUseCase<GetMentorsUseCaseInput, GetMentorsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMentorsUseCaseInput());
        return Ok(ApiResponse<GetMentorsUseCaseOutput>.Ok(result));
    }

    // POST api/v1/platform/mentors — body { fullName, email, password }
    [HttpPost("mentors")]
    [HasPermission(Permissions.Platform.TrialManage)]
    public async Task<ActionResult<ApiResponse<CreateMentorUseCaseOutput>>> CreateMentor(
        [FromBody] CreateMentorUseCaseInput input,
        [FromServices] IUseCase<CreateMentorUseCaseInput, CreateMentorUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateMentorUseCaseOutput>.Ok(result, "Đã tạo tài khoản mentor."));
    }
}
