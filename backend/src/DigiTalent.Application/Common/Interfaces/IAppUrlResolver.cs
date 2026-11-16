namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Dịch vụ tự động phân giải URL gốc của frontend (hỗ trợ động giữa localhost cổng bất kỳ và domain/server hosting).
/// </summary>
public interface IAppUrlResolver
{
    /// <summary>
    /// Trả về URL gốc của frontend đang chạy (ví dụ: http://localhost:5173, http://localhost:5174 hoặc https://portal.domain.com).
    /// </summary>
    string GetFrontendBaseUrl();
}
