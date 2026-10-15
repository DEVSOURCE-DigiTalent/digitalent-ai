using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformModuleQuestionUseCaseValidator : AbstractValidator<UpdatePlatformModuleQuestionUseCaseInput>
{
    public UpdatePlatformModuleQuestionUseCaseValidator()
    {
        PlatformQuestionRules.Apply(this);
    }
}
