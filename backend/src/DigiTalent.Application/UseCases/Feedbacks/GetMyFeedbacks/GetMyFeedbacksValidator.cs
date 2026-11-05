using FluentValidation;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetMyFeedbacksValidator : AbstractValidator<GetMyFeedbacksInput>
{
    public GetMyFeedbacksValidator()
    {
        RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
