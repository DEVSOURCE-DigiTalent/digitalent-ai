using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class SaveSignLanguageSegmentsUseCaseValidator : AbstractValidator<SaveSignLanguageSegmentsUseCaseInput>
{
    public SaveSignLanguageSegmentsUseCaseValidator()
    {
        RuleFor(x => x.Segments).NotNull().Must(s => s.Count <= PlatformCatalog.Captions.MaxCues)
            .WithMessage($"Tối đa {PlatformCatalog.Captions.MaxCues} câu mỗi lần lưu.");
        RuleForEach(x => x.Segments).ChildRules(segment =>
        {
            segment.RuleFor(s => s.Index).GreaterThanOrEqualTo(0);
            segment.RuleFor(s => s.ReviewStatus).Must(s => s == null || SignVideo.Review.IsValid(s))
                .WithMessage("Trạng thái duyệt phải là PENDING, APPROVED hoặc SKIPPED.");
            segment.RuleFor(s => s.ReviewNote).MaximumLength(SignVideo.MaxNoteLength);
            segment.RuleFor(s => s.Items).Must(items => items == null || items.Count <= SignVideo.MaxItemsPerSegment)
                .WithMessage($"Một câu có tối đa {SignVideo.MaxItemsPerSegment} ký hiệu.");
        });
    }
}
