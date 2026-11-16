namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Kết quả lần vừa nộp và trạng thái mới của bài kiểm tra vượt học.</summary>
public class SubmitPulseSkipTestUseCaseOutput : PulseSkipTestDto
{
    public PulseSkipTestResultDto Result { get; set; } = new();
    /// <summary>Đạt: mọi mô-đun được tính là đã qua và bài đánh giá cuối khóa đã mở.</summary>
    public bool FinalUnlocked { get; set; }
}
