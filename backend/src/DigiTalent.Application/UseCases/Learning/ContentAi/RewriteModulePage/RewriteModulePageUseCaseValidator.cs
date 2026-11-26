using FluentValidation;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

public class RewriteModulePageUseCaseValidator : ModuleContentAiInputValidator<RewriteModulePageUseCaseInput>
{
    public RewriteModulePageUseCaseValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1).WithMessage("Chọn trang cần viết lại.");
        RuleFor(x => x.Notes).Must(n => n.Count <= 10).WithMessage("Tối đa 10 ghi chú.");
    }
}
