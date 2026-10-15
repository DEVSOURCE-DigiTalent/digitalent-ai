using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCatalogPricesUseCaseValidator : AbstractValidator<UpdatePlatformCatalogPricesUseCaseInput>
{
    public UpdatePlatformCatalogPricesUseCaseValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Chọn ít nhất một khóa để đổi giá.")
            .Must(i => i.Count <= 200).WithMessage("Tối đa 200 khóa mỗi lần.")
            .Must(i => i.Select(x => x.CourseId).Distinct().Count() == i.Count).WithMessage("Mỗi khóa chỉ xuất hiện một lần.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.CourseId).NotEmpty();
            item.RuleFor(i => i.PricePerSeat).InclusiveBetween(0, 1_000_000_000).WithMessage("Giá mỗi suất không hợp lệ.");
            item.RuleFor(i => i.SalesStatus).Must(Statuses.PlatformCourseSales.IsValid).WithMessage("Trạng thái bán không hợp lệ.");
        });
    }
}
