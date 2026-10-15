using DigiTalent.Application.UseCases.Platform.Common;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class ChangePlatformUserLockUseCaseValidator : AbstractValidator<ChangePlatformUserLockUseCaseInput>
{
    public ChangePlatformUserLockUseCaseValidator()
    {
        RuleFor(x => x.Reason).ValidReason();
    }
}
