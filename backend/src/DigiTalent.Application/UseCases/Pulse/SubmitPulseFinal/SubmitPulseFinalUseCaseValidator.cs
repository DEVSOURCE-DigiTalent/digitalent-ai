using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseFinalUseCaseValidator : AbstractValidator<SubmitPulseFinalUseCaseInput>
{
    public SubmitPulseFinalUseCaseValidator()
    {
        RuleFor(x => (x.EvidenceText ?? string.Empty).Trim().Length)
            .GreaterThanOrEqualTo(PulseRules.MinEvidenceLength)
            .WithName("EvidenceText")
            .WithMessage($"Ghi chú minh chứng cần ít nhất {PulseRules.MinEvidenceLength} ký tự.")
            .LessThanOrEqualTo(PulseRules.MaxEvidenceLength)
            .WithMessage($"Ghi chú minh chứng tối đa {PulseRules.MaxEvidenceLength} ký tự.");
    }
}
