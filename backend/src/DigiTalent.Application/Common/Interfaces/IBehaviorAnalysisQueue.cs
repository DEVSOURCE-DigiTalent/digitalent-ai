namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Hàng đợi phân tích hành vi chạy nền (Infrastructure: một BackgroundService). Gọi sau khi báo cáo đã được lưu
/// (status PENDING): AI phân tích ngoài request, kết quả ghi lại vào proctoring_behavior_reports. Một báo cáo đang chờ
/// trong hàng thì không được thêm lần nữa.
/// </summary>
public interface IBehaviorAnalysisQueue
{
    void Enqueue(Guid reportId);
}
