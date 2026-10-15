namespace DigiTalent.Application.UseCases.Pulse;

public class DecidePulseFinalUseCaseInput
{
    public Guid SubmissionId { get; set; }

    /// <summary>PASSED (duyệt khóa học) | NOT_YET (chưa đạt · cần sửa).</summary>
    public string Decision { get; set; } = string.Empty;

    /// <summary>Lý do gửi nhân viên — nêu tiêu chí và bước tiếp theo (≥ 10 ký tự).</summary>
    public string Reason { get; set; } = string.Empty;
}
