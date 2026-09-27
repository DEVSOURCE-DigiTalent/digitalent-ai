namespace DigiTalent.Application.UseCases.Competency;

public class GetCompetencyByIdUseCaseInput
{
    public Guid Id { get; set; }
}

public class CompetencyCriterionDto
{
    public Guid Id { get; set; }
    public int Level { get; set; }
    public string IndicatorCode { get; set; } = string.Empty;
    public string BehaviorIndicator { get; set; } = string.Empty;
    public string? AssessmentGuidance { get; set; }
    public string? EvidenceGuidance { get; set; }
    public int SortOrder { get; set; }
}

public class GetCompetencyByIdUseCaseOutput
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CompetencyType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<CompetencyCriterionDto> Criteria { get; set; } = new();
}
