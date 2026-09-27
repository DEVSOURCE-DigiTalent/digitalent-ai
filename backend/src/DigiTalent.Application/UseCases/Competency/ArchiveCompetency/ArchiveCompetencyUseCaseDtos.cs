namespace DigiTalent.Application.UseCases.Competency;

public class ArchiveCompetencyUseCaseInput
{
    public Guid Id { get; set; }
}

public class ArchiveCompetencyUseCaseOutput
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
