using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Skill Gap Engine (NF-01). Phạm vi dữ liệu: HR toàn tổ chức, Department Manager trong phòng, còn lại chỉ bản thân.
/// </summary>
[ApiController]
[Route("api/v1/intelligence/skill-gaps")]
public class SkillGapsController : ControllerBase
{
    // POST api/v1/intelligence/skill-gaps/calculate
    [HttpPost("calculate")]
    [HasPermission(Permissions.Intelligence.SkillGapCalculate)]
    public async Task<ActionResult<ApiResponse<SkillGapRunDetail>>> Calculate(
        [FromBody] CalculateSkillGapUseCaseInput input,
        [FromServices] IUseCase<CalculateSkillGapUseCaseInput, SkillGapRunDetail> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SkillGapRunDetail>.Ok(result, "Skill gap calculated."));
    }

    // POST api/v1/intelligence/skill-gaps/calculate-batch
    [HttpPost("calculate-batch")]
    [HasPermission(Permissions.Intelligence.SkillGapCalculate)]
    public async Task<ActionResult<ApiResponse<CalculateSkillGapBatchUseCaseOutput>>> CalculateBatch(
        [FromBody] CalculateSkillGapBatchUseCaseInput input,
        [FromServices] IUseCase<CalculateSkillGapBatchUseCaseInput, CalculateSkillGapBatchUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CalculateSkillGapBatchUseCaseOutput>.Ok(result, $"Skill gap calculated for {result.CalculatedCount} employee(s)."));
    }

    // GET api/v1/intelligence/skill-gaps?pageIndex=1&pageSize=20&departmentId=&latestOnly=true
    [HttpGet]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<GetSkillGapRunsUseCaseOutput>>> GetRuns(
        [FromQuery] GetSkillGapRunsUseCaseInput input,
        [FromServices] IUseCase<GetSkillGapRunsUseCaseInput, GetSkillGapRunsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetSkillGapRunsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/intelligence/skill-gaps/me/latest — khai báo trước {runId:guid}
    [HttpGet("me/latest")]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<SkillGapRunDetail?>>> GetMyLatest(
        [FromServices] IUseCase<GetMyLatestSkillGapUseCaseInput, SkillGapRunDetail?> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyLatestSkillGapUseCaseInput());
        return Ok(ApiResponse<SkillGapRunDetail?>.Ok(result, result == null ? "No skill gap analysis yet." : "Success"));
    }

    // GET api/v1/intelligence/skill-gaps/{runId}
    [HttpGet("{runId:guid}")]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<SkillGapRunDetail>>> GetById(
        Guid runId,
        [FromServices] IUseCase<GetSkillGapRunByIdUseCaseInput, SkillGapRunDetail> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetSkillGapRunByIdUseCaseInput { RunId = runId });
        return Ok(ApiResponse<SkillGapRunDetail>.Ok(result));
    }
}
