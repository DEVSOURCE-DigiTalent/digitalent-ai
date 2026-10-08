using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

public class GetGapOverviewUseCaseValidator : AbstractValidator<GetGapOverviewUseCaseInput>
{
    public GetGapOverviewUseCaseValidator()
    {
        RuleFor(x => x.GroupBy)
            .Must(groupBy => groupBy is null || GapGroupings.All.Contains(groupBy.ToLowerInvariant()))
            .WithMessage("GroupBy must be department, position or grade.");

        RuleFor(x => x.JobGrade)
            .Must(grade => grade is null || JobGrades.IsValid(grade.ToUpperInvariant()))
            .WithMessage("JobGrade must be G1, G2 or G3.");
    }
}
