using DigiTalent.Api.Authorization;
using DigiTalent.Application.ScoringConfigs.DTOs;
using DigiTalent.Application.ScoringConfigs.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1/scoring-configs")]
[Produces("application/json")]
public class ScoringConfigsController : ControllerBase
{
    private readonly ScoringConfigService _scoringConfigService;

    public ScoringConfigsController(ScoringConfigService scoringConfigService)
    {
        _scoringConfigService = scoringConfigService;
    }

    /// <summary>
    /// List all scoring configs with their items.
    /// </summary>
    [HttpGet]
    [HasPermission(PermissionConstants.ScoringConfigManage)]
    public async Task<IActionResult> GetAll()
        => Ok(ApiResponse<List<ScoringConfigResponse>>.Ok(
            await _scoringConfigService.GetAllAsync()));

    /// <summary>
    /// Get a single scoring config by config type key.
    /// </summary>
    [HttpGet("{configKey}")]
    [HasPermission(PermissionConstants.ScoringConfigManage)]
    public async Task<IActionResult> GetByConfigType(string configKey)
        => Ok(ApiResponse<ScoringConfigResponse>.Ok(
            await _scoringConfigService.GetByConfigTypeAsync(configKey)));

    /// <summary>
    /// Update items/weights of a scoring config.
    /// </summary>
    [HttpPut("{configKey}")]
    [HasPermission(PermissionConstants.ScoringConfigManage)]
    public async Task<IActionResult> Update(string configKey, [FromBody] UpdateScoringConfigRequest request)
        => Ok(ApiResponse<ScoringConfigResponse>.Ok(
            await _scoringConfigService.UpdateAsync(configKey, request), "Scoring config updated"));
}
