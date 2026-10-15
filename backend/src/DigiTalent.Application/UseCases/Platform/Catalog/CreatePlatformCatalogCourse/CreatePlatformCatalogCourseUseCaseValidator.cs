using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class CreatePlatformCatalogCourseUseCaseValidator : AbstractValidator<CreatePlatformCatalogCourseUseCaseInput>
{
    public CreatePlatformCatalogCourseUseCaseValidator()
    {
        RuleFor(x => x.Code)
            .Must(PlatformCourseRules.IsValidCode)
            .WithMessage("Mã khóa học gồm 2–30 chữ in hoa, chữ số hoặc dấu gạch ngang.");
        RuleFor(x => x.Title)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 3).WithMessage("Tên khóa học cần ít nhất 3 ký tự.")
            .MaximumLength(250);
        RuleFor(x => x.DomainId).NotEmpty().WithMessage("Chọn lĩnh vực của khóa học.");
        RuleFor(x => x.Level).InclusiveBetween(PlatformCatalog.MinLevel, PlatformCatalog.MaxLevel);
    }
}
