using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCourseFinalUseCaseValidator : AbstractValidator<UpdatePlatformCourseFinalUseCaseInput>
{
    public UpdatePlatformCourseFinalUseCaseValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Bài cuối khóa cần có tên.").MaximumLength(250);
        RuleFor(x => x.PromptHtml).MaximumLength(PlatformCourseRules.MaxHtmlLength);
        RuleFor(x => x.Criteria).Must(c => c.Count <= 10).WithMessage("Tối đa 10 tiêu chí.");
        RuleForEach(x => x.Criteria).MaximumLength(250);
    }
}
