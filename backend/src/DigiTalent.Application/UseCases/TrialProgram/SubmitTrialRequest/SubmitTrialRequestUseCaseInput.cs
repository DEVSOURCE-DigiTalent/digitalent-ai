namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Hạn nhân viên hoàn thành bài đánh giá.</summary>
public class SubmitTrialRequestUseCaseInput
{
    public DateTimeOffset TestDeadline { get; set; }
}
