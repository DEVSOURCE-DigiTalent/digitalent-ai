namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class UpdateJobPositionUseCaseInput
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? JobFamilyId { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class UpdateJobPositionUseCaseOutput
{
    public Guid Id { get; set; }
}
