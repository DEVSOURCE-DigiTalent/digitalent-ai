namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

public class RenderSignLanguageVideoUseCaseInput
{
    public Guid TrackId { get; set; }
    /// <summary>Render again even when the output matches the current map ("Tạo lại video").</summary>
    public bool Force { get; set; }
}
