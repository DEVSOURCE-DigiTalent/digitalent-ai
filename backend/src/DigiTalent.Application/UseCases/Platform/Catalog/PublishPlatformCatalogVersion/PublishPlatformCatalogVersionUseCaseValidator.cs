using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class PublishPlatformCatalogVersionUseCaseValidator : AbstractValidator<PublishPlatformCatalogVersionUseCaseInput>
{
    public PublishPlatformCatalogVersionUseCaseValidator()
    {
        RuleFor(x => x.ReleaseNote).MaximumLength(1000);
    }
}
