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
        RuleFor(x => x.CriterionEvaluations)
            .Must(items => items == null || items.Count <= 20)
            .WithMessage("Tối đa 20 tiêu chí đánh giá.");
        RuleForEach(x => x.CriterionEvaluations)
            .ChildRules(item =>
            {
                item.RuleFor(c => c.Title).NotEmpty().MaximumLength(200);
                item.RuleFor(c => c.Status)
                    .Must(s => s is "PASS" or "PARTIAL" or "FAIL")
                    .WithMessage("Trạng thái tiêu chí phải là PASS, PARTIAL hoặc FAIL.");
                item.RuleFor(c => c.Note).MaximumLength(500);
                item.RuleFor(c => c.WeightPercent)
                    .InclusiveBetween(0, 100)
                    .When(c => c.WeightPercent.HasValue)
                    .WithMessage("Trọng số tiêu chí phải từ 0 đến 100%.");
            })
            .When(x => x.CriterionEvaluations != null);
    }
}
