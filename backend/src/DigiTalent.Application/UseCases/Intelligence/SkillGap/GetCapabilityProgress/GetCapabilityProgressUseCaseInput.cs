namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.GetCapabilityProgress;

public sealed class GetCapabilityProgressInput
{
    /// <summary>Only this department (still within the caller's scope); null = every visible employee.</summary>
    public Guid? DepartmentId { get; set; }
}
