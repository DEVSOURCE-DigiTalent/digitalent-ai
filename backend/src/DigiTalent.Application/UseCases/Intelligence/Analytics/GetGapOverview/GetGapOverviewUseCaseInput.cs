namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

public class GetGapOverviewUseCaseInput : SkillGapAnalyticsFilter
{
    /// <summary>department (default) / position / grade.</summary>
    public string? GroupBy { get; set; }
}
