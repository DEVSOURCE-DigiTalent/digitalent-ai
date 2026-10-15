using DigiTalent.Application.UseCases.Platform.Common;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class GrantPlatformCourseSeatsUseCaseValidator : AbstractValidator<GrantPlatformCourseSeatsUseCaseInput>
{
    public GrantPlatformCourseSeatsUseCaseValidator()
    {
        RuleFor(x => x.CourseCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Seats).InclusiveBetween(1, 100);
        RuleFor(x => x.Reason).ValidReason();
    }
}
