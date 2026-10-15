using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Framework;

public class UpdatePlatformFrameworkDomainUseCaseValidator : AbstractValidator<UpdatePlatformFrameworkDomainUseCaseInput>
{
    public UpdatePlatformFrameworkDomainUseCaseValidator()
    {
        RuleFor(x => x.Name)
            .Must(n => !string.IsNullOrWhiteSpace(n) && n.Trim().Length >= 2).WithMessage("Tên lĩnh vực cần ít nhất 2 ký tự.")
            .MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(4000);
    }
}
