namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseFinalUseCaseInput
{
    public Guid CourseId { get; set; }

    /// <summary>Ghi chú minh chứng: nguồn, hành động kiểm tra được, kết luận và bước tiếp theo (30–8000 ký tự).</summary>
    public string EvidenceText { get; set; } = string.Empty;
}
