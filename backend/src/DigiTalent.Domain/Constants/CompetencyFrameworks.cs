namespace DigiTalent.Domain.Constants;

/// <summary>
/// Khung năng lực bên ngoài mà bộ tiêu chuẩn vị trí phải bám theo (bảng competency_frameworks).
/// </summary>
public static class CompetencyFrameworks
{
    /// <summary>
    /// Khung năng lực số — Thông tư 02/2025/TT-BGDĐT: 6 miền, 24 năng lực thành phần.
    /// Bộ tiêu chuẩn vị trí phải có đủ 24 năng lực này mới được kích hoạt (quyết định D-B4, 29/09/2026).
    /// </summary>
    public static class Tt02
    {
        public const string Code = "TT02_2025";
        public const string Version = "02/2025/TT-BGDĐT";

        public static readonly IReadOnlyList<string> CompetencyCodes = new[]
        {
            "1.1", "1.2", "1.3",
            "2.1", "2.2", "2.3", "2.4", "2.5", "2.6",
            "3.1", "3.2", "3.3", "3.4",
            "4.1", "4.2", "4.3", "4.4",
            "5.1", "5.2", "5.3", "5.4",
            "6.1", "6.2", "6.3",
        };
    }
}
