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
        Essay(x => x.EssayBasic, "EssayBasic", "Cơ bản");
        Essay(x => x.EssayIntermediate, "EssayIntermediate", "Trung cấp");
        Essay(x => x.EssayAdvanced, "EssayAdvanced", "Nâng cao");
    }

    private void Essay(Func<SubmitMyTrialAssessmentUseCaseInput, string> value, string name, string tier)
    {
        RuleFor(x => (value(x) ?? string.Empty).Trim().Length)
            .GreaterThanOrEqualTo(TrialProgramRules.MinEssayLength)
            .WithName(name)
            .WithMessage($"Bài tự luận {tier} cần ít nhất {TrialProgramRules.MinEssayLength} ký tự.")
            .LessThanOrEqualTo(TrialProgramRules.MaxEssayLength)
            .WithMessage($"Bài tự luận {tier} tối đa {TrialProgramRules.MaxEssayLength} ký tự.");
    }
}
