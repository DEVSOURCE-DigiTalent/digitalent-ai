using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Intelligence.Analytics;

public class GetCompetencyGapsUseCaseValidator : AbstractValidator<GetCompetencyGapsUseCaseInput>
{
    public GetCompetencyGapsUseCaseValidator()
    {
        RuleFor(x => x.JobGrade)
            .Must(grade => grade is null || JobGrades.IsValid(grade.ToUpperInvariant()))
            .WithMessage("JobGrade must be G1, G2 or G3.");
    }
}
