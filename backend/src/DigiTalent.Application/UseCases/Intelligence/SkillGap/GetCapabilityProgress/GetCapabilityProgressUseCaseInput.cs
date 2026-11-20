namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.GetCapabilityProgress;

public sealed class GetCapabilityProgressInput
{
    /// <summary>Only the people holding this position (still within the caller's scope); null = every visible employee.</summary>
    public Guid? PositionId { get; set; }
}
