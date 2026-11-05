using FluentValidation;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class UpdateFeedbackStatusValidator : AbstractValidator<UpdateFeedbackStatusInput>
{
    public UpdateFeedbackStatusValidator()
    {
        RuleFor(x => x.AdminNote).MaximumLength(2000);
    }
}
