using FluentValidation;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetMyFeedbacksValidator : AbstractValidator<GetMyFeedbacksInput>
{
    private static readonly string[] ValidTypes = { "BUG", "FEEDBACK", "SUGGESTION" };
    private static readonly string[] ValidStatuses = { "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED" };

    public GetMyFeedbacksValidator()
    {
        RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Type).Must(type => string.IsNullOrEmpty(type) || ValidTypes.Contains(type))
            .WithMessage("Type must be BUG, FEEDBACK, or SUGGESTION.");
        RuleFor(x => x.Status).Must(status => string.IsNullOrEmpty(status) || ValidStatuses.Contains(status))
            .WithMessage("Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED.");
    }
}
