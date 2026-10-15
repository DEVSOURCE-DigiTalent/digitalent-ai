using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCatalogCourseUseCaseValidator : AbstractValidator<UpdatePlatformCatalogCourseUseCaseInput>
{
    public UpdatePlatformCatalogCourseUseCaseValidator()
    {
        RuleFor(x => x.Code)
            .Must(PlatformCourseRules.IsValidCode).When(x => !string.IsNullOrWhiteSpace(x.Code))
            .WithMessage("Mã khóa học gồm 2–30 chữ in hoa, chữ số hoặc dấu gạch ngang.");
        RuleFor(x => x.Title)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 3).WithMessage("Tên khóa học cần ít nhất 3 ký tự.")
            .MaximumLength(250);
        RuleFor(x => x.Outcome).MaximumLength(4000);
        RuleFor(x => x.DomainId).NotEmpty();
        RuleFor(x => x.Level).InclusiveBetween(PlatformCatalog.MinLevel, PlatformCatalog.MaxLevel);
        RuleFor(x => x.PricePerSeat).InclusiveBetween(0, 1_000_000_000).WithMessage("Giá mỗi suất không hợp lệ.");
        RuleFor(x => x.SalesStatus).Must(Statuses.PlatformCourseSales.IsValid).WithMessage("Trạng thái bán không hợp lệ.");
    }
}
