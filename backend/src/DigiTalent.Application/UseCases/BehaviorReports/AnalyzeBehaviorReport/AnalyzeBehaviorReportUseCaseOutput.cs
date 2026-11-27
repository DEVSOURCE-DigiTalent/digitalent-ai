namespace DigiTalent.Application.UseCases.BehaviorReports;

public class AnalyzeBehaviorReportUseCaseOutput
{
    public Guid ReportId { get; set; }
    /// <summary>PENDING: AI đang phân tích ở nền; mở lại báo cáo sau ít giây để xem kết quả.</summary>
    public string Status { get; set; } = string.Empty;
}
