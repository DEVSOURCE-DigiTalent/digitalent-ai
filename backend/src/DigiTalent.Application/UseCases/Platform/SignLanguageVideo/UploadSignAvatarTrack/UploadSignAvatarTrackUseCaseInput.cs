namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>The avatar track rendered by the admin's browser (multipart upload) and how it was made.</summary>
public class UploadSignAvatarTrackUseCaseInput
{
    public Guid TrackId { get; set; }
    public Stream Content { get; set; } = Stream.Null;
    public long SizeBytes { get; set; }
    /// <summary>The fingerprint given by GET avatar-job: the map the track was rendered from.</summary>
    public string Fingerprint { get; set; } = string.Empty;
    /// <summary>H264 (Annex B) / IVF (VP8, VP9).</summary>
    public string Format { get; set; } = string.Empty;
    /// <summary>The frame rate given by GET avatar-job ("30000/1001").</summary>
    public string FrameRate { get; set; } = string.Empty;
    public int FrameCount { get; set; }
    /// <summary>Rendered without background (colour | alpha frames), as GET avatar-job asked for OVERLAY.</summary>
    public bool Transparent { get; set; }
    /// <summary>Where each sign landed (shown in the sign map).</summary>
    public List<SignAvatarPlacementInput> Placements { get; set; } = new();
}

public class SignAvatarPlacementInput
{
    public int SegmentIndex { get; set; }
    public int ItemIndex { get; set; }
    public int StartMs { get; set; }
    public int EndMs { get; set; }
    /// <summary>How much faster than the motion the sign was played (1 = natural).</summary>
    public double Speed { get; set; } = 1;
    /// <summary>Length of the signing part of the motion that was played.</summary>
    public int SourceMs { get; set; }
}
