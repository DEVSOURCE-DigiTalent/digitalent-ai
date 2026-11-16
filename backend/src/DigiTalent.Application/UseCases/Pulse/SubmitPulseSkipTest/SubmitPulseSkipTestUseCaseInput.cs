namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseSkipTestUseCaseInput
{
    public Guid CourseId { get; set; }
    /// <summary>Lần làm của đề đang hiển thị; lệch với lần đang mở ở máy chủ → SKIP_TEST_CHANGED.</summary>
    public int AttemptNo { get; set; }
    /// <summary>Một phương án cho mỗi câu đã chọn; câu bỏ trống tính là sai (trình duyệt tự nộp khi hết giờ).</summary>
    public List<PulseAnswerInput> Answers { get; set; } = new();
}
