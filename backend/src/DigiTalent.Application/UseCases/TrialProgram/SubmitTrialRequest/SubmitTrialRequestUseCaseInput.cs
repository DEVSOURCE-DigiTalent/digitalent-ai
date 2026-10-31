namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Hạn nhân viên hoàn thành bài, giờ mong muốn mentor chấm và ghi chú cho quản trị nền tảng.</summary>
public class SubmitTrialRequestUseCaseInput
{
    public DateTimeOffset TestDeadline { get; set; }
    public DateTimeOffset PreferredReviewAt { get; set; }
    public string? Note { get; set; }
}
