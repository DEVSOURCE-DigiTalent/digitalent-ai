namespace DigiTalent.Application.UseCases.TrialProgram;

public class CloseTrialAssessmentUseCaseOutput
{
    public DateTimeOffset ClosedAt { get; set; }
    /// <summary>Số bài dùng để tạo báo cáo.</summary>
    public int Assessed { get; set; }
}
