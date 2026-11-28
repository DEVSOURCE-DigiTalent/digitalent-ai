using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class GetSignGlossesUseCaseValidator : AbstractValidator<GetSignGlossesUseCaseInput>
{
    public GetSignGlossesUseCaseValidator()
    {
        RuleFor(x => x.Stage)
            .Must(stage => string.IsNullOrEmpty(stage) || SignLanguage.Stage.IsValid(stage))
            .WithMessage("Giai đoạn phải là NO_VIDEO, NEEDS_MOTION hoặc READY.");
    }
}
