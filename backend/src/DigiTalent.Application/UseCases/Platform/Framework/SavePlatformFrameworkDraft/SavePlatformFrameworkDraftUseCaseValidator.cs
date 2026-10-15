using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Framework;

public class SavePlatformFrameworkDraftUseCaseValidator : AbstractValidator<SavePlatformFrameworkDraftUseCaseInput>
{
    public SavePlatformFrameworkDraftUseCaseValidator()
    {
        RuleFor(x => x.Domains).NotEmpty();
        RuleForEach(x => x.Domains).ChildRules(domain =>
        {
            domain.RuleFor(d => d.Code).NotEmpty().MaximumLength(10);
            domain.RuleFor(d => d.Description)
                .Must(d => !string.IsNullOrWhiteSpace(d) && d.Trim().Length >= 15)
                .WithMessage("Description must have at least 15 characters.")
                .MaximumLength(4000);
        });
    }
}
