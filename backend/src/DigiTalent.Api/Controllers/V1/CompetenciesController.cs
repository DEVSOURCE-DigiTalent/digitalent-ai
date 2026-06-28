using DigiTalent.Api.Authorization;
using DigiTalent.Application.Competency.DTOs;
using DigiTalent.Application.Competency.Services;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class CompetenciesController : ControllerBase
{
    private readonly CompetencyService _competencyService;

    public CompetenciesController(CompetencyService competencyService)
        => _competencyService = competencyService;

    // ═══════════════════════════════════════
    // Competency Categories
    // ═══════════════════════════════════════

    [HttpGet("competency-categories")]
    [HasPermission(PermissionConstants.CompetencyCategoryRead)]
    public async Task<IActionResult> SearchCategories([FromQuery] PaginationRequest request)
    {
        // Non-paged listing if no pagination params specified
        if (request.PageIndex <= 1 && request.PageSize >= 1000)
            return Ok(ApiResponse<List<CompetencyCategoryResponse>>.Ok(
                await _competencyService.GetAllCategoriesAsync()));

        return Ok(ApiResponse<PagedList<CompetencyCategoryResponse>>.Ok(
            await _competencyService.SearchCategoriesAsync(request)));
    }

    [HttpGet("competency-categories/{categoryId:guid}")]
    [HasPermission(PermissionConstants.CompetencyCategoryRead)]
    public async Task<IActionResult> GetCategory(Guid categoryId)
        => Ok(ApiResponse<CompetencyCategoryDetailResponse>.Ok(
            await _competencyService.GetCategoryAsync(categoryId)));

    [HttpPost("competency-categories")]
    [HasPermission(PermissionConstants.CompetencyCategoryManage)]
    [ProducesResponseType(typeof(ApiResponse<CompetencyCategoryResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCompetencyCategoryRequest request)
    {
        var result = await _competencyService.CreateCategoryAsync(request);
        return CreatedAtAction(nameof(GetCategory), new { categoryId = result.Id },
            ApiResponse<CompetencyCategoryResponse>.Ok(result, "Category created"));
    }

    [HttpPut("competency-categories/{categoryId:guid}")]
    [HasPermission(PermissionConstants.CompetencyCategoryManage)]
    public async Task<IActionResult> UpdateCategory(Guid categoryId, [FromBody] UpdateCompetencyCategoryRequest request)
        => Ok(ApiResponse<CompetencyCategoryResponse>.Ok(
            await _competencyService.UpdateCategoryAsync(categoryId, request)));

    [HttpPatch("competency-categories/{categoryId:guid}/status")]
    [HasPermission(PermissionConstants.CompetencyCategoryManage)]
    public async Task<IActionResult> ChangeCategoryStatus(Guid categoryId, [FromBody] StatusChangeRequest request)
    {
        await _competencyService.ChangeCategoryStatusAsync(categoryId, request.Status);
        return NoContent();
    }

    // ═══════════════════════════════════════
    // Competencies
    // ═══════════════════════════════════════

    [HttpGet("competencies")]
    [HasPermission(PermissionConstants.CompetencyRead)]
    public async Task<IActionResult> SearchCompetencies([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<CompetencyResponse>>.Ok(
            await _competencyService.SearchCompetenciesAsync(request)));

    [HttpGet("competencies/by-category/{categoryId:guid}")]
    [HasPermission(PermissionConstants.CompetencyRead)]
    public async Task<IActionResult> GetCompetenciesByCategory(Guid categoryId)
        => Ok(ApiResponse<List<CompetencyResponse>>.Ok(
            await _competencyService.GetCompetenciesByCategoryAsync(categoryId)));

    [HttpPost("competencies")]
    [HasPermission(PermissionConstants.CompetencyManage)]
    [ProducesResponseType(typeof(ApiResponse<CompetencyResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCompetency([FromBody] CreateCompetencyRequest request)
    {
        var result = await _competencyService.CreateCompetencyAsync(request);
        return CreatedAtAction(nameof(SearchCompetencies), new { competencyId = result.Id },
            ApiResponse<CompetencyResponse>.Ok(result, "Competency created"));
    }

    [HttpPut("competencies/{competencyId:guid}")]
    [HasPermission(PermissionConstants.CompetencyManage)]
    public async Task<IActionResult> UpdateCompetency(Guid competencyId, [FromBody] UpdateCompetencyRequest request)
        => Ok(ApiResponse<CompetencyResponse>.Ok(
            await _competencyService.UpdateCompetencyAsync(competencyId, request)));

    // ═══════════════════════════════════════
    // Competency Levels
    // ═══════════════════════════════════════

    [HttpGet("competency-levels")]
    [HasPermission(PermissionConstants.CompetencyRead)]
    public async Task<IActionResult> GetAllLevels()
        => Ok(ApiResponse<List<CompetencyLevelResponse>>.Ok(
            await _competencyService.GetAllLevelsAsync()));

    [HttpPost("competency-levels")]
    [HasPermission(PermissionConstants.CompetencyCategoryManage)]
    [ProducesResponseType(typeof(ApiResponse<CompetencyLevelResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateLevel([FromBody] CreateCompetencyLevelRequest request)
    {
        var result = await _competencyService.CreateLevelAsync(request);
        return CreatedAtAction(nameof(GetAllLevels), new { levelId = result.Id },
            ApiResponse<CompetencyLevelResponse>.Ok(result, "Level created"));
    }

    [HttpPut("competency-levels/{levelId:guid}")]
    [HasPermission(PermissionConstants.CompetencyCategoryManage)]
    public async Task<IActionResult> UpdateLevel(Guid levelId, [FromBody] UpdateCompetencyLevelRequest request)
        => Ok(ApiResponse<CompetencyLevelResponse>.Ok(
            await _competencyService.UpdateLevelAsync(levelId, request)));

    // ═══════════════════════════════════════
    // Position Competency Requirements
    // ═══════════════════════════════════════

    [HttpGet("job-positions/{positionId:guid}/competency-requirements")]
    [HasPermission(PermissionConstants.PositionRequirementRead)]
    public async Task<IActionResult> GetPositionRequirements(Guid positionId)
        => Ok(ApiResponse<List<PositionCompetencyRequirementResponse>>.Ok(
            await _competencyService.GetPositionRequirementsAsync(positionId)));

    [HttpPut("job-positions/{positionId:guid}/competency-requirements")]
    [HasPermission(PermissionConstants.PositionRequirementManage)]
    public async Task<IActionResult> SavePositionRequirements(
        Guid positionId, [FromBody] SavePositionRequirementsRequest request)
        => Ok(ApiResponse<List<PositionCompetencyRequirementResponse>>.Ok(
            await _competencyService.SavePositionRequirementsAsync(positionId, request),
            "Requirements saved"));

    // ═══════════════════════════════════════
    // Employee Competency Profiles
    // ═══════════════════════════════════════

    [HttpGet("employees/{employeeId:guid}/competency-profile")]
    [HasPermission(PermissionConstants.EmployeeCompetencyProfileRead)]
    public async Task<IActionResult> GetEmployeeProfile(Guid employeeId)
        => Ok(ApiResponse<List<EmployeeCompetencyProfileDetailResponse>>.Ok(
            await _competencyService.GetEmployeeProfileAsync(employeeId)));

    [HttpPut("employees/{employeeId:guid}/competency-profile/{competencyId:guid}")]
    [HasPermission(PermissionConstants.EmployeeCompetencyProfileOverride)]
    public async Task<IActionResult> UpdateEmployeeProfile(
        Guid employeeId, Guid competencyId, [FromBody] UpdateEmployeeCompetencyProfileRequest request)
        => Ok(ApiResponse<EmployeeCompetencyProfileResponse>.Ok(
            await _competencyService.UpdateEmployeeProfileAsync(employeeId, competencyId, request),
            "Profile updated"));

    // ═══════════════════════════════════════
    // Competency Evidence
    // ═══════════════════════════════════════

    [HttpGet("employees/{employeeId:guid}/competency-evidences")]
    [HasPermission(PermissionConstants.EvidenceRead)]
    public async Task<IActionResult> SearchEvidences(
        Guid employeeId, [FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<CompetencyEvidenceResponse>>.Ok(
            await _competencyService.SearchEvidencesAsync(employeeId, request)));

    [HttpPost("employees/{employeeId:guid}/competency-evidences")]
    [HasPermission(PermissionConstants.EvidenceCreateManual)]
    public async Task<IActionResult> CreateEvidence(
        Guid employeeId, [FromBody] CreateCompetencyEvidenceRequest request)
        => Ok(ApiResponse<CompetencyEvidenceResponse>.Ok(
            await _competencyService.CreateEvidenceAsync(employeeId, request), "Evidence created"));

    [HttpPut("competency-evidences/{evidenceId:guid}/review")]
    [HasPermission(PermissionConstants.EvidenceApproveConfirm)]
    public async Task<IActionResult> ReviewEvidence(
        Guid evidenceId, [FromBody] ReviewEvidenceRequest request)
        => Ok(ApiResponse<CompetencyEvidenceResponse>.Ok(
            await _competencyService.ReviewEvidenceAsync(evidenceId, request),
            $"Evidence {request.Status.ToLower()}"));
}
