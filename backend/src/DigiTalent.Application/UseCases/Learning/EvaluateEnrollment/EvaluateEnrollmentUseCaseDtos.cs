namespace DigiTalent.Application.UseCases.Learning;

public class EvaluateEnrollmentUseCaseInput
{
    public Guid EnrollmentId { get; set; }
    public string Verdict { get; set; } = string.Empty;
    public string? Feedback { get; set; }
}

public class EvaluateEnrollmentUseCaseOutput
{
    public Guid EnrollmentId { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;
    public string Verdict { get; set; } = string.Empty;
    public string? CertificateCode { get; set; }
    public List<CompetencyUpdateDto> CompetencyUpdates { get; set; } = new();
}

public class CompetencyUpdateDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public short PreviousLevel { get; set; }
    public short NewLevel { get; set; }
}
