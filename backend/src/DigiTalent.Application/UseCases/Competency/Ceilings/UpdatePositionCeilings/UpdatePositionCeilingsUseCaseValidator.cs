using DigiTalent.Domain.Entities;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Mỗi lĩnh vực một dòng, mức 1..3 (Cơ bản..Nâng cao).</summary>
public class UpdatePositionCeilingsUseCaseValidator : AbstractValidator<UpdatePositionCeilingsUseCaseInput>
{
    public UpdatePositionCeilingsUseCaseValidator()
    {
        RuleFor(x => x.Code).NotEmpty();
        RuleFor(x => x.Ceilings).NotEmpty().When(x => !x.Inherit);
        RuleFor(x => x.Ceilings)
            .Must(items => items.Select(i => i.CategoryId).Distinct().Count() == items.Count)
            .WithMessage("Each competency domain may appear only once.");
        RuleForEach(x => x.Ceilings).ChildRules(item =>
        {
            item.RuleFor(i => i.CategoryId).NotEmpty();
            item.RuleFor(i => i.Level).InclusiveBetween(1, CapabilityCeiling.MaxLevel);
        });
    }
}
