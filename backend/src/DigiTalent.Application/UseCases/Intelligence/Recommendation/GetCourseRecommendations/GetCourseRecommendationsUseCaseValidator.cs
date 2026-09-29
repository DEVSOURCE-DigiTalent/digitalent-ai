using FluentValidation;

namespace DigiTalent.Application.UseCases.Intelligence.Recommendation;

public class GetCourseRecommendationsUseCaseValidator : AbstractValidator<GetCourseRecommendationsUseCaseInput>
{
    public const int MaxLimit = 20;

    public GetCourseRecommendationsUseCaseValidator()
    {
        RuleFor(x => x.Limit).InclusiveBetween(1, MaxLimit);
        RuleFor(x => x.EmployeeId).NotEqual(Guid.Empty).When(x => x.EmployeeId.HasValue);
    }
}
