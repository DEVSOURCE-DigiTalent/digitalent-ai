namespace DigiTalent.Application.Competency.DTOs;

// ═══════════════════════════════════════════════
// Competency Categories
// ═══════════════════════════════════════════════

public class CreateCompetencyCategoryRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}

public class UpdateCompetencyCategoryRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}

public class CompetencyCategoryResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public int CompetencyCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CompetencyCategoryDetailResponse : CompetencyCategoryResponse
{
    public List<CompetencyResponse> Competencies { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Competencies
// ═══════════════════════════════════════════════

public class CreateCompetencyRequest
{
    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateCompetencyRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
}

public class CompetencyResponse
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Competency Levels
// ═══════════════════════════════════════════════

public class CreateCompetencyLevelRequest
{
    public int LevelValue { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AchievementCriteria { get; set; }
}

public class UpdateCompetencyLevelRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? AchievementCriteria { get; set; }
    public string? Status { get; set; }
}

public class CompetencyLevelResponse
{
    public Guid Id { get; set; }
    public int LevelValue { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AchievementCriteria { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Position Competency Requirements
// ═══════════════════════════════════════════════

public class SavePositionCompetencyRequirementRequest
{
    public Guid CompetencyId { get; set; }
    public int RequiredLevelValue { get; set; }
    public decimal Weight { get; set; }
    public bool IsMandatory { get; set; }
}

public class SavePositionRequirementsRequest
{
    public List<SavePositionCompetencyRequirementRequest> Requirements { get; set; } = new();
}

public class PositionCompetencyRequirementResponse
{
    public Guid Id { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int RequiredLevelValue { get; set; }
    public decimal Weight { get; set; }
    public bool IsMandatory { get; set; }
}

// ═══════════════════════════════════════════════
// Employee Competency Profile
// ═══════════════════════════════════════════════

public class UpdateEmployeeCompetencyProfileRequest
{
    public int CurrentLevelValue { get; set; }
    public decimal? ConfidenceScore { get; set; }
}

public class EmployeeCompetencyProfileResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int CurrentLevelValue { get; set; }
    public decimal? ConfidenceScore { get; set; }
    public DateTimeOffset? LastEvaluatedAt { get; set; }
}

public class EmployeeCompetencyProfileDetailResponse : EmployeeCompetencyProfileResponse
{
    public int? PositionRequiredLevel { get; set; }
    public int GapLevel => PositionRequiredLevel.HasValue
        ? Math.Max(0, PositionRequiredLevel.Value - CurrentLevelValue)
        : 0;
    public bool IsMet => !PositionRequiredLevel.HasValue || CurrentLevelValue >= PositionRequiredLevel.Value;
}

// ═══════════════════════════════════════════════
// Competency Evidence
// ═══════════════════════════════════════════════

public class CreateCompetencyEvidenceRequest
{
    public Guid CompetencyId { get; set; }
    public string EvidenceType { get; set; } = string.Empty;
    public string SourceEntityType { get; set; } = string.Empty;
    public Guid SourceEntityId { get; set; }
    public decimal? EvidenceScore { get; set; }
    public string? Notes { get; set; }
}

public class ReviewEvidenceRequest
{
    public string Status { get; set; } = string.Empty; // APPROVED / REJECTED
    public string? Notes { get; set; }
    public int? ConfirmedLevelValue { get; set; }
}

public class CompetencyEvidenceResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string EvidenceType { get; set; } = string.Empty;
    public string SourceEntityType { get; set; } = string.Empty;
    public Guid SourceEntityId { get; set; }
    public decimal? EvidenceScore { get; set; }
    public int? ConfirmedLevelValue { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
