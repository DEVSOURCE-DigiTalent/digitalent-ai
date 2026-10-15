using DigiTalent.Domain.Entities;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Mỗi lĩnh vực một dòng, cấp trong 0..3 (ck_capability_ceilings_level).</summary>
public class UpdateOrganizationCeilingsUseCaseValidator : AbstractValidator<UpdateOrganizationCeilingsUseCaseInput>
{
    public UpdateOrganizationCeilingsUseCaseValidator()
    {
        RuleFor(x => x.Ceilings).NotEmpty()
            .Must(items => items.Select(i => i.CategoryId).Distinct().Count() == items.Count)
            .WithMessage("Each competency domain may appear only once.");
        RuleForEach(x => x.Ceilings).ChildRules(item =>
        {
            item.RuleFor(i => i.CategoryId).NotEmpty();
            item.RuleFor(i => i.Level).InclusiveBetween(0, CapabilityCeiling.MaxLevel);
        });
    }
}
