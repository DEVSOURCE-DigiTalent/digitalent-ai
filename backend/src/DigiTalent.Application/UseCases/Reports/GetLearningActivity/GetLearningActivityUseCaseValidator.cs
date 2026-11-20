using FluentValidation;

namespace DigiTalent.Application.UseCases.Reports.GetLearningActivity;

public sealed class GetLearningActivityValidator : AbstractValidator<GetLearningActivityInput>
{
    public GetLearningActivityValidator()
    {
        RuleFor(x => x.Weeks).InclusiveBetween(1, 26);
    }
}
