using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class AddPlatformCourseModuleUseCaseValidator : AbstractValidator<AddPlatformCourseModuleUseCaseInput>
{
    public AddPlatformCourseModuleUseCaseValidator()
    {
        RuleFor(x => x.Title)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 2).WithMessage("Tên mô đun cần ít nhất 2 ký tự.")
            .MaximumLength(220);
    }
}
