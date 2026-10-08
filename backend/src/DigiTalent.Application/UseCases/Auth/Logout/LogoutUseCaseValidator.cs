using FluentValidation;

namespace DigiTalent.Application.UseCases.Auth;

public class LogoutUseCaseValidator : AbstractValidator<LogoutUseCaseInput>
{
    public LogoutUseCaseValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}
