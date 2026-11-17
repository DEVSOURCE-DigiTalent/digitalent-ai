using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Đặt mốc năng lực doanh nghiệp cho từng lĩnh vực (OW-05). Mốc áp dụng cho cả doanh nghiệp và không cần suất học:
/// doanh nghiệp đặt mốc trước, báo cáo dùng thử so kết quả nhân viên với mốc để quyết định mua khóa nào.
/// </summary>
public class UpdateCompetencyMilestonesUseCase : IUseCase<UpdateCompetencyMilestonesUseCaseInput, UpdateCompetencyMilestonesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly CapabilityCeilingReader _reader;

    public UpdateCompetencyMilestonesUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IAuditService auditService,
        CapabilityCeilingReader reader)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _reader = reader;
    }

    public async Task<UpdateCompetencyMilestonesUseCaseOutput> ExecuteAsync(UpdateCompetencyMilestonesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var domainIds = (await _reader.LoadDomainsAsync(organizationId)).Select(d => d.Id).ToHashSet();
        var requested = input.Milestones.ToDictionary(m => m.CategoryId, m => (short)m.Level);
        if (requested.Keys.Any(id => !domainIds.Contains(id)))
        {
            throw new BadRequestException("A competency domain is not part of the ceiling matrix.", "milestones", "CATEGORY_NOT_IN_MATRIX");
        }

        var categoryIds = requested.Keys.ToList();
        var rows = await _context.CompetencyMilestones
            .Where(m => m.OrganizationId == organizationId && categoryIds.Contains(m.CompetencyCategoryId))
            .ToDictionaryAsync(m => m.CompetencyCategoryId);
        var oldValues = rows.ToDictionary(r => r.Key.ToString(), r => r.Value.MilestoneLevel);
        foreach (var (categoryId, level) in requested)
        {
            if (!rows.TryGetValue(categoryId, out var row))
            {
                if (level == 0) continue;
                row = new CompetencyMilestone { OrganizationId = organizationId, CompetencyCategoryId = categoryId };
                _context.CompetencyMilestones.Add(row);
            }

            row.MilestoneLevel = level;
            row.UpdatedByUserId = _currentUser.UserId;
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "COMPETENCY_MILESTONE_UPDATED",
            "competency_milestones",
            organizationId,
            oldValues.Count == 0 ? null : oldValues,
            new { milestones = requested.ToDictionary(r => r.Key.ToString(), r => r.Value) },
            "Mốc năng lực doanh nghiệp");

        return await _reader.ReadAsync<UpdateCompetencyMilestonesUseCaseOutput>(organizationId);
    }
}
