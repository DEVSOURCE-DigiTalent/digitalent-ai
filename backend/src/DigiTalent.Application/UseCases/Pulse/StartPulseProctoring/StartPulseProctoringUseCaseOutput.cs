namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseProctoringUseCaseOutput
{
    public Guid SessionId { get; set; }
    public string Kind { get; set; } = string.Empty;
    /// <summary>Mốc 0 của dòng thời gian phiên; offset của đoạn ghi và sự kiện tính từ đây.</summary>
    public DateTimeOffset StartedAt { get; set; }
    /// <summary>Dung lượng tối đa của một mẩu ghi hình tải lên.</summary>
    public int MaxChunkBytes { get; set; }
}
