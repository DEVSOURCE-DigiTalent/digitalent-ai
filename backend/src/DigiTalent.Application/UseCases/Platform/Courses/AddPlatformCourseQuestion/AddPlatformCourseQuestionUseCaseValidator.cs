using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class AddPlatformCourseQuestionUseCaseValidator : AbstractValidator<AddPlatformCourseQuestionUseCaseInput>
{
    public AddPlatformCourseQuestionUseCaseValidator()
    {
        RuleFor(x => x.QuestionText)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 15)
            .WithMessage("Question must have at least 15 characters.")
            .MaximumLength(1000);
        RuleFor(x => x.CorrectAnswer).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Explanation)
            .Must(t => !string.IsNullOrWhiteSpace(t) && t.Trim().Length >= 15)
            .WithMessage("Explanation must have at least 15 characters.")
            .MaximumLength(1000);
    }
}
