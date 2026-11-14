namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseRecordingContentUseCaseOutput
{
    public Stream Content { get; set; } = Stream.Null;
    public string ContentType { get; set; } = "video/webm";
    public string? RedirectUrl { get; set; }
}
