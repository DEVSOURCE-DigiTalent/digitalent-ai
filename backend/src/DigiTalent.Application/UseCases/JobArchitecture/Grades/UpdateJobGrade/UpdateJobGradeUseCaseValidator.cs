using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// Lengths match job_grades (name varchar(120)); the code must be one of the fixed grades.
/// </summary>
public class UpdateJobGradeUseCaseValidator : AbstractValidator<UpdateJobGradeUseCaseInput>
{
    public UpdateJobGradeUseCaseValidator()
    {
        RuleFor(x => x.Code)
            .Must(code => JobGrades.IsValid(code?.Trim().ToUpperInvariant()))
            .WithMessage("Code must be G1, G2 or G3.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
