using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Writes the levels the owner sets per domain for a position in Khung năng lực số (OW-05) into the position standard: a
/// new ACTIVE requirement set version kept per domain, every competency of a domain at the domain level — the level the
/// owner set (items <see cref="PositionTargets.OwnerItemNote"/>), else the platform TT02 sample (items
/// <see cref="ReferencePositionMatrixService.SeedItemNote"/>). The previous active version is archived and the
/// employees at the position get their skill gap recalculated (<see cref="PositionRequirementSetActivated"/>).
/// </summary>
internal sealed class PositionLevelWriter(IApplicationDbContext context)
{
    private sealed record Line(Guid CompetencyId, Guid CategoryId, decimal Weight, bool IsMandatory, bool RequiresPracticalEvidence);

    /// <summary>
    /// <paramref name="levels"/> = domains to set (others keep what the owner set before); null = clear every level the
    /// owner set (the position follows the system suggestion). Returns false when nothing changes.
    /// </summary>
    public async Task<bool> SaveAsync(Guid organizationId, JobPosition position, IReadOnlyDictionary<Guid, int>? levels, Guid userId)
    {
        var code = ReferencePositionMatrixService.MatchPosition(position.Code, position.Name)
            ?? throw new BadRequestException(StandardPositions.NotStandard, "position", "INVALID_JOB_POSITION");
        var reference = (await ReferencePositionMatrixService.ReadAsync(context)).Levels[code];
        var domains = (await context.CompetencyCategories.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && c.Status == Statuses.MasterData.Active)
                .Select(c => new { c.Id, c.Code }).ToListAsync())
            .Select(c => (c.Id, Index: PositionTargetsReader.DomainIndex(c.Code)))
            .Where(c => c.Index >= 0)
            .ToDictionary(c => c.Id, c => c.Index);
        if (levels != null && levels.Keys.Any(id => !domains.ContainsKey(id)))
            throw new BadRequestException("A competency domain is not part of the ceiling matrix.", "ceilings", "CATEGORY_NOT_IN_MATRIX");

        var current = await context.PositionRequirementSets
            .Where(s => s.JobPositionId == position.Id && s.Status == Statuses.PositionRequirementSet.Active)
            .ToListAsync();
        var currentIds = current.Select(s => s.Id).ToList();
        var currentItems = await (
                from item in context.PositionRequirementItems.AsNoTracking()
                join competency in context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                where currentIds.Contains(item.RequirementSetId)
                select new { item.CompetencyId, competency.CategoryId, item.RequiredLevel, item.WeightPercent, item.IsMandatory, item.RequiresPracticalEvidence, item.Note })
            .ToListAsync();
        var owner = currentItems.Where(i => i.Note == PositionTargets.OwnerItemNote)
            .GroupBy(i => i.CategoryId).ToDictionary(g => g.Key, g => g.Max(i => i.RequiredLevel));
        var next = levels == null ? new Dictionary<Guid, int>() : new Dictionary<Guid, int>(owner);
        if (levels != null)
            foreach (var (categoryId, level) in levels) next[categoryId] = Math.Clamp(level, 1, CapabilityCeiling.MaxLevel);
        var kept = currentItems.Where(i => domains.ContainsKey(i.CategoryId)).ToList();
        var alreadyPerDomain = kept.Count > 0 && kept.All(i => i.Note is ReferencePositionMatrixService.SeedItemNote or PositionTargets.OwnerItemNote);
        if (alreadyPerDomain && next.Count == owner.Count && next.All(row => owner.TryGetValue(row.Key, out var level) && level == row.Value))
            return false;

        // The competencies of the standard: those of the current version (TT02 domains only), else every competency of the
        // domains; a domain the owner sets that the standard did not cover gets all its competencies.
        var competencies = await context.Competencies.AsNoTracking()
            .Where(c => domains.Keys.Contains(c.CategoryId) && c.Status != Statuses.Competency.Archived)
            .Select(c => new { c.Id, c.CategoryId }).ToListAsync();
        var lines = kept.Select(i => new Line(i.CompetencyId, i.CategoryId, i.WeightPercent, i.IsMandatory, i.RequiresPracticalEvidence)).ToList();
        var covered = lines.Select(l => l.CategoryId).ToHashSet();
        var average = lines.Count > 0 ? lines.Average(l => l.Weight) : 1m;
        var fresh = lines.Count == 0;
        foreach (var competency in competencies.Where(c => fresh || (next.ContainsKey(c.CategoryId) && !covered.Contains(c.CategoryId))).ToList())
            lines.Add(new Line(competency.Id, competency.CategoryId, average, true, true));
        if (lines.Count == 0)
            throw new BadRequestException("The organization has no competency of the national framework yet.", "ceilings", "CATEGORY_NOT_IN_MATRIX");

        var weights = Normalize(lines.Select(l => l.Weight).ToList());
        var now = DateTimeOffset.UtcNow;
        var versionNo = (await context.PositionRequirementSets.Where(s => s.JobPositionId == position.Id)
            .MaxAsync(s => (int?)s.VersionNo) ?? 0) + 1;
        var set = new PositionRequirementSet
        {
            JobPositionId = position.Id,
            VersionNo = versionNo,
            Status = Statuses.PositionRequirementSet.Active,
            EffectiveFrom = DateOnly.FromDateTime(now.UtcDateTime),
            CreatedByUserId = userId,
            ActivatedByUserId = userId,
            ActivatedAt = now,
        };
        set.Items = lines.Select((line, index) => new PositionRequirementItem
        {
            RequirementSetId = set.Id,
            CompetencyId = line.CompetencyId,
            RequiredLevel = next.TryGetValue(line.CategoryId, out var chosen) ? chosen : Math.Clamp(reference[domains[line.CategoryId]], 1, CapabilityCeiling.MaxLevel),
            WeightPercent = weights[index],
            IsMandatory = line.IsMandatory,
            RequiresPracticalEvidence = line.RequiresPracticalEvidence,
            Note = next.ContainsKey(line.CategoryId) ? PositionTargets.OwnerItemNote : ReferencePositionMatrixService.SeedItemNote,
        }).ToList();

        // One ACTIVE set per position is checked per statement: archive the old one first, two saves in one transaction.
        await context.ExecuteInTransactionAsync(async () =>
        {
            foreach (var previous in current)
            {
                previous.Status = Statuses.PositionRequirementSet.Archived;
                previous.EffectiveTo = DateOnly.FromDateTime(now.UtcDateTime);
            }
            await context.SaveChangesAsync();

            context.PositionRequirementSets.Add(set);
            context.AddDomainEvent(new PositionRequirementSetActivated(set.Id, set.JobPositionId));
            await context.SaveChangesAsync();
        });
        return true;
    }

    /// <summary>Weights rescaled to 100 with two decimals, the rounding left on the largest one.</summary>
    private static List<decimal> Normalize(List<decimal> weights)
    {
        var total = weights.Sum();
        var scaled = weights.Select(w => Math.Round(total > 0 ? w * 100m / total : 100m / weights.Count, 2)).ToList();
        var largest = scaled.IndexOf(scaled.Max());
        scaled[largest] += 100m - scaled.Sum();
        return scaled;
    }
}
