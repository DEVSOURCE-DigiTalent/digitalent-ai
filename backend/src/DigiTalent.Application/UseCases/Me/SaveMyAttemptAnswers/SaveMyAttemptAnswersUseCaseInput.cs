namespace DigiTalent.Application.UseCases.Me;

public class SaveMyAttemptAnswersUseCaseInput
{
    public Guid AttemptId { get; set; }

    /// <summary>questionId → optionId đã chọn (null = bỏ chọn).</summary>
    public Dictionary<Guid, Guid?> Answers { get; set; } = new();
}
