using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class UploadSignAvatarTrackUseCaseValidator : AbstractValidator<UploadSignAvatarTrackUseCaseInput>
{
    public UploadSignAvatarTrackUseCaseValidator()
    {
        RuleFor(x => x.SizeBytes).GreaterThan(0).WithMessage("Chưa có tệp track nhân vật.")
            .LessThanOrEqualTo(SignVideo.AvatarTrack.MaxBytes).WithMessage("Track nhân vật vượt quá 500 MB.");
        RuleFor(x => x.Fingerprint).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Format).Must(SignVideo.AvatarTrack.IsValidFormat).WithMessage("Định dạng track nhân vật phải là H264 hoặc IVF.");
        RuleFor(x => x.FrameRate).NotEmpty().MaximumLength(20);
        RuleFor(x => x.FrameCount).GreaterThan(0);
        RuleFor(x => x.Placements).Must(p => p.Count <= 20_000).WithMessage("Quá nhiều ký hiệu.");
        RuleForEach(x => x.Placements).ChildRules(p =>
        {
            p.RuleFor(x => x.SegmentIndex).GreaterThanOrEqualTo(0);
            p.RuleFor(x => x.ItemIndex).GreaterThanOrEqualTo(0);
            p.RuleFor(x => x.StartMs).GreaterThanOrEqualTo(0);
            p.RuleFor(x => x.EndMs).GreaterThan(x => x.StartMs).WithMessage("Mỗi ký hiệu phải kết thúc sau khi bắt đầu.");
            p.RuleFor(x => x.Speed).InclusiveBetween(0.25, 4);
            p.RuleFor(x => x.SourceMs).GreaterThanOrEqualTo(0);
        });
    }
}
