namespace DigiTalent.Application.UseCases.Pulse;

public class DecidePulsePreAssessmentUseCaseInput
{
    public Guid PreAssessmentId { get; set; }

    /// <summary>PASSED (công nhận khóa, không cần học) | NOT_YET (chưa đạt · học khóa).</summary>
    public string Decision { get; set; } = string.Empty;

    /// <summary>Lý do gửi nhân viên — nêu tiêu chí và điều thấy trong bản ghi (≥ 10 ký tự).</summary>
    public string Reason { get; set; } = string.Empty;
}
