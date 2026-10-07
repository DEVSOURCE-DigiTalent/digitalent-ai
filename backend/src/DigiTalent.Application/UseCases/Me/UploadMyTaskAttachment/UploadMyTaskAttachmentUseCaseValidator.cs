using FluentValidation;

namespace DigiTalent.Application.UseCases.Me;

public class UploadMyTaskAttachmentUseCaseValidator : AbstractValidator<UploadMyTaskAttachmentUseCaseInput>
{
    public UploadMyTaskAttachmentUseCaseValidator()
    {
        RuleFor(x => x.Content).NotNull().WithMessage("Chưa chọn tệp.");
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("Tên tệp không được để trống.")
            .MaximumLength(255)
            .Must(MyTaskAttachmentRules.IsAllowed)
            .WithMessage($"Định dạng tệp không được hỗ trợ. Cho phép: {string.Join(", ", MyTaskAttachmentRules.AllowedExtensions)}.");
        RuleFor(x => x.SizeBytes)
            .GreaterThan(0).WithMessage("Tệp rỗng.")
            .LessThanOrEqualTo(MyTaskAttachmentRules.MaxBytes)
            .WithMessage($"Tệp vượt quá {MyTaskAttachmentRules.MaxBytes / (1024 * 1024)}MB.");
    }
}
