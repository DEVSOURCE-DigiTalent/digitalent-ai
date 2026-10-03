namespace DigiTalent.Application.UseCases.Competency;

public class UpdateDraftPositionRequirementSetUseCaseInput
{
    public Guid Id { get; set; }
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? EffectiveTo { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public List<PositionRequirementItemInput> Items { get; set; } = new();
}

public class UpdateDraftPositionRequirementSetUseCaseOutput
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
}
