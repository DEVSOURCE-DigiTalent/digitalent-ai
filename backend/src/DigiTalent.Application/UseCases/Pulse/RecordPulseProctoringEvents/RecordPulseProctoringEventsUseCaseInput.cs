namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseProctoringEventsUseCaseInput
{
    public Guid SessionId { get; set; }
    public List<PulseProctoringEventInput> Events { get; set; } = new();
}

public class PulseProctoringEventInput
{
    /// <summary>
    /// TAB_HIDDEN | FOCUS_LOST | SHARE_STOPPED | SHARE_RESUMED | CAMERA_STOPPED | CAMERA_RESUMED | MIC_STOPPED | MIC_RESUMED
    /// | FACE_MISSING | MULTIPLE_FACES | LOOKING_AWAY | FACE_CHECK_ON | FACE_CHECK_OFF.
    /// </summary>
    public string Kind { get; set; } = string.Empty;

    /// <summary>ms từ lúc bắt đầu phiên.</summary>
    public long OffsetMs { get; set; }

    /// <summary>Thời lượng (ví dụ rời tab bao lâu), ms.</summary>
    public long? DurationMs { get; set; }

    public string? Detail { get; set; }
}
