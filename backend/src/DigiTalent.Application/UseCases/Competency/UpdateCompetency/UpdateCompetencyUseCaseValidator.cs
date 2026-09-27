using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency;

public class UpdateCompetencyUseCaseValidator : AbstractValidator<UpdateCompetencyUseCaseInput>
{
    private static readonly string[] ValidCompetencyTypes =
    {
        Statuses.CompetencyType.CoreDigital,
        Statuses.CompetencyType.Professional,
        Statuses.CompetencyType.Internal,
        Statuses.CompetencyType.Behavioural
    };

    public UpdateCompetencyUseCaseValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Competency ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.CompetencyType)
            .Must(t => string.IsNullOrWhiteSpace(t) || ValidCompetencyTypes.Contains(t.Trim().ToUpperInvariant()))
            .WithMessage($"CompetencyType must be one of: {string.Join(", ", ValidCompetencyTypes)}.");

        RuleForEach(x => x.Criteria).ChildRules(c =>
        {
            c.RuleFor(cr => cr.Level)
                .InclusiveBetween(1, 3).WithMessage("Level must be between 1 and 3.");

            c.RuleFor(cr => cr.IndicatorCode)
                .NotEmpty().WithMessage("Indicator code is required.")
                .MaximumLength(60).WithMessage("Indicator code cannot exceed 60 characters.");

            c.RuleFor(cr => cr.BehaviorIndicator)
                .NotEmpty().WithMessage("Behavior indicator is required.");
        });
    }
}
