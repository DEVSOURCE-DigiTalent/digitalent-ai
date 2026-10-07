using FluentValidation;

namespace DigiTalent.Application.UseCases.Me;

public class SubmitMyTaskUseCaseValidator : AbstractValidator<SubmitMyTaskUseCaseInput>
{
    public SubmitMyTaskUseCaseValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Vui lòng mô tả giải pháp và kết quả đạt được.")
            .MinimumLength(20).WithMessage("Mô tả cần tối thiểu 20 ký tự.")
            .MaximumLength(10000);

        RuleFor(x => x.LinkUrls)
            .NotNull()
            .Must(links => links.Count <= MyTaskAttachmentRules.MaxLinksPerSubmission)
            .WithMessage($"Tối đa {MyTaskAttachmentRules.MaxLinksPerSubmission} đường dẫn.");
        RuleForEach(x => x.LinkUrls)
            .Must(BeHttpUrl).WithMessage("Đường dẫn '{PropertyValue}' không hợp lệ (cần bắt đầu bằng http:// hoặc https://).")
            .MaximumLength(2000);

        RuleFor(x => x.AttachmentIds)
            .NotNull()
            .Must(ids => ids.Count <= MyTaskAttachmentRules.MaxFilesPerSubmission)
            .WithMessage($"Tối đa {MyTaskAttachmentRules.MaxFilesPerSubmission} tệp đính kèm.")
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("Tệp đính kèm bị trùng.");
    }

    private static bool BeHttpUrl(string url) =>
        !string.IsNullOrWhiteSpace(url)
        && !url.Contains(SubmissionLinks.Separator)
        && Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}
