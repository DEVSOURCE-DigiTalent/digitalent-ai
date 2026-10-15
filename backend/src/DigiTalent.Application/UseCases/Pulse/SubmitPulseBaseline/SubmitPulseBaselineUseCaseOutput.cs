namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseBaselineUseCaseOutput
{
    public DateTimeOffset AssessedAt { get; set; }
    public List<PulseBaselineDomainDto> Domains { get; set; } = new();
}
