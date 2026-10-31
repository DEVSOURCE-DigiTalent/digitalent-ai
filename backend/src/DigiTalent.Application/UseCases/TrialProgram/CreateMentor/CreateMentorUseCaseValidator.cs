using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class CreateMentorUseCaseValidator : AbstractValidator<CreateMentorUseCaseInput>
{
    public CreateMentorUseCaseValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Nhập họ tên.").MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Email không hợp lệ.").MaximumLength(255);
        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(12, 128).WithMessage("Mật khẩu cần 12–128 ký tự.");
    }
}
