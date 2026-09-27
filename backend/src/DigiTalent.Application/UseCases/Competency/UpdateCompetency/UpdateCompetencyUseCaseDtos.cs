namespace DigiTalent.Application.UseCases.Competency;

public class UpdateCompetencyUseCaseInput
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CompetencyType { get; set; }
    public List<CreateCompetencyCriterionInput>? Criteria { get; set; }
}

public class UpdateCompetencyUseCaseOutput
{
    public Guid Id { get; set; }
}
