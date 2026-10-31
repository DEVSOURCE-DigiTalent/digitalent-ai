using DigiTalent.Application.UseCases.Pulse;
using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class ReviewTrialAssessmentUseCaseValidator : AbstractValidator<ReviewTrialAssessmentUseCaseInput>
{
    public ReviewTrialAssessmentUseCaseValidator()
    {
        RuleFor(x => x.Levels).NotEmpty().WithMessage("Chọn mức cho từng lĩnh vực.");
        RuleForEach(x => x.Levels)
            .Must(l => l.Level is >= 0 and <= PulseRules.MaxLevel)
            .WithMessage("Mức phải từ 0 đến 3.");
        RuleFor(x => x.EssayScores)
            .Must(s => s.Count == TrialProgramRules.Essays.Count)
            .WithMessage("Cho điểm cả ba bài tự luận.");
        RuleForEach(x => x.EssayScores)
            .InclusiveBetween(0, TrialProgramRules.EssayMaxScore)
            .WithMessage("Điểm tự luận phải từ 0 đến 10.");
        RuleFor(x => x.Note).MaximumLength(TrialProgramRules.MaxReviewNoteLength);
    }
}
