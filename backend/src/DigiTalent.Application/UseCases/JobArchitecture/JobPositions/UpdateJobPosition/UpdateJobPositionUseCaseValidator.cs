using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class UpdateJobPositionUseCaseValidator : AbstractValidator<UpdateJobPositionUseCaseInput>
{
    public UpdateJobPositionUseCaseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(50).WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(180).WithMessage("Name cannot exceed 180 characters.");

        RuleFor(x => x.Status)
            .Must(s => s == Statuses.MasterData.Active || s == Statuses.MasterData.Inactive)
            .WithMessage("Status must be ACTIVE or INACTIVE.");
    }
}
