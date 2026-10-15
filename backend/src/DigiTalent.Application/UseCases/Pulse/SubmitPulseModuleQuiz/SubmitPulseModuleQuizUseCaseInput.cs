namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseModuleQuizUseCaseInput
{
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    /// <summary>Lần làm của bộ câu đang hiển thị (quiz.attemptNo); lệch với lần kế tiếp ở máy chủ → QUIZ_CHANGED.</summary>
    public int? AttemptNo { get; set; }
    public List<PulseAnswerInput> Answers { get; set; } = new();
}
