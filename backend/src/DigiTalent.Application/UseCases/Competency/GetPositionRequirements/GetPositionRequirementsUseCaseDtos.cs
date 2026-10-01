namespace DigiTalent.Application.UseCases.Competency;

public class GetPositionRequirementsUseCaseInput
{
    public Guid PositionId { get; set; }
    public int? VersionNo { get; set; }
}

public class PositionRequirementItemDto
{
    public Guid Id { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string CompetencyType { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int RequiredLevel { get; set; }
    public decimal WeightPercent { get; set; }
    public bool IsMandatory { get; set; }
    public bool RequiresPracticalEvidence { get; set; }
    public string? Note { get; set; }
}

public class GetPositionRequirementsUseCaseOutput
{
    public Guid? Id { get; set; }
    public Guid JobPositionId { get; set; }
    public string JobPositionCode { get; set; } = string.Empty;
    public string JobPositionName { get; set; } = string.Empty;
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? ActivatedByUserId { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }
    public List<PositionRequirementItemDto> Items { get; set; } = new();
}
