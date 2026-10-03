namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class CreateJobFamilyUseCaseInput
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateJobFamilyUseCaseOutput
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
