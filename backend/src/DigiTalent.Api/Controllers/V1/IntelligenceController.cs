using DigiTalent.Api.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Explanation.DTOs;
using DigiTalent.Application.Intelligence.DTOs;
using DigiTalent.Application.Intelligence.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1/intelligence")]
[Produces("application/json")]
public class IntelligenceController : ControllerBase
{
    private readonly IntelligenceService _intelligenceService;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public IntelligenceController(
        IntelligenceService intelligenceService,
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _intelligenceService = intelligenceService;
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Skill Gap
    // ═══════════════════════════════════════

    /// <summary>
    /// Calculate skill gap for employee and position.
    /// </summary>
    [HttpPost("skill-gaps/analyze")]
    [HasPermission(PermissionConstants.SkillGapCalculate)]
    public async Task<IActionResult> CalculateSkillGap([FromBody] AnalyzeSkillGapRequest request)
        => Ok(ApiResponse<SkillGapResultResponse>.Ok(
            await _intelligenceService.CalculateSkillGapAsync(request.EmployeeId, request.PositionId),
            "Skill gap analyzed"));

    /// <summary>
    /// List latest skill gap results.
    /// </summary>
    [HttpGet("skill-gaps")]
    [HasPermission(PermissionConstants.SkillGapRead)]
    public async Task<IActionResult> SearchSkillGaps([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<SkillGapResultResponse>>.Ok(
            await _intelligenceService.SearchSkillGapsAsync(request)));

    // ═══════════════════════════════════════
    // Learning Recommendations
    // ═══════════════════════════════════════

    /// <summary>
    /// Generate learning recommendations from skill gap and course mapping.
    /// </summary>
    [HttpPost("learning-recommendations/generate")]
    [HasPermission(PermissionConstants.LearningRecommendationGenerate)]
    public async Task<IActionResult> GenerateLearningRecommendations([FromBody] GenerateRecommendationRequest request)
        => Ok(ApiResponse<List<LearningRecommendationResponse>>.Ok(
            await _intelligenceService.GenerateLearningRecommendationsAsync(request.EmployeeId),
            "Recommendations generated"));

    /// <summary>
    /// View recommended courses/paths.
    /// </summary>
    [HttpGet("learning-recommendations")]
    [HasPermission(PermissionConstants.LearningRecommendationRead)]
    public async Task<IActionResult> SearchLearningRecommendations([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<LearningRecommendationResponse>>.Ok(
            await _intelligenceService.SearchLearningRecommendationsAsync(request)));

    // ═══════════════════════════════════════
    // Training Risk
    // ═══════════════════════════════════════

    /// <summary>
    /// Recalculate training risk scores.
    /// </summary>
    [HttpPost("training-risks/recalculate")]
    [HasPermission(PermissionConstants.TrainingRiskCalculate)]
    public async Task<IActionResult> RecalculateTrainingRisk([FromBody] RecalculateTrainingRiskRequest request)
        => Ok(ApiResponse<TrainingRiskDetailResponse>.Ok(
            await _intelligenceService.CalculateTrainingRiskAsync(request.EmployeeId),
            "Training risk recalculated"));

    /// <summary>
    /// List high-risk employees/enrollments.
    /// </summary>
    [HttpGet("training-risks")]
    [HasPermission(PermissionConstants.TrainingRiskRead)]
    public async Task<IActionResult> SearchTrainingRisks([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<TrainingRiskDetailResponse>>.Ok(
            await _intelligenceService.SearchTrainingRisksAsync(request)));

    // ═══════════════════════════════════════
    // Readiness Score
    // ═══════════════════════════════════════

    /// <summary>
    /// Recalculate workforce readiness score.
    /// </summary>
    [HttpPost("readiness/recalculate")]
    [HasPermission(PermissionConstants.ReadinessCalculate)]
    public async Task<IActionResult> RecalculateReadiness([FromBody] RecalculateReadinessRequest request)
        => Ok(ApiResponse<ReadinessScoreResponse>.Ok(
            await _intelligenceService.CalculateReadinessAsync(request.EmployeeId, request.PositionId),
            "Readiness score recalculated"));

    /// <summary>
    /// View readiness results by employee/department.
    /// </summary>
    [HttpGet("readiness")]
    [HasPermission(PermissionConstants.ReadinessRead)]
    public async Task<IActionResult> SearchReadiness([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<ReadinessScoreResponse>>.Ok(
            await _intelligenceService.SearchReadinessAsync(request)));

    // ═══════════════════════════════════════
    // Career Readiness
    // ═══════════════════════════════════════

    /// <summary>
    /// Analyze readiness against target position.
    /// </summary>
    [HttpPost("career-readiness/analyze")]
    [HasPermission(PermissionConstants.CareerReadinessRead)]
    public async Task<IActionResult> AnalyzeCareerReadiness([FromBody] AnalyzeCareerReadinessRequest request)
        => Ok(ApiResponse<CareerReadinessResponse>.Ok(
            await _intelligenceService.GetCareerReadinessAsync(request.EmployeeId, request.TargetPositionId),
            "Career readiness analyzed"));

    // ═══════════════════════════════════════
    // AI Explanations
    // ═══════════════════════════════════════

    /// <summary>
    /// View a score/recommendation explanation.
    /// </summary>
    [HttpGet("explanations/{explanationId:guid}")]
    [HasPermission(PermissionConstants.AiExplanationRead)]
    [ProducesResponseType(typeof(ApiResponse<AiExplanationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExplanation(Guid explanationId)
    {
        var explanation = await _context.AiExplanationLogs.FindAsync(explanationId)
            ?? throw new KeyNotFoundException($"Explanation {explanationId} not found.");

        // Authorization: own data or admin/manager
        if (explanation.CreatedByUserId != _currentUser.UserId
            && !_currentUser.Roles.Any(r => r == Shared.Constants.RoleConstants.SystemAdmin
                                         || r == Shared.Constants.RoleConstants.HRManager))
        {
            throw new UnauthorizedAccessException("You do not have access to this explanation.");
        }

        return Ok(ApiResponse<AiExplanationResponse>.Ok(new AiExplanationResponse
        {
            Id = explanation.Id,
            FeatureType = explanation.FeatureType,
            SourceEntityType = explanation.SourceEntityType,
            SourceEntityId = explanation.SourceEntityId,
            InputSnapshotJson = explanation.InputSnapshotJson,
            OutputText = explanation.OutputText,
            ModelProvider = explanation.ModelProvider,
            ModelName = explanation.ModelName,
            CreatedByUserId = explanation.CreatedByUserId,
            CreatedAt = explanation.CreatedAt,
        }));
    }
}
