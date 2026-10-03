using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency;

public class UpdateDraftPositionRequirementSetUseCaseValidator : AbstractValidator<UpdateDraftPositionRequirementSetUseCaseInput>
{
    public UpdateDraftPositionRequirementSetUseCaseValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("RequirementSetId is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one requirement item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.CompetencyId)
                .NotEmpty().WithMessage("CompetencyId is required.");

            item.RuleFor(i => i.RequiredLevel)
                .InclusiveBetween(1, 3).WithMessage("Required level must be between 1 and 3.");

            item.RuleFor(i => i.WeightPercent)
                .GreaterThan(0).WithMessage("Weight percent must be greater than 0.")
                .LessThanOrEqualTo(100).WithMessage("Weight percent must not exceed 100.");
        });
    }
}
