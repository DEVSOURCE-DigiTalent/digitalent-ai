using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseProctoringEventsUseCaseValidator : AbstractValidator<RecordPulseProctoringEventsUseCaseInput>
{
    /// <summary>STARTED và SUBMITTED do máy chủ ghi khi bắt đầu phiên và khi nộp bài.</summary>
    private static readonly string[] ClientKinds = Statuses.ProctoringEvent.All
        .Where(kind => kind is not Statuses.ProctoringEvent.Started and not Statuses.ProctoringEvent.Submitted)
        .ToArray();

    public RecordPulseProctoringEventsUseCaseValidator()
    {
        RuleFor(x => x.Events)
            .NotEmpty()
            .WithMessage("Cần ít nhất một sự kiện.")
            .Must(events => events.Count <= PulseRules.MaxEventsPerRequest)
            .WithMessage($"Tối đa {PulseRules.MaxEventsPerRequest} sự kiện mỗi lần gửi.");
        RuleForEach(x => x.Events).ChildRules(item =>
        {
            item.RuleFor(e => e.Kind)
                .Must(kind => ClientKinds.Contains(kind))
                .WithMessage("Loại sự kiện giám sát không hợp lệ.");
            item.RuleFor(e => e.OffsetMs)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Thời điểm của sự kiện không hợp lệ.");
            item.RuleFor(e => e.DurationMs)
                .GreaterThanOrEqualTo(0)
                .When(e => e.DurationMs.HasValue)
                .WithMessage("Thời lượng của sự kiện không hợp lệ.");
            item.RuleFor(e => e.Detail)
                .MaximumLength(300)
                .WithMessage("Ghi chú của sự kiện tối đa 300 ký tự.");
        });
    }
}
