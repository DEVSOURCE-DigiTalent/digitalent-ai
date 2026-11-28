using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class SavePlatformAssetCaptionsUseCaseValidator : AbstractValidator<SavePlatformAssetCaptionsUseCaseInput>
{
    public SavePlatformAssetCaptionsUseCaseValidator()
    {
        RuleFor(x => x.Cues).NotNull().WithMessage("Thiếu danh sách câu lời thoại.");
        RuleFor(x => x.Cues).Must(c => c == null || c.Count <= PlatformCatalog.Captions.MaxCues)
            .WithMessage($"Tối đa {PlatformCatalog.Captions.MaxCues} câu lời thoại cho một video.");
    }
}
