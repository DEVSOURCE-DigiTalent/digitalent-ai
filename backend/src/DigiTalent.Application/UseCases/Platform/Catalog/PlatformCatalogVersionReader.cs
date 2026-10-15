using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Catalog versions (newest first) and the courses of one version.</summary>
public static class PlatformCatalogVersionReader
{
    public static async Task<PlatformCatalogVersionsOutput> ReadListAsync(IApplicationDbContext context)
    {
        var versions = await context.PlatformCatalogVersions.AsNoTracking().OrderByDescending(v => v.VersionNo).ToListAsync();
        var summaries = await SummarizeAsync(context, versions);
        return new PlatformCatalogVersionsOutput
        {
            Items = summaries,
            CurrentVersionNo = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Current)?.VersionNo,
            DraftVersionNo = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Draft)?.VersionNo,
        };
    }

    public static async Task<PlatformCatalogVersionDetail> ReadDetailAsync(IApplicationDbContext context, int versionNo)
    {
        var version = await context.PlatformCatalogVersions.AsNoTracking().FirstOrDefaultAsync(v => v.VersionNo == versionNo)
                      ?? throw new NotFoundException($"Không tìm thấy phiên bản v{versionNo}.");
        var summary = (await SummarizeAsync(context, new List<PlatformCatalogVersion> { version })).Single();
        var sizes = await PlatformCatalogReader.ContentSizesAsync(context, version.Id);
        var rows = await (
                from catalogCourse in context.PlatformCatalogCourses.AsNoTracking()
                join course in context.PlatformCourses on catalogCourse.CourseId equals course.Id
                join domain in context.PlatformFrameworkDomains on catalogCourse.DomainId equals domain.Id
                join framework in context.PlatformFrameworks on domain.FrameworkId equals framework.Id
                where catalogCourse.VersionId == version.Id
                orderby framework.SortOrder, domain.SortOrder, catalogCourse.Level, course.Code
                select new { CatalogCourse = catalogCourse, course.Code, Domain = domain, Framework = framework })
            .ToListAsync();

        return new PlatformCatalogVersionDetail
        {
            Version = summary,
            Editable = version.Status == Statuses.PlatformCatalogVersion.Draft,
            Courses = rows.Select(r =>
            {
                var size = sizes.GetValueOrDefault(r.CatalogCourse.CourseId);
                return new PlatformCatalogCourseRow
                {
                    CourseId = r.CatalogCourse.CourseId,
                    Code = r.Code,
                    Title = r.CatalogCourse.Title,
                    FrameworkId = r.Framework.Id,
                    FrameworkName = r.Framework.Name,
                    DomainId = r.Domain.Id,
                    DomainName = r.Domain.Name,
                    Level = r.CatalogCourse.Level,
                    LevelName = PlatformCatalog.LevelName(r.CatalogCourse.Level),
                    ModuleCount = size.Modules,
                    QuestionCount = size.Questions,
                    PricePerSeat = r.CatalogCourse.PricePerSeat,
                    SalesStatus = r.CatalogCourse.SalesStatus,
                    ChangeKind = r.CatalogCourse.ChangeKind,
                };
            }).ToList(),
        };
    }

    private static async Task<List<PlatformCatalogVersionSummary>> SummarizeAsync(IApplicationDbContext context, List<PlatformCatalogVersion> versions)
    {
        var ids = versions.Select(v => v.Id).ToList();
        var courses = await (
                from catalogCourse in context.PlatformCatalogCourses.AsNoTracking()
                join domain in context.PlatformFrameworkDomains on catalogCourse.DomainId equals domain.Id
                where ids.Contains(catalogCourse.VersionId)
                select new { catalogCourse.VersionId, catalogCourse.ChangeKind, domain.FrameworkId })
            .ToListAsync();
        var userIds = versions.Where(v => v.PublishedByUserId != null).Select(v => v.PublishedByUserId!.Value).Distinct().ToList();
        var emails = await context.Users.AsNoTracking().Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.Email);
        var numbers = await context.PlatformCatalogVersions.AsNoTracking().ToDictionaryAsync(v => v.Id, v => v.VersionNo);

        return versions.Select(v =>
        {
            var own = courses.Where(c => c.VersionId == v.Id).ToList();
            return new PlatformCatalogVersionSummary
            {
                VersionNo = v.VersionNo,
                Status = v.Status,
                BasedOnVersionNo = v.BasedOnVersionId is { } basedOn && numbers.TryGetValue(basedOn, out var no) ? no : null,
                ReleaseNote = v.ReleaseNote,
                CreatedAt = v.CreatedAt,
                PublishedAt = v.PublishedAt,
                PublishedByEmail = v.PublishedByUserId is { } user && emails.TryGetValue(user, out var email) ? email : null,
                CourseCount = own.Count,
                FrameworkCount = own.Select(c => c.FrameworkId).Distinct().Count(),
                NewCount = own.Count(c => c.ChangeKind == PlatformCatalog.ChangeKind.New),
                EditedCount = own.Count(c => c.ChangeKind == PlatformCatalog.ChangeKind.Edited),
            };
        }).ToList();
    }
}
