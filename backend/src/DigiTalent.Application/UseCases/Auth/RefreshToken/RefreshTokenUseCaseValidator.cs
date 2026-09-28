using FluentValidation;

namespace DigiTalent.Application.UseCases.Auth;

public class RefreshTokenUseCaseValidator : AbstractValidator<RefreshTokenUseCaseInput>
{
    public RefreshTokenUseCaseValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}
