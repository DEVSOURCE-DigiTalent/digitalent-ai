using DigiTalent.Domain.Constants;
using FluentValidation;
using SignLang = DigiTalent.Domain.Constants.SignLanguage;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class AnalyzeSignLanguageVideoUseCaseValidator : AbstractValidator<AnalyzeSignLanguageVideoUseCaseInput>
{
    public AnalyzeSignLanguageVideoUseCaseValidator()
    {
        RuleFor(x => x.CaptionSource).Must(SignVideo.CaptionSource.IsValid).WithMessage("Nguồn lời thoại phải là PUBLISHED hoặc DRAFT.");
        RuleFor(x => x.RenderMode).Must(SignVideo.RenderMode.IsValid).WithMessage("Kiểu hiển thị phải là OVERLAY, FULLSCREEN hoặc TRACK_ONLY.");
        RuleFor(x => x.Renderer).Must(SignVideo.Renderer.IsValid).WithMessage("Bộ dựng phải là CLIP hoặc AVATAR.");
        RuleFor(x => x.SignLanguage).Must(SignLang.Code.IsValid).WithMessage("Mã ngôn ngữ ký hiệu không hợp lệ.");
        RuleFor(x => x.Region).Must(SignLang.Region.IsValid).WithMessage("Mã vùng không hợp lệ (ví dụ VN, VN-BAC).");
        RuleFor(x => x.Variant).MaximumLength(SignLang.MaxVariantLength);
    }
}
