using FluentValidation;

namespace DigiTalent.Application.UseCases.Auth;

public class SendEmailVerificationValidator : AbstractValidator<SendEmailVerificationInput>
{
    public SendEmailVerificationValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không đúng định dạng.");
    }
}

public class VerifyBusinessEmailValidator : AbstractValidator<VerifyBusinessEmailInput>
{
    public VerifyBusinessEmailValidator()
    {
        RuleFor(x => x.Email).NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không đúng định dạng.");

        RuleFor(x => x.Otp).NotEmpty().WithMessage("Mã OTP không được để trống.")
            .Length(6).WithMessage("Mã OTP phải đúng 6 ký tự.")
            .Matches(@"^\d{6}$").WithMessage("Mã OTP chỉ chứa các chữ số.");
    }
}
