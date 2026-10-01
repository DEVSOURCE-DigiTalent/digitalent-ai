using FluentValidation;

namespace DigiTalent.Application.UseCases.Auth;

public class LoginUseCaseValidator : AbstractValidator<LoginUseCaseInput>
{
    public LoginUseCaseValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
