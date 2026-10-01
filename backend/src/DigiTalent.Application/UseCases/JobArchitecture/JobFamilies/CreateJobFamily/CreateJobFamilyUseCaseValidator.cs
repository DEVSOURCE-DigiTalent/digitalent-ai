using FluentValidation;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class CreateJobFamilyUseCaseValidator : AbstractValidator<CreateJobFamilyUseCaseInput>
{
    public CreateJobFamilyUseCaseValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Job family code is required.")
            .MaximumLength(50).WithMessage("Job family code cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job family name is required.")
            .MaximumLength(200).WithMessage("Job family name cannot exceed 200 characters.");
    }
}
