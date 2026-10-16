using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseRecordingUseCaseValidator : AbstractValidator<StartPulseRecordingUseCaseInput>
{
    public StartPulseRecordingUseCaseValidator()
    {
        RuleFor(x => x.Track)
            .Must(track => Statuses.ProctoringTrack.All.Contains(track))
            .WithMessage("Nguồn ghi phải là SCREEN hoặc CAMERA.");
        RuleFor(x => x.StartOffsetMs)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Vị trí bắt đầu của đoạn ghi không hợp lệ.");
        RuleFor(x => (x.ContentType ?? string.Empty).Trim())
            .Must(type => type.Length is > 0 and <= 100 && (type.StartsWith("video/", StringComparison.OrdinalIgnoreCase) || type.StartsWith("audio/", StringComparison.OrdinalIgnoreCase)))
            .WithName("ContentType")
            .WithMessage("Định dạng ghi hình không hợp lệ.");
        RuleFor(x => x.DisplaySurface)
            .MaximumLength(20)
            .WithMessage("Giá trị displaySurface không hợp lệ.");
    }
}
