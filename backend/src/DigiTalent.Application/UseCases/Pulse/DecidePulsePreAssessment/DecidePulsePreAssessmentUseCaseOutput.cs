namespace DigiTalent.Application.UseCases.Pulse;

public class DecidePulsePreAssessmentUseCaseOutput
{
    public Guid PreAssessmentId { get; set; }
    public string Decision { get; set; } = string.Empty;
    /// <summary>PASSED | NOT_YET — xem PulsePreStatus.</summary>
    public string Status { get; set; } = string.Empty;
    /// <summary>Lượt học được hoàn thành khi bài đạt.</summary>
    public Guid? EnrollmentId { get; set; }
}
