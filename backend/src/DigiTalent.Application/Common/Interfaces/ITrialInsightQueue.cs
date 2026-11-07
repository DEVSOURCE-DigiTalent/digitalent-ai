namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Hàng đợi viết gợi ý AI cho báo cáo dùng thử (chạy nền, không chặn request). Đưa vào sau khi báo cáo đã lưu; dịch vụ nền
/// cũng quét lại các báo cáo còn chờ (khi khởi động lại).
/// </summary>
public interface ITrialInsightQueue
{
    void Enqueue(Guid reportId);
}
