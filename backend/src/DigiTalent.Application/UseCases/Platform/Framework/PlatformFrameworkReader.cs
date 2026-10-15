using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>Frameworks with their domains and the courses each domain has in the current and draft catalog versions.</summary>
public static class PlatformFrameworkReader
{
    private sealed record CourseRow(Guid VersionId, Guid DomainId, Guid CourseId, string Code, string Title, short Level, string ChangeKind);

    public static async Task<PlatformFrameworksOutput> ReadListAsync(IApplicationDbContext context)
    {
        var frameworks = await context.PlatformFrameworks.AsNoTracking()
            .Where(f => f.Status != Statuses.PlatformFramework.Archived)
            .OrderBy(f => f.SortOrder).ThenBy(f => f.Name)
            .ToListAsync();
        var domains = await context.PlatformFrameworkDomains.AsNoTracking().Where(d => d.Status == Statuses.PlatformFrameworkDomain.Active).ToListAsync();
        var (current, draft, rows) = await ReadCoursesAsync(context);

        return new PlatformFrameworksOutput
        {
            CurrentCatalogVersionNo = current?.VersionNo,
            DraftCatalogVersionNo = draft?.VersionNo,
            Items = frameworks.Select(f => Summarize(new PlatformFrameworkSummary(), f, domains, current, draft, rows)).ToList(),
        };
    }

    public static async Task<PlatformFrameworkDetail> ReadDetailAsync(IApplicationDbContext context, Guid frameworkId)
    {
        var framework = await context.PlatformFrameworks.AsNoTracking().FirstOrDefaultAsync(f => f.Id == frameworkId)
            ?? throw new NotFoundException("Không tìm thấy khung chuẩn.");
        var domains = await context.PlatformFrameworkDomains.AsNoTracking().Where(d => d.FrameworkId == frameworkId && d.Status == Statuses.PlatformFrameworkDomain.Active).ToListAsync();
        var (current, draft, rows) = await ReadCoursesAsync(context);
        var releases = await (
                from release in context.PlatformFrameworkReleases.AsNoTracking()
                join user in context.Users on release.PublishedByUserId equals user.Id into users
                from user in users.DefaultIfEmpty()
                where release.FrameworkId == frameworkId
                orderby release.VersionNo descending
                select new PlatformFrameworkReleaseItem
                {
                    VersionNo = release.VersionNo,
                    ReleaseNote = release.ReleaseNote,
                    PublishedByEmail = user == null ? null : user.Email,
                    PublishedAt = release.PublishedAt,
                })
            .ToListAsync();

        var detail = Summarize(new PlatformFrameworkDetail(), framework, domains, current, draft, rows);
        detail.CurrentCatalogVersionNo = current?.VersionNo;
        detail.DraftCatalogVersionNo = draft?.VersionNo;
        detail.Releases = releases;
        detail.Domains = domains.OrderBy(d => d.SortOrder).Select(d => new PlatformFrameworkDomainItem
        {
            Id = d.Id,
            Code = d.Code,
            Name = d.Name,
            SortOrder = d.SortOrder,
            PublishedDescription = d.PublishedDescription,
            DraftDescription = d.DraftDescription,
            Courses = Refs(rows.Where(r => r.VersionId == current?.Id && r.DomainId == d.Id)),
            DraftNewCourses = Refs(rows.Where(r => r.VersionId == draft?.Id && r.DomainId == d.Id && r.ChangeKind == PlatformCatalog.ChangeKind.New)),
        }).ToList();
        return detail;
    }

    private static T Summarize<T>(
        T summary, PlatformFramework framework, List<PlatformFrameworkDomain> allDomains,
        PlatformCatalogVersion? current, PlatformCatalogVersion? draft, List<CourseRow> rows)
        where T : PlatformFrameworkSummary
    {
        var domains = allDomains.Where(d => d.FrameworkId == framework.Id).ToList();
        var domainIds = domains.Select(d => d.Id).ToHashSet();
        var inUse = rows.Where(r => r.VersionId == current?.Id && domainIds.Contains(r.DomainId)).ToList();
        summary.Id = framework.Id;
        summary.Code = framework.Code;
        summary.Name = framework.Name;
        summary.Description = framework.Description;
        summary.Status = framework.Status;
        summary.CurrentVersionNo = framework.CurrentVersionNo;
        summary.DomainCount = domains.Count;
        summary.CourseCount = inUse.Count;
        summary.CoursesByLevel = Enumerable.Range(PlatformCatalog.MinLevel, PlatformCatalog.MaxLevel).Select(l => inUse.Count(r => r.Level == l)).ToArray();
        summary.DraftCourseCount = draft == null ? null : rows.Count(r => r.VersionId == draft.Id && domainIds.Contains(r.DomainId));
        summary.HasDraft = domains.Any(d => d.DraftDescription != d.PublishedDescription);
        return summary;
    }

    private static List<PlatformFrameworkCourseRef> Refs(IEnumerable<CourseRow> rows) =>
        rows.OrderBy(r => r.Level).ThenBy(r => r.Code).Select(r => new PlatformFrameworkCourseRef
        {
            CourseId = r.CourseId,
            Code = r.Code,
            Title = r.Title,
            Level = r.Level,
            LevelName = PlatformCatalog.LevelName(r.Level),
        }).ToList();

    private static async Task<(PlatformCatalogVersion? Current, PlatformCatalogVersion? Draft, List<CourseRow> Rows)> ReadCoursesAsync(IApplicationDbContext context)
    {
        var versions = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status != Statuses.PlatformCatalogVersion.Retired)
            .ToListAsync();
        var current = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Current);
        var draft = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Draft);
        var ids = versions.Select(v => v.Id).ToList();
        var rows = await (
                from catalogCourse in context.PlatformCatalogCourses.AsNoTracking()
                join course in context.PlatformCourses on catalogCourse.CourseId equals course.Id
                where ids.Contains(catalogCourse.VersionId)
                select new CourseRow(catalogCourse.VersionId, catalogCourse.DomainId, course.Id, course.Code, catalogCourse.Title, catalogCourse.Level, catalogCourse.ChangeKind))
            .ToListAsync();
        return (current, draft, rows);
    }
}
