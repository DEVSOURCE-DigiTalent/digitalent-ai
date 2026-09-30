using FluentValidation;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class CreateQuestionUseCaseValidator : AbstractValidator<CreateQuestionUseCaseInput>
{
    public CreateQuestionUseCaseValidator()
    {
        RuleFor(x => x.BankId).NotEmpty().WithMessage("BankId is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Question content is required.");

        RuleFor(x => x.Options)
            .Must((input, options) => input.QuestionType == "ESSAY" || options.Count > 0)
            .WithMessage("Non-essay questions must have at least one option.");

        RuleFor(x => x.Options)
            .Must((input, options) => input.QuestionType == "ESSAY" || options.Any(o => o.IsCorrect))
            .WithMessage("At least one option must be marked as correct.");
    }
}
