namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Phiên làm bài có giám sát vừa mở, kèm đề tổng hợp (không kèm đáp án). Gửi lại câu trả lời khi nộp.</summary>
public class StartMyTrialAssessmentUseCaseOutput
{
    public Guid SessionId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public int MaxChunkBytes { get; set; }
    public List<TrialExamQuestionDto> Questions { get; set; } = new();
    public List<TrialEssayPromptDto> Essays { get; set; } = new();
}
