using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitMyTrialAssessmentUseCaseValidator : AbstractValidator<SubmitMyTrialAssessmentUseCaseInput>
{
    public SubmitMyTrialAssessmentUseCaseValidator()
    {
        RuleFor(x => x.ProctoringSessionId)
            .NotEmpty()
            .WithMessage("Bài làm cần phiên có giám sát (chia sẻ toàn bộ màn hình, camera và micro).");
        RuleFor(x => x.Answers)
            .NotNull()
            .Must(answers => answers == null || answers.Count <= 100)
            .WithMessage("Phần trắc nghiệm có tối đa 100 câu.");
    }
}
