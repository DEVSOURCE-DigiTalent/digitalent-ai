namespace DigiTalent.Application.UseCases.Competency;

public class PositionRequirementItemInput
{
    public Guid CompetencyId { get; set; }
    public int RequiredLevel { get; set; }
    public decimal WeightPercent { get; set; }
    public bool IsMandatory { get; set; } = true;
    public bool RequiresPracticalEvidence { get; set; } = true;
    public string? Note { get; set; }
}

public class CreateDraftPositionRequirementSetUseCaseInput
{
    public Guid JobPositionId { get; set; }
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public List<PositionRequirementItemInput> Items { get; set; } = new();
}

public class CreateDraftPositionRequirementSetUseCaseOutput
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
}
