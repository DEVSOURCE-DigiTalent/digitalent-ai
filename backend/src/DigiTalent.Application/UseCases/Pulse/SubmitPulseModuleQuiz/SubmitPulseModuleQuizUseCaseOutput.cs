namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseModuleQuizUseCaseOutput
{
    public int Score { get; set; }
    public int Total { get; set; }
    public bool Passed { get; set; }
    /// <summary>Câu trả lời sai kèm lý do để ôn lại (không lộ đáp án đúng).</summary>
    public List<PulseWrongAnswerDto> Wrong { get; set; } = new();
    public bool ModulePassed { get; set; }
    public Guid? NextModuleId { get; set; }
    public bool AllModulesPassed { get; set; }
}

public class PulseWrongAnswerDto
{
    public Guid QuestionId { get; set; }
    public string? Explanation { get; set; }
}
