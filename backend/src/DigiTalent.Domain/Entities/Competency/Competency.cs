using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Competency;

public class CompetencyCategory : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<Competency> Competencies { get; set; } = new List<Competency>();
}

public class Competency : AuditableEntity
{
    public Guid CategoryId { get; set; }
    public CompetencyCategory Category { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "ACTIVE";
}

public class CompetencyLevel : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public int LevelValue { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AchievementCriteria { get; set; }
    public string Status { get; set; } = "ACTIVE";
}

public class PositionCompetencyRequirement : AuditableEntity
{
    public Guid JobPositionId { get; set; }
    public Organization.JobPosition JobPosition { get; set; } = null!;
    public Guid CompetencyId { get; set; }
    public Competency Competency { get; set; } = null!;
    public int RequiredLevelValue { get; set; }
    public decimal Weight { get; set; }
    public bool IsMandatory { get; set; }
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
}

public class EmployeeCompetencyProfile : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Organization.Employee Employee { get; set; } = null!;
    public Guid CompetencyId { get; set; }
    public Competency Competency { get; set; } = null!;
    public int CurrentLevelValue { get; set; }
    public decimal? ConfidenceScore { get; set; }
    public Guid? LastEvidenceId { get; set; }
    public DateTimeOffset? LastEvaluatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}

public class CompetencyEvidence : AuditableEntity
{
    public Guid EmployeeId { get; set; }
    public Organization.Employee Employee { get; set; } = null!;
    public Guid CompetencyId { get; set; }
    public Competency Competency { get; set; } = null!;
    public string EvidenceType { get; set; } = string.Empty;
    public string SourceEntityType { get; set; } = string.Empty;
    public Guid SourceEntityId { get; set; }
    public decimal? EvidenceScore { get; set; }
    public int? ConfirmedLevelValue { get; set; }
    public Guid? VerifiedByUserId { get; set; }
    public string Status { get; set; } = "PENDING";
    public string? Notes { get; set; }
}
