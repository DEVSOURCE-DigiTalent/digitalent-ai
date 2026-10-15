using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class AddPlatformModuleBlockUseCaseValidator : AbstractValidator<AddPlatformModuleBlockUseCaseInput>
{
    public AddPlatformModuleBlockUseCaseValidator()
    {
        RuleFor(x => x.Type)
            .Must(t => PlatformCatalog.BlockType.IsValid(t?.Trim().ToUpperInvariant()))
            .WithMessage("Loại khối phải là TEXT, SLIDE, IMAGE hoặc VIDEO.");
        RuleFor(x => x.Position).GreaterThanOrEqualTo(0).When(x => x.Position.HasValue);
    }
}
