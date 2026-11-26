using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// The catalog version each organization learns from. Versions are shared, but a published version reaches an
/// organization only when it is applied to it: to one organization from its profile, or to every organization when
/// the admin publishes with "apply to all" (a fix). Any published version can be applied, newer or older; the courses
/// whose content differs get a new revision, so enrollments, answers and certificates keep the revision they started
/// on. Changes are tracked; the caller saves.
/// </summary>
public sealed class PlatformCatalogApplier(IApplicationDbContext context)
{
    /// <summary>system_settings key (per organization): the catalog version number applied to it.</summary>
    public const string SettingKey = "PLATFORM_CATALOG_VERSION";

    private readonly Dictionary<(int From, int To), List<PlatformCatalogApplyChange>> _plans = new();

    /// <summary>Organizations that have the standard courses (provisioned when they registered).</summary>
    public async Task<List<Guid>> OrganizationsAsync()
    {
        var codes = await StandardCodesAsync();
        return await context.Courses.AsNoTracking()
            .Where(c => codes.Contains(c.Code) && c.Status == Statuses.Course.Published)
            .Select(c => c.OrganizationId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<bool> IsProvisionedAsync(Guid organizationId)
    {
        var codes = await StandardCodesAsync();
        return await context.Courses.AsNoTracking()
            .AnyAsync(c => c.OrganizationId == organizationId && codes.Contains(c.Code) && c.Status == Statuses.Course.Published);
    }

    /// <summary>
    /// Version applied to each organization. Before versions were applied per organization every publication reached
    /// every organization, so an organization without a record learns from the version in use.
    /// </summary>
    public async Task<Dictionary<Guid, int>> VersionsAsync(IReadOnlyCollection<Guid> organizationIds, int currentVersionNo)
    {
        var ids = organizationIds.ToList();
        var settings = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId != null && ids.Contains(s.OrganizationId.Value) && s.Key == SettingKey)
            .Select(s => new { OrganizationId = s.OrganizationId!.Value, s.Value })
            .ToListAsync();
        var saved = settings.ToDictionary(s => s.OrganizationId, s => int.TryParse(s.Value, out var number) ? number : currentVersionNo);
        return ids.ToDictionary(id => id, id => saved.GetValueOrDefault(id, currentVersionNo));
    }

    /// <summary>
    /// Organizations still in the enterprise trial without a course bought: their owner cannot open the course update
    /// screen yet, so a publication reaches them at once.
    /// </summary>
    public async Task<HashSet<Guid>> TrialLimitedAsync(IReadOnlyCollection<Guid> organizationIds)
    {
        var ids = organizationIds.ToList();
        var trials = await context.TrialWorkspaces.AsNoTracking()
            .Where(t => ids.Contains(t.OrganizationId) && t.ConvertedAt == null)
            .Select(t => t.OrganizationId)
            .Distinct()
            .ToListAsync();
        var buyers = await context.CourseOrders.AsNoTracking()
            .Where(o => trials.Contains(o.OrganizationId))
            .Select(o => o.OrganizationId)
            .Distinct()
            .ToListAsync();
        return trials.Except(buyers).ToHashSet();
    }

    /// <summary>Records the version an organization learns from.</summary>
    public async Task SetAsync(Guid organizationId, int versionNo, Guid? userId)
    {
        var setting = await context.SystemSettings.FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Key == SettingKey);
        if (setting == null)
        {
            context.SystemSettings.Add(new SystemSetting
            {
                OrganizationId = organizationId,
                Key = SettingKey,
                Value = versionNo.ToString(),
                Description = "Phiên bản chương trình học đang áp dụng cho doanh nghiệp",
                UpdatedByUserId = userId,
            });
            return;
        }

        setting.Value = versionNo.ToString();
        setting.UpdatedByUserId = userId;
    }

    /// <summary>
    /// Courses whose content differs between two versions, or that only the target version has. A course the target
    /// version does not have is left as it is.
    /// </summary>
    public async Task<List<PlatformCatalogApplyChange>> PlanAsync(int fromVersionNo, int toVersionNo)
    {
        if (fromVersionNo == toVersionNo) return new List<PlatformCatalogApplyChange>();
        if (_plans.TryGetValue((fromVersionNo, toVersionNo), out var cached)) return cached;

        var upTo = Math.Max(fromVersionNo, toVersionNo);
        var rows = await (
                from row in context.PlatformCatalogCourses.AsNoTracking()
                join version in context.PlatformCatalogVersions.AsNoTracking() on row.VersionId equals version.Id
                join course in context.PlatformCourses.AsNoTracking() on row.CourseId equals course.Id
                where version.VersionNo <= upTo
                select new Row(row.CourseId, course.Code, row.Title, row.Level, row.ChangeKind, version.VersionNo))
            .ToListAsync();

        var changes = new List<PlatformCatalogApplyChange>();
        foreach (var course in rows.GroupBy(r => r.CourseId))
        {
            var list = course.ToList();
            var from = ContentVersion(list, fromVersionNo);
            var to = ContentVersion(list, toVersionNo);
            if (to == null || from == to) continue;
            var target = list.First(r => r.VersionNo == toVersionNo);
            changes.Add(new PlatformCatalogApplyChange
            {
                CourseId = course.Key,
                Code = target.Code,
                Title = target.Title,
                Level = target.Level,
                Kind = from == null ? PlatformCatalogApplyChange.Added : PlatformCatalogApplyChange.Updated,
            });
        }

        var plan = changes.OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).ToList();
        _plans[(fromVersionNo, toVersionNo)] = plan;
        return plan;
    }

    /// <summary>Gives one organization the content of <paramref name="target"/> and records the version.</summary>
    public async Task<List<PlatformCatalogApplyChange>> ApplyAsync(
        Guid organizationId, int fromVersionNo, PlatformCatalogVersion target, Guid? authorId, DateTimeOffset now)
    {
        var changes = await PlanAsync(fromVersionNo, target.VersionNo);
        if (changes.Count > 0)
        {
            await new PlatformLearningPublisher(context).PublishAsync(
                target.Id, authorId, now, organizationId, onlyCourseIds: changes.Select(c => c.CourseId).ToList(), reapply: true);
            // New content is learned again from the start by everyone (certificates stay).
            await DigiTalent.Application.UseCases.Learning.CourseUpdates.CourseRelearn.ResetAsync(
                context, organizationId, changes.Select(c => c.Code).ToList());
        }

        await SetAsync(organizationId, target.VersionNo, authorId);
        return changes;
    }

    /// <summary>
    /// The version whose content a course has in <paramref name="versionNo"/>: the last version up to it that added or
    /// edited the course (the first version it appears in when it was never edited); null when the version lacks it.
    /// </summary>
    private static int? ContentVersion(IReadOnlyCollection<Row> rows, int versionNo)
    {
        if (!rows.Any(r => r.VersionNo == versionNo)) return null;
        var upTo = rows.Where(r => r.VersionNo <= versionNo).ToList();
        var changed = upTo.Where(r => r.ChangeKind != PlatformCatalog.ChangeKind.Unchanged).Select(r => r.VersionNo).ToList();
        return changed.Count > 0 ? changed.Max() : upTo.Min(r => r.VersionNo);
    }

    private async Task<List<string>> StandardCodesAsync() =>
        (await context.PlatformCourses.AsNoTracking().Select(c => c.Code).ToListAsync())
        .SelectMany(CourseCodes.Aliases)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    private sealed record Row(Guid CourseId, string Code, string Title, short Level, string ChangeKind, int VersionNo);
}
