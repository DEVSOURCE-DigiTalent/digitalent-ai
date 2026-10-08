using FluentValidation;

namespace DigiTalent.Application.UseCases.Me;

public class SaveMyAttemptAnswersUseCaseValidator : AbstractValidator<SaveMyAttemptAnswersUseCaseInput>
{
    public SaveMyAttemptAnswersUseCaseValidator()
    {
        RuleFor(x => x.Answers).NotNull();
        RuleFor(x => x.Answers.Count).LessThanOrEqualTo(500).WithMessage("Quá nhiều câu trả lời trong một lần lưu.");
    }
}
