using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Trang cá nhân của nhân viên (EM-01..05, EM-18): chỉ dữ liệu của chính người đang đăng nhập.
/// </summary>
[ApiController]
[Route("api/v1/me")]
public class MyDevelopmentController : ControllerBase
{
    // GET api/v1/me/dashboard — EM-01
    [HttpGet("dashboard")]
    [HasPermission(Permissions.Account.ViewOwn)]
    public async Task<ActionResult<ApiResponse<GetMyDashboardUseCaseOutput>>> GetDashboard(
        [FromServices] IUseCase<GetMyDashboardUseCaseInput, GetMyDashboardUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyDashboardUseCaseInput());
        return Ok(ApiResponse<GetMyDashboardUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/competency-profile — EM-02
    [HttpGet("competency-profile")]
    [HasPermission(Permissions.Competency.ProfileRead)]
    public async Task<ActionResult<ApiResponse<GetMyCompetencyProfileUseCaseOutput>>> GetCompetencyProfile(
        [FromServices] IUseCase<GetMyCompetencyProfileUseCaseInput, GetMyCompetencyProfileUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyCompetencyProfileUseCaseInput());
        return Ok(ApiResponse<GetMyCompetencyProfileUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/skill-gap — EM-03
    [HttpGet("skill-gap")]
    [HasPermission(Permissions.Intelligence.SkillGapRead)]
    public async Task<ActionResult<ApiResponse<GetMySkillGapUseCaseOutput>>> GetSkillGap(
        [FromServices] IUseCase<GetMySkillGapUseCaseInput, GetMySkillGapUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMySkillGapUseCaseInput());
        return Ok(ApiResponse<GetMySkillGapUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/evidence — EM-04
    [HttpGet("evidence")]
    [HasPermission(Permissions.Competency.EvidenceRead)]
    public async Task<ActionResult<ApiResponse<GetMyEvidenceTimelineUseCaseOutput>>> GetEvidence(
        [FromServices] IUseCase<GetMyEvidenceTimelineUseCaseInput, GetMyEvidenceTimelineUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyEvidenceTimelineUseCaseInput());
        return Ok(ApiResponse<GetMyEvidenceTimelineUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/learning-path — EM-05
    [HttpGet("learning-path")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetMyLearningPathUseCaseOutput>>> GetLearningPath(
        [FromServices] IUseCase<GetMyLearningPathUseCaseInput, GetMyLearningPathUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyLearningPathUseCaseInput());
        return Ok(ApiResponse<GetMyLearningPathUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/achievements — EM-18
    [HttpGet("achievements")]
    [HasPermission(Permissions.Certificate.Read)]
    public async Task<ActionResult<ApiResponse<GetMyAchievementsUseCaseOutput>>> GetAchievements(
        [FromServices] IUseCase<GetMyAchievementsUseCaseInput, GetMyAchievementsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyAchievementsUseCaseInput());
        return Ok(ApiResponse<GetMyAchievementsUseCaseOutput>.Ok(result));
    }
}
