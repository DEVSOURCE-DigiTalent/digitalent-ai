namespace DigiTalent.Application.UseCases.Pulse;

public class MarkPulseModuleViewedUseCaseOutput
{
    public Guid EnrollmentId { get; set; }
    public bool Viewed { get; set; }
    /// <summary>Mô đun không có câu hỏi ôn tập được tính là đã qua khi đọc hết trang.</summary>
    public bool ModulePassed { get; set; }
}
