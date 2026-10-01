namespace DigiTalent.Application.UseCases.Competency;

public class CreateCompetencyCriterionInput
{
    public int Level { get; set; }
    public string IndicatorCode { get; set; } = string.Empty;
    public string BehaviorIndicator { get; set; } = string.Empty;
    public string? AssessmentGuidance { get; set; }
    public string? EvidenceGuidance { get; set; }
    public string? SourceNote { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class CreateCompetencyUseCaseInput
{
    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CompetencyType { get; set; }
    public string? Status { get; set; }
    public List<CreateCompetencyCriterionInput>? Criteria { get; set; }
}

public class CreateCompetencyUseCaseOutput
{
    public Guid Id { get; set; }
}
