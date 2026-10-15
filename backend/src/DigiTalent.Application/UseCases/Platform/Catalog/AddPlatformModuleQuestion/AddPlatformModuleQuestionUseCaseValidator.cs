using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class AddPlatformModuleQuestionUseCaseValidator : AbstractValidator<AddPlatformModuleQuestionUseCaseInput>
{
    public AddPlatformModuleQuestionUseCaseValidator()
    {
        PlatformQuestionRules.Apply(this);
    }
}
