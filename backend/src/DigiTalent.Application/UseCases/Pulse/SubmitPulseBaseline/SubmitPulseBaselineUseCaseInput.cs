namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseBaselineUseCaseInput
{
    /// <summary>Một phương án cho mỗi câu được phục vụ ở GET /me/pulse/baseline.</summary>
    public List<PulseAnswerInput> Answers { get; set; } = new();
}

public class PulseAnswerInput
{
    public Guid QuestionId { get; set; }
    public Guid OptionId { get; set; }
}
