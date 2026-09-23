using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

public class UpdateDepartmentUseCaseValidator : AbstractValidator<UpdateDepartmentUseCaseInput>
{
    public UpdateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
