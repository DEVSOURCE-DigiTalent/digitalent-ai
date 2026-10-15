using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseModuleQuizUseCaseValidator : AbstractValidator<SubmitPulseModuleQuizUseCaseInput>
{
    public SubmitPulseModuleQuizUseCaseValidator()
    {
        RuleFor(x => x.Answers).NotNull().NotEmpty().WithMessage("Hãy trả lời các câu hỏi trước khi kiểm tra.");
        RuleFor(x => x.Answers.Count).LessThanOrEqualTo(50).WithMessage("Quá nhiều câu trả lời.");
        RuleFor(x => x.Answers)
            .Must(answers => answers.Select(a => a.QuestionId).Distinct().Count() == answers.Count)
            .WithMessage("Mỗi câu hỏi chỉ được trả lời một lần.");
    }
}
