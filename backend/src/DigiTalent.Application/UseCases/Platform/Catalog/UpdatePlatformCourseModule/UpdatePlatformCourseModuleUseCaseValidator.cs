using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCourseModuleUseCaseValidator : AbstractValidator<UpdatePlatformCourseModuleUseCaseInput>
{
    public UpdatePlatformCourseModuleUseCaseValidator()
    {
        RuleFor(x => x.Title)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 2).WithMessage("Tên mô đun cần ít nhất 2 ký tự.")
            .MaximumLength(250);
        RuleFor(x => x.QuizTitle).MaximumLength(250);
    }
}
