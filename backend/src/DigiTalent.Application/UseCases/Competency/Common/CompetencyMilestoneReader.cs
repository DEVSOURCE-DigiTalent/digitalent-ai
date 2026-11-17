using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Common;

/// <summary>Mốc năng lực doanh nghiệp (competency_milestones) đã đặt, theo lĩnh vực; lĩnh vực chưa đặt (0) không có trong kết quả.</summary>
internal static class CompetencyMilestoneReader
{
    public static Task<Dictionary<Guid, int>> LoadAsync(IApplicationDbContext context, Guid organizationId) =>
        context.CompetencyMilestones.AsNoTracking()
            .Where(m => m.OrganizationId == organizationId && m.MilestoneLevel > 0)
            .ToDictionaryAsync(m => m.CompetencyCategoryId, m => (int)m.MilestoneLevel);
}
