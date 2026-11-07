using FluentValidation;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class CreateFeedbackValidator : AbstractValidator<CreateFeedbackInput>
{
    private const int MaxScreenshots = 3;
    private const int MaxScreenshotChars = 3_000_000;
    private static readonly string[] ValidTypes = { "BUG", "FEEDBACK", "SUGGESTION" };
    private static readonly string[] ScreenshotPrefixes = { "data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64," };

    public CreateFeedbackValidator()
    {
        RuleFor(x => x.Type)
            .Must(t => ValidTypes.Contains(t))
            .WithMessage("Type must be BUG, FEEDBACK, or SUGGESTION.");

        RuleFor(x => x.Title)
            .Must(t => t != null && t.Trim().Length is >= 5 and <= 200)
            .WithMessage("Tiêu đề cần từ 5 đến 200 ký tự.");

        RuleFor(x => x.Description)
            .Must(d => d != null && d.Trim().Length is >= 10 and <= 5000)
            .WithMessage("Mô tả cần từ 10 đến 5000 ký tự.");

        RuleFor(x => x.PageUrl)
            .MaximumLength(500);

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5)
            .When(x => x.Rating.HasValue);

        // Screenshots are rendered by the platform admin, so only inline images are accepted (no external or script URLs).
        RuleFor(x => x.Screenshots)
            .Must(s => s!.Count <= MaxScreenshots)
            .WithMessage($"Tối đa {MaxScreenshots} ảnh.")
            .Must(s => s!.All(IsInlineImage))
            .WithMessage("Ảnh đính kèm không hợp lệ hoặc quá lớn.")
            .When(x => x.Screenshots != null);
    }

    private static bool IsInlineImage(string value) =>
        value != null
        && value.Length <= MaxScreenshotChars
        && ScreenshotPrefixes.Any(prefix => value.StartsWith(prefix, StringComparison.Ordinal));
}
