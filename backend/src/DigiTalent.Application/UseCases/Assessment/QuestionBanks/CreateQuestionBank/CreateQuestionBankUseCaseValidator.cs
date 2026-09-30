using FluentValidation;

namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

public class CreateQuestionBankUseCaseValidator : AbstractValidator<CreateQuestionBankUseCaseInput>
{
    public CreateQuestionBankUseCaseValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Question bank title is required.")
            .MaximumLength(255).WithMessage("Question bank title cannot exceed 255 characters.");
    }
}
