using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class EndPulseRecordingUseCaseValidator : AbstractValidator<EndPulseRecordingUseCaseInput>
{
    public EndPulseRecordingUseCaseValidator()
    {
        RuleFor(x => x.EndOffsetMs)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Vị trí kết thúc của đoạn ghi không hợp lệ.");
    }
}
