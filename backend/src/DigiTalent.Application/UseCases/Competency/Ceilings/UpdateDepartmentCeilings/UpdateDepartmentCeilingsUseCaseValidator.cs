using DigiTalent.Domain.Entities;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Mỗi lĩnh vực một dòng, cấp trong 0..3; trần doanh nghiệp được kiểm tra trong use case.</summary>
public class UpdateDepartmentCeilingsUseCaseValidator : AbstractValidator<UpdateDepartmentCeilingsUseCaseInput>
{
    public UpdateDepartmentCeilingsUseCaseValidator()
    {
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Ceilings).NotEmpty().When(x => !x.Inherit);
        RuleFor(x => x.Ceilings)
            .Must(items => items.Select(i => i.CategoryId).Distinct().Count() == items.Count)
            .WithMessage("Each competency domain may appear only once.");
        RuleForEach(x => x.Ceilings).ChildRules(item =>
        {
            item.RuleFor(i => i.CategoryId).NotEmpty();
            item.RuleFor(i => i.Level).InclusiveBetween(0, CapabilityCeiling.MaxLevel);
        });
    }
}
