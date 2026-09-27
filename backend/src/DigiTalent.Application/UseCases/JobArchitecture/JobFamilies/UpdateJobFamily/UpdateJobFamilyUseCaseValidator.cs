using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class UpdateJobFamilyUseCaseValidator : AbstractValidator<UpdateJobFamilyUseCaseInput>
{
    public UpdateJobFamilyUseCaseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Job family Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Job family name is required.")
            .MaximumLength(200).WithMessage("Job family name cannot exceed 200 characters.");

        RuleFor(x => x.Status)
            .Must(s => s == Statuses.MasterData.Active || s == Statuses.MasterData.Inactive)
            .WithMessage("Status must be ACTIVE or INACTIVE.");
    }
}
