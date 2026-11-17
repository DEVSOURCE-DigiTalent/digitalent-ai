using DigiTalent.Domain.Entities;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Mỗi lĩnh vực tối đa một dòng, mốc trong 0..3 (ck_competency_milestones_level).</summary>
public class UpdateCompetencyMilestonesUseCaseValidator : AbstractValidator<UpdateCompetencyMilestonesUseCaseInput>
{
    public UpdateCompetencyMilestonesUseCaseValidator()
    {
        RuleFor(x => x.Milestones).NotEmpty()
            .Must(items => items.Select(i => i.CategoryId).Distinct().Count() == items.Count)
            .WithMessage("Each competency domain may appear only once.");
        RuleForEach(x => x.Milestones).ChildRules(item =>
        {
            item.RuleFor(i => i.CategoryId).NotEmpty();
            item.RuleFor(i => i.Level).InclusiveBetween(0, CapabilityCeiling.MaxLevel);
        });
    }
}
