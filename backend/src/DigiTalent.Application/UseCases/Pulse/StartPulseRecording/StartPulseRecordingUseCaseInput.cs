namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseRecordingUseCaseInput
{
    public Guid SessionId { get; set; }

    /// <summary>SCREEN (toàn bộ màn hình) | CAMERA (camera kèm âm thanh micro).</summary>
    public string Track { get; set; } = string.Empty;

    /// <summary>Vị trí bắt đầu của đoạn trên dòng thời gian phiên (ms từ lúc bắt đầu phiên).</summary>
    public long StartOffsetMs { get; set; }

    /// <summary>Định dạng MediaRecorder dùng, ví dụ "video/webm;codecs=vp8,opus".</summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>Giá trị displaySurface trình duyệt báo cho nguồn SCREEN ("monitor" = toàn bộ màn hình).</summary>
    public string? DisplaySurface { get; set; }
}
