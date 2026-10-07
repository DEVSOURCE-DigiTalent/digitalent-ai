using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Password policy of the platform (CLAUDE.md "Gating & Security"): 12–128 characters and not a common password.
/// "Not the e-mail address" needs the invitation, so the use case checks it.
/// </summary>
public class ActivateInvitationUseCaseValidator : AbstractValidator<ActivateInvitationUseCaseInput>
{
    private static readonly HashSet<string> CommonPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "123456789012", "password1234", "password@123", "qwerty123456", "admin@123456", "matkhau12345", "123456789abc",
    };

    public ActivateInvitationUseCaseValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FullName).MaximumLength(200);
        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(12, 128)
            .Must(password => !CommonPasswords.Contains(password))
            .WithMessage("The password is too common.");
    }
}
