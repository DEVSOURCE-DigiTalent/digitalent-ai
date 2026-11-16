using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseSkipTestUseCaseValidator : AbstractValidator<SubmitPulseSkipTestUseCaseInput>
{
    public SubmitPulseSkipTestUseCaseValidator()
    {
        RuleFor(x => x.AttemptNo).GreaterThan(0).WithMessage("Thiếu lần làm của đề.");
        RuleFor(x => x.Answers).NotNull();
        RuleFor(x => x.Answers.Count).LessThanOrEqualTo(50).WithMessage("Quá nhiều câu trả lời.");
        RuleFor(x => x.Answers)
            .Must(answers => answers.Select(a => a.QuestionId).Distinct().Count() == answers.Count)
            .WithMessage("Mỗi câu hỏi chỉ được trả lời một lần.");
    }
}
