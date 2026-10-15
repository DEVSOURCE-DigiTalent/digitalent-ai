using DigiTalent.Application.UseCases.Platform.Common;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class ChangePlatformOrganizationStatusUseCaseValidator : AbstractValidator<ChangePlatformOrganizationStatusUseCaseInput>
{
    public ChangePlatformOrganizationStatusUseCaseValidator()
    {
        RuleFor(x => x.Reason).ValidReason();
    }
}
