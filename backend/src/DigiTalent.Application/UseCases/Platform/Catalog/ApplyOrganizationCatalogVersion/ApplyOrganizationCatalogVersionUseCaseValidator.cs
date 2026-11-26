using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class ApplyOrganizationCatalogVersionUseCaseValidator : AbstractValidator<ApplyOrganizationCatalogVersionUseCaseInput>
{
    public ApplyOrganizationCatalogVersionUseCaseValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.VersionNo).GreaterThan(0);
        RuleFor(x => x.Reason).MaximumLength(500);
    }
}
