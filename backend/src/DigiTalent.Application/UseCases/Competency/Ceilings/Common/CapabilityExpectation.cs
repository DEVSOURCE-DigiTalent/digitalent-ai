using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Mức cần đạt chủ doanh nghiệp đặt cho phòng ban ở OW-05 "Năng lực từng phòng ban" (dòng capability_ceilings của phòng
/// ban). Đây là mức kết quả khảo sát năng lực số so với (đường nét đứt) và là đích lộ trình học của nhân viên phòng ban đó;
/// lĩnh vực phòng ban chưa đặt (hoặc người chưa có phòng ban) thì theo chuẩn vị trí = đề xuất của hệ thống.
/// </summary>
public sealed class CapabilityExpectation
{
    private CapabilityExpectation(IReadOnlyDictionary<Guid, Dictionary<Guid, int>> departmentLevels)
    {
        DepartmentLevels = departmentLevels;
    }

    public IReadOnlyDictionary<Guid, Dictionary<Guid, int>> DepartmentLevels { get; }

    /// <summary>Mức phòng ban đã đặt cho lĩnh vực; null = chưa đặt, theo chuẩn vị trí.</summary>
    public int? ExpectedFor(Guid? departmentId, Guid categoryId) =>
        departmentId is Guid id && DepartmentLevels.TryGetValue(id, out var levels) && levels.TryGetValue(categoryId, out var level) && level > 0
            ? level
            : null;

    public static async Task<CapabilityExpectation> LoadAsync(IApplicationDbContext context, Guid organizationId)
    {
        var rows = await context.CapabilityCeilings.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.DepartmentId != null)
            .Select(c => new { c.DepartmentId, c.CompetencyCategoryId, c.CeilingLevel })
            .ToListAsync();
        return new CapabilityExpectation(rows
            .GroupBy(r => r.DepartmentId!.Value)
            .ToDictionary(g => g.Key, g => g.ToDictionary(
                r => r.CompetencyCategoryId,
                r => Math.Clamp((int)r.CeilingLevel, 0, CapabilityCeiling.MaxLevel))));
    }
}
