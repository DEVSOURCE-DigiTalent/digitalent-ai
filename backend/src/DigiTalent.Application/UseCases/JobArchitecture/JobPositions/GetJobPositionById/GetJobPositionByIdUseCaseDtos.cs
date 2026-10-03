namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetJobPositionByIdUseCaseInput
{
    public Guid Id { get; set; }
}

public class GetJobPositionByIdUseCaseOutput
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? JobFamilyId { get; set; }
    public string? JobFamilyName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
