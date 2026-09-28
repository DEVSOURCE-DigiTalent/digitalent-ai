using FluentValidation;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class CalculateSkillGapUseCaseValidator : AbstractValidator<CalculateSkillGapUseCaseInput>
{
    public CalculateSkillGapUseCaseValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.RequirementSetId).NotEqual(Guid.Empty).When(x => x.RequirementSetId.HasValue);
    }
}
