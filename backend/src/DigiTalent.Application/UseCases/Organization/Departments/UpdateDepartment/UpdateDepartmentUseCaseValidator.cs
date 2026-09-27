using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

public class UpdateDepartmentUseCaseValidator : AbstractValidator<UpdateDepartmentUseCaseInput>
{
    public UpdateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(180);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Status)
            .Must(status => status is Statuses.MasterData.Active or Statuses.MasterData.Inactive)
            .WithMessage("Status must be ACTIVE or INACTIVE.");
    }
}
