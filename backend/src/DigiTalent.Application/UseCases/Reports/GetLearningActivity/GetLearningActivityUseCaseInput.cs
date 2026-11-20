namespace DigiTalent.Application.UseCases.Reports.GetLearningActivity;

public sealed class GetLearningActivityInput
{
    /// <summary>Weeks of the rhythm chart, the current one included (1–26, default 8).</summary>
    public int Weeks { get; set; } = 8;
}
