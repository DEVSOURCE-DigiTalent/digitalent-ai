using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulsePreAssessmentUseCaseValidator : AbstractValidator<SubmitPulsePreAssessmentUseCaseInput>
{
    public SubmitPulsePreAssessmentUseCaseValidator()
    {
        RuleFor(x => (x.EvidenceText ?? string.Empty).Trim().Length)
            .GreaterThanOrEqualTo(PulseRules.MinEvidenceLength)
            .WithName("EvidenceText")
            .WithMessage($"Ghi chú minh chứng cần ít nhất {PulseRules.MinEvidenceLength} ký tự.")
            .LessThanOrEqualTo(PulseRules.MaxEvidenceLength)
            .WithMessage($"Ghi chú minh chứng tối đa {PulseRules.MaxEvidenceLength} ký tự.");
        RuleFor(x => x.ProctoringSessionId)
            .NotEmpty()
            .WithMessage("Bài làm cần phiên có giám sát (chia sẻ toàn bộ màn hình, camera và micro).");
    }
}
