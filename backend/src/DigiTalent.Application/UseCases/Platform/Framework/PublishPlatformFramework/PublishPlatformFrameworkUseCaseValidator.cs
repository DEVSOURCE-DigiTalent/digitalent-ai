using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Framework;

public class PublishPlatformFrameworkUseCaseValidator : AbstractValidator<PublishPlatformFrameworkUseCaseInput>
{
    public PublishPlatformFrameworkUseCaseValidator()
    {
        RuleFor(x => x.ReleaseNote).MaximumLength(1000);
    }
}
