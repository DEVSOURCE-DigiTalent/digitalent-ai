using FluentValidation;

namespace DigiTalent.Application.UseCases.Me;

public class SubmitMyAttemptUseCaseValidator : AbstractValidator<SubmitMyAttemptUseCaseInput>
{
    public SubmitMyAttemptUseCaseValidator()
    {
        RuleFor(x => x.Answers).NotNull();
        RuleFor(x => x.Answers.Count).LessThanOrEqualTo(500).WithMessage("Quá nhiều câu trả lời.");
    }
}
