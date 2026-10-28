using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitMyTrialAssessmentUseCaseInput
{
    /// <summary>Phiên đã mở bằng POST /me/trial-assessment/proctoring và đã ghi màn hình, camera, micro.</summary>
    public Guid ProctoringSessionId { get; set; }

    /// <summary>Một phương án cho mỗi câu trắc nghiệm của đề.</summary>
    public List<PulseAnswerInput> Answers { get; set; } = new();

    public string EssayBasic { get; set; } = string.Empty;
    public string EssayIntermediate { get; set; } = string.Empty;
    public string EssayAdvanced { get; set; } = string.Empty;
}
