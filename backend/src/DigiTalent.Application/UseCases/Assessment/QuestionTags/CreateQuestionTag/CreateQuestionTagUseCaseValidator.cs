using FluentValidation;

namespace DigiTalent.Application.UseCases.Assessment.QuestionTags;

public class CreateQuestionTagUseCaseValidator : AbstractValidator<CreateQuestionTagUseCaseInput>
{
    public CreateQuestionTagUseCaseValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tag name is required.")
            .MaximumLength(100).WithMessage("Tag name cannot exceed 100 characters.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Tag category is required.");
    }
}
