using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class SavePlatformCourseDraftUseCaseValidator : AbstractValidator<SavePlatformCourseDraftUseCaseInput>
{
    public SavePlatformCourseDraftUseCaseValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Outcome)
            .Must(o => !string.IsNullOrWhiteSpace(o) && o.Trim().Length >= 20)
            .WithMessage("Outcome must have at least 20 characters.")
            .MaximumLength(4000);
        RuleFor(x => x.PricePerSeat).GreaterThanOrEqualTo(0).LessThanOrEqualTo(1_000_000_000);
        RuleFor(x => x.SalesStatus).Must(Statuses.PlatformCourseSales.IsValid).WithMessage("Sales status must be OPEN or PAUSED.");
    }
}
