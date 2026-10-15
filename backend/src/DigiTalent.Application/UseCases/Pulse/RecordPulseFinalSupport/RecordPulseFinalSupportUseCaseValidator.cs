using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseFinalSupportUseCaseValidator : AbstractValidator<RecordPulseFinalSupportUseCaseInput>
{
    public RecordPulseFinalSupportUseCaseValidator()
    {
        RuleFor(x => x.Action)
            .Must(a => a is Statuses.FinalSupportAction.Coaching or Statuses.FinalSupportAction.FreshCycle or Statuses.FinalSupportAction.Pause)
            .WithMessage("Hướng hỗ trợ phải là COACHING, FRESH_CYCLE hoặc PAUSE.");
        RuleFor(x => x.Note).MaximumLength(2000);
    }
}
