namespace DigiTalent.Application.UseCases.TrialProgram;

public class GetPlatformTrialsUseCaseInput
{
    /// <summary>SETUP | REQUESTED | ASSIGNED | REPORTED; trống = tất cả.</summary>
    public string? Stage { get; set; }
}
