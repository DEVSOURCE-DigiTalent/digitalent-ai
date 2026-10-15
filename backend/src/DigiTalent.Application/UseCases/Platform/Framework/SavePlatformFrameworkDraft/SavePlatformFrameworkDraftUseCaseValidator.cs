using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Framework;

public class SavePlatformFrameworkDraftUseCaseValidator : AbstractValidator<SavePlatformFrameworkDraftUseCaseInput>
{
    public SavePlatformFrameworkDraftUseCaseValidator()
    {
        RuleForEach(x => x.Domains).ChildRules(domain =>
        {
            domain.RuleFor(d => d.Description)
                .Must(d => !string.IsNullOrWhiteSpace(d) && d.Trim().Length >= 10)
                .WithMessage("Mô tả lĩnh vực cần ít nhất 10 ký tự.")
                .MaximumLength(4000);
        });
    }
}
