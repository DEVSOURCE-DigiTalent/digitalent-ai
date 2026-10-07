using FluentValidation;

namespace DigiTalent.Application.UseCases.Me;

public class GetMyAttemptHistoryUseCaseValidator : AbstractValidator<GetMyAttemptHistoryUseCaseInput>
{
    public GetMyAttemptHistoryUseCaseValidator()
    {
        RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Search).MaximumLength(200);
    }
}
