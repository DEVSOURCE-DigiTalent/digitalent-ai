namespace DigiTalent.Application.UseCases.Pulse;

public sealed record PulseAssignmentCriterionDto(string Title, int Points);

public sealed class PulseFinalAssignmentDto
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string ExpectedOutput { get; init; } = string.Empty;
    public string Track { get; init; } = "general";
    public IReadOnlyList<PulseAssignmentCriterionDto> Rubric { get; init; } = Array.Empty<PulseAssignmentCriterionDto>();
    public int PassScore { get; init; } = 70;
}
