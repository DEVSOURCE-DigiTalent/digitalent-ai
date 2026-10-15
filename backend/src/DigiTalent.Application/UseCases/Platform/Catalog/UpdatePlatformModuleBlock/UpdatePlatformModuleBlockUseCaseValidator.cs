using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformModuleBlockUseCaseValidator : AbstractValidator<UpdatePlatformModuleBlockUseCaseInput>
{
    public UpdatePlatformModuleBlockUseCaseValidator()
    {
        RuleFor(x => x.BodyHtml).MaximumLength(PlatformCourseRules.MaxHtmlLength).WithMessage("Nội dung chữ quá dài.");
        RuleFor(x => x.Caption).MaximumLength(500);
        RuleFor(x => x.AltText).MaximumLength(500);
        RuleFor(x => x.Items).Must(i => i == null || i.Count <= 30).WithMessage("Một slide có tối đa 30 ảnh và video.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.AssetId).NotEmpty();
            item.RuleFor(i => i.Caption).MaximumLength(500);
        });
    }
}
