namespace DigiTalent.Application.UseCases.Learning;

public class SubmitForEvaluationUseCaseInput
{
    public Guid EnrollmentId { get; set; }
}

public class SubmitForEvaluationUseCaseOutput
{
    public Guid EnrollmentId { get; set; }
    public string Status { get; set; } = string.Empty;
}
