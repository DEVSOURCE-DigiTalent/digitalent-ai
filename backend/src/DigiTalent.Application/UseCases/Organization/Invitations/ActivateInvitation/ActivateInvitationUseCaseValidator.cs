using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Password policy of the platform: 8–128 characters and not a common password.
/// "Not the e-mail address" needs the invitation, so the use case checks it.
/// </summary>
public class ActivateInvitationUseCaseValidator : AbstractValidator<ActivateInvitationUseCaseInput>
{
    private static readonly HashSet<string> CommonPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "12345678", "123456789", "1234567890", "123456789012",
        "password", "password1", "password12", "password1234", "password@123",
        "qwertyui", "qwerty123456", "admin@123456", "11111111", "00000000",
        "matkhau1", "matkhau12345", "123456789abc",
    };

    public ActivateInvitationUseCaseValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FullName).MaximumLength(200);
        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(8, 128)
            .Must(password => !CommonPasswords.Contains(password))
            .WithMessage("Mật khẩu quá phổ biến, vui lòng chọn mật khẩu an toàn hơn.");
    }
}
