using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class GetSkillGapRunsUseCaseValidator : AbstractValidator<GetSkillGapRunsUseCaseInput>
{
    public GetSkillGapRunsUseCaseValidator()
    {
        Include(new PaginationRequestValidator()); // dùng lại rule PageIndex/PageSize
        RuleFor(x => x.Search).MaximumLength(200);
    }
}
