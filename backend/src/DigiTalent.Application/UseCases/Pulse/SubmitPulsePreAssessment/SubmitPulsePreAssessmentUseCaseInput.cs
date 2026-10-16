namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulsePreAssessmentUseCaseInput
{
    public Guid CourseId { get; set; }

    /// <summary>Ghi chú minh chứng: nguồn, hành động kiểm tra được, kết luận và bước tiếp theo (30–8000 ký tự).</summary>
    public string EvidenceText { get; set; } = string.Empty;

    /// <summary>Phiên làm bài có giám sát (POST …/proctoring với kind PRE_ASSESSMENT) đã ghi màn hình, camera và micro.</summary>
    public Guid ProctoringSessionId { get; set; }
}
