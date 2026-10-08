using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency;

public class GetCompetencyMatrixUseCaseValidator : AbstractValidator<GetCompetencyMatrixUseCaseInput>
{
    public GetCompetencyMatrixUseCaseValidator()
    {
        RuleFor(x => x.JobGrade)
            .Must(grade => grade is null || JobGrades.IsValid(grade.ToUpperInvariant()))
            .WithMessage("JobGrade must be G1, G2 or G3.");
    }
}
