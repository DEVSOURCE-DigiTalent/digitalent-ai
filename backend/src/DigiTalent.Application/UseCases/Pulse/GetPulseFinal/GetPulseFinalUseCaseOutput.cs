namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseFinalUseCaseOutput
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    public PulseDomainDto Domain { get; set; } = new();
    public string? PositionName { get; set; }
    public List<PulseCriterionDto> Criteria { get; set; } = new();
    /// <summary>Xem PulseFinalStatus.</summary>
    public string Status { get; set; } = string.Empty;
    public bool CanSubmit { get; set; }
    /// <summary>Lý do chưa được làm bài cuối (PulseBlockReason), null nếu khóa cho phép.</summary>
    public string? BlockReason { get; set; }
    public int ModulesPassed { get; set; }
    public int ModuleCount { get; set; }
    /// <summary>Mô đun đầu tiên chưa qua — để nút "Tiếp tục mô đun".</summary>
    public Guid? FirstOpenModuleId { get; set; }
    public int MaxAttempts { get; set; }
    public List<PulseFinalAttemptDto> Attempts { get; set; } = new();
    /// <summary>Chính sách hiện hành của doanh nghiệp (cửa sổ thật nằm trên lần nộp đã chấm).</summary>
    public int CooldownHours { get; set; }
    public int DeadlineDays { get; set; }
}
