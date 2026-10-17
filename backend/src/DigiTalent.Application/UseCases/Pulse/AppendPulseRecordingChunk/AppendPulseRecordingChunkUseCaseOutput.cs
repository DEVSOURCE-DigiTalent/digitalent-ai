namespace DigiTalent.Application.UseCases.Pulse;

public class AppendPulseRecordingChunkUseCaseOutput
{
    /// <summary>Số mẩu đoạn ghi đã nhận (= thứ tự của mẩu kế tiếp).</summary>
    public int Received { get; set; }
    public long SizeBytes { get; set; }
    /// <summary>true = mẩu này đã nhận từ trước (gửi lại sau lỗi mạng), không ghép thêm.</summary>
    public bool Duplicate { get; set; }
}
