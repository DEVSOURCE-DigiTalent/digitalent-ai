using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.TrialProgram;

internal static class TrialAssessmentResults
{
    public static bool IsReady(TrialAssessment? assessment, IReadOnlyCollection<TrialAssessmentDomain>? domains) =>
        assessment != null && IsReady(assessment.ReviewedAt, assessment.ChoiceScore, assessment.ChoiceTotal, domains);

    // Compare the stored domain breakdown in memory after reading it for the survey or employee.
    public static bool IsReady(DateTimeOffset? reviewedAt, int choiceScore, int choiceTotal,
        IReadOnlyCollection<TrialAssessmentDomain>? domains) =>
        reviewedAt != null || (domains != null && choiceTotal > 0 && choiceScore >= 0 && choiceScore <= choiceTotal
            && domains.Sum(d => d.BasicTotal + d.IntermediateTotal + d.AdvancedTotal) == choiceTotal
            && domains.Sum(d => d.BasicCorrect + d.IntermediateCorrect + d.AdvancedCorrect) == choiceScore);
}
