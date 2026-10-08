using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class CreateJobPositionUseCaseValidator : AbstractValidator<CreateJobPositionUseCaseInput>
{
    public CreateJobPositionUseCaseValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(50).WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(180).WithMessage("Name cannot exceed 180 characters.");

        RuleFor(x => x.JobGrade)
            .Must(grade => string.IsNullOrWhiteSpace(grade) || JobGrades.IsValid(grade.Trim().ToUpperInvariant()))
            .WithMessage("JobGrade must be G1, G2 or G3.");
    }
}
