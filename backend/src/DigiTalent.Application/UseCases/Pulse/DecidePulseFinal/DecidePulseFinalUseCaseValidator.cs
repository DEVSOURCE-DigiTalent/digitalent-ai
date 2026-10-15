using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class DecidePulseFinalUseCaseValidator : AbstractValidator<DecidePulseFinalUseCaseInput>
{
    public DecidePulseFinalUseCaseValidator()
    {
        RuleFor(x => x.Decision)
            .Must(d => d is Statuses.FinalSubmissionDecision.Passed or Statuses.FinalSubmissionDecision.NotYet)
            .WithMessage("Quyết định phải là PASSED hoặc NOT_YET.");
        RuleFor(x => (x.Reason ?? string.Empty).Trim().Length)
            .GreaterThanOrEqualTo(PulseRules.MinDecisionReasonLength)
            .WithName("Reason")
            .WithMessage($"Hãy ghi lý do cụ thể (ít nhất {PulseRules.MinDecisionReasonLength} ký tự).")
            .LessThanOrEqualTo(4000)
            .WithMessage("Lý do tối đa 4000 ký tự.");
    }
}
