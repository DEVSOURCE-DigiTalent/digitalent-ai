using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class AppendPulseRecordingChunkUseCaseValidator : AbstractValidator<AppendPulseRecordingChunkUseCaseInput>
{
    public AppendPulseRecordingChunkUseCaseValidator()
    {
        RuleFor(x => x.Seq)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Thứ tự mẩu ghi hình không hợp lệ.");
    }
}
