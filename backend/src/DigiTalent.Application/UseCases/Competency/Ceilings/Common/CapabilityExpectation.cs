using DigiTalent.Application.UseCases.Competency.Common;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Mức cần đạt chủ doanh nghiệp đặt cho vị trí ở Khung năng lực số (OW-05 "Năng lực từng vị trí", ghi trong chuẩn vị trí
/// bởi <see cref="PositionLevelWriter"/>). Đây là mức kết quả khảo sát năng lực số so với và là đích lộ trình học của nhân
/// viên ở vị trí đó, ở mọi phòng ban; lĩnh vực chưa đặt (hoặc người chưa có vị trí) theo chuẩn vị trí = đề xuất của hệ thống.
/// </summary>
internal static class CapabilityExpectation
{
    /// <summary>Mức chủ doanh nghiệp đặt cho lĩnh vực của vị trí; null = chưa đặt, theo chuẩn vị trí.</summary>
    public static int? ExpectedFor(PositionTargets? standard, Guid categoryId) =>
        standard != null && standard.OwnerDomains.Contains(categoryId) && standard.Levels.TryGetValue(categoryId, out var level) && level > 0
            ? level
            : null;
}
