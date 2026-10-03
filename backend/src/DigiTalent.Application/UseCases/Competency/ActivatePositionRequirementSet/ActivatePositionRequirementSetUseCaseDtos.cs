namespace DigiTalent.Application.UseCases.Competency;

public class ActivatePositionRequirementSetUseCaseInput
{
    public Guid Id { get; set; }
}

public class ActivatePositionRequirementSetUseCaseOutput
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? ActivatedAt { get; set; }
}
