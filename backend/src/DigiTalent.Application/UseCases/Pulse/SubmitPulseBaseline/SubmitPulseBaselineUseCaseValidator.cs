using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseBaselineUseCaseValidator : AbstractValidator<SubmitPulseBaselineUseCaseInput>
{
    public SubmitPulseBaselineUseCaseValidator()
    {
        RuleFor(x => x.Answers).NotNull().NotEmpty().WithMessage("Hãy trả lời các câu hỏi trước khi nộp bài.");
        RuleFor(x => x.Answers.Count).LessThanOrEqualTo(100).WithMessage("Quá nhiều câu trả lời.");
        RuleFor(x => x.Answers)
            .Must(answers => answers.Select(a => a.QuestionId).Distinct().Count() == answers.Count)
            .WithMessage("Mỗi câu hỏi chỉ được trả lời một lần.");
    }
}
