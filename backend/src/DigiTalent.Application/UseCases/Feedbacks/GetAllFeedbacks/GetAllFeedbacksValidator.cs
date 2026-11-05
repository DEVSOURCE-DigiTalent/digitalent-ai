using FluentValidation;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetAllFeedbacksValidator : AbstractValidator<GetAllFeedbacksInput>
{
    public GetAllFeedbacksValidator()
    {
        RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
