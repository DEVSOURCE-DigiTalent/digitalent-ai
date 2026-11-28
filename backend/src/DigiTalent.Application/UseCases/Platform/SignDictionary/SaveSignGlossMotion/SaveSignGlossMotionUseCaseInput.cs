namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class SaveSignGlossMotionUseCaseInput
{
    public Guid Id { get; set; }
    public short Layout { get; set; }
    public short Fps { get; set; }
    public int Frames { get; set; }
    /// <summary>Part of the video the motion was taken from.</summary>
    public int? StartMs { get; set; }
    public int? EndMs { get; set; }
    /// <summary>Landmarks per frame, int16 little-endian (base64 in JSON).</summary>
    public byte[]? Data { get; set; }
}
