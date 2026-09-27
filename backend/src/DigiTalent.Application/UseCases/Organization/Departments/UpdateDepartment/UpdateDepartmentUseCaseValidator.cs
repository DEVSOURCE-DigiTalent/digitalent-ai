using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

public class UpdateDepartmentUseCaseValidator : AbstractValidator<UpdateDepartmentUseCaseInput>
{
    public UpdateDepartmentUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(180);
        RuleFor(x => x.Status).NotEmpty().MaximumLength(30);
    }
}
