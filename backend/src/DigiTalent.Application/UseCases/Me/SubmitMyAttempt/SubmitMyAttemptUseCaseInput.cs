namespace DigiTalent.Application.UseCases.Me;

public class SubmitMyAttemptUseCaseInput
{
    public Guid AttemptId { get; set; }

    /// <summary>Đáp án cuối cùng (questionId → optionId). Bỏ qua nếu đã hết giờ.</summary>
    public Dictionary<Guid, Guid?> Answers { get; set; } = new();
}
