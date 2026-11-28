using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class UpdateSignGlossUseCaseValidator : AbstractValidator<UpdateSignGlossUseCaseInput>
{
    public UpdateSignGlossUseCaseValidator()
    {
        RuleFor(x => x.SourceName).MaximumLength(200);
        RuleFor(x => x.SourceUrl).MaximumLength(500);
        RuleFor(x => x.LicenseNote).MaximumLength(500);
        RuleFor(x => x.Priority).InclusiveBetween((short)-1000, (short)1000);
    }
}
