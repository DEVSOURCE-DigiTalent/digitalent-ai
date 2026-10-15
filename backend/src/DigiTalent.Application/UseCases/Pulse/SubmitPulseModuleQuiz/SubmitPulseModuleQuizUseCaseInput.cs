namespace DigiTalent.Application.UseCases.Pulse;

public class SubmitPulseModuleQuizUseCaseInput
{
    public Guid CourseId { get; set; }
    public Guid ModuleId { get; set; }
    public List<PulseAnswerInput> Answers { get; set; } = new();
}
