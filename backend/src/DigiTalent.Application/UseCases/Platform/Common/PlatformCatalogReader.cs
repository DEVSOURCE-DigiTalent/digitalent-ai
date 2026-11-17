using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Common;

public static class PlatformCatalogReader
{
    /// <summary>
    /// Published courses, by framework, domain then level, with content size, draft price, how many organizations
    /// bought each course and the revenue. A historical A-code row and the M-code row of the same code are one course
    /// (CourseCodes.Aliases): only the current row is listed and the orders of both count for it.
    /// </summary>
    public static async Task<List<PlatformCourseItem>> ReadCoursesAsync(IApplicationDbContext context)
    {
        var courses = (await (
                from course in context.PlatformCourses.AsNoTracking()
                join domain in context.PlatformFrameworkDomains on course.DomainId equals domain.Id
                join framework in context.PlatformFrameworks on domain.FrameworkId equals framework.Id
                where course.PublishedAt != null
                orderby framework.SortOrder, domain.SortOrder, course.Level, course.Code
                select new { Course = course, Domain = domain, Framework = framework })
            .ToListAsync())
            .GroupBy(row => CourseCodes.Canonical(row.Course.Code))
            .Select(g => g.OrderByDescending(row => row.Course.Code == g.Key).ThenByDescending(row => row.Course.VersionNo).First())
            .ToList();

        var current = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status == Statuses.PlatformCatalogVersion.Current).Select(v => (Guid?)v.Id).FirstOrDefaultAsync();
        var draft = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status == Statuses.PlatformCatalogVersion.Draft).Select(v => (Guid?)v.Id).FirstOrDefaultAsync();
        var sizes = current is { } currentId ? await ContentSizesAsync(context, currentId) : new Dictionary<Guid, (int, int)>();
        var draftPrices = draft is { } draftId
            ? await context.PlatformCatalogCourses.AsNoTracking().Where(c => c.VersionId == draftId)
                .ToDictionaryAsync(c => c.CourseId, c => (c.Price, c.SalesStatus))
            : new Dictionary<Guid, (long Price, string SalesStatus)>();

        var ordersByCode = (await (
                from order in context.CourseOrders.AsNoTracking()
                join course in context.PlatformCourses.AsNoTracking() on order.CourseId equals course.Id
                select new { course.Code, order.OrganizationId, order.Amount })
            .ToListAsync())
            .GroupBy(o => CourseCodes.Canonical(o.Code))
            .ToDictionary(g => g.Key, g => g.ToList());

        return courses.Select(row =>
        {
            var c = row.Course;
            var purchased = ordersByCode.GetValueOrDefault(CourseCodes.Canonical(c.Code)) ?? new();
            var size = sizes.GetValueOrDefault(c.Id);
            return new PlatformCourseItem
            {
                Id = c.Id,
                Code = c.Code,
                FrameworkId = row.Framework.Id,
                FrameworkName = row.Framework.Name,
                DomainCode = row.Domain.Code,
                DomainName = row.Domain.Name,
                Level = c.Level,
                LevelName = PlatformCatalog.LevelName(c.Level),
                VersionNo = c.VersionNo,
                Title = c.Title,
                Outcome = c.Outcome,
                Price = c.Price,
                SalesStatus = c.SalesStatus,
                DraftPrice = draftPrices.TryGetValue(c.Id, out var draftCourse) ? draftCourse.Price : null,
                DraftSalesStatus = draftPrices.TryGetValue(c.Id, out var draftSales) ? draftSales.SalesStatus : null,
                PublishedAt = c.PublishedAt,
                ModuleCount = size.Item1,
                QuestionCount = size.Item2,
                PurchaseCount = purchased.Select(o => o.OrganizationId).Distinct().Count(),
                Revenue = purchased.Sum(o => o.Amount),
            };
        }).ToList();
    }

    /// <summary>Module and review-question counts of every course in a catalog version, by platform course id.</summary>
    public static async Task<Dictionary<Guid, (int Modules, int Questions)>> ContentSizesAsync(IApplicationDbContext context, Guid versionId)
    {
        var modules = await (
                from catalogCourse in context.PlatformCatalogCourses.AsNoTracking()
                join module in context.PlatformCourseModules on catalogCourse.Id equals module.CatalogCourseId
                where catalogCourse.VersionId == versionId
                select new { catalogCourse.CourseId, module.Id })
            .ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var questions = await context.PlatformModuleQuestions.AsNoTracking()
            .Where(q => moduleIds.Contains(q.ModuleId))
            .GroupBy(q => q.ModuleId)
            .Select(g => new { ModuleId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.ModuleId, g => g.Count);
        return modules.GroupBy(m => m.CourseId)
            .ToDictionary(g => g.Key, g => (g.Count(), g.Sum(m => questions.GetValueOrDefault(m.Id))));
    }

    /// <summary>
    /// Course orders (an organization buying a course) projected for display, newest first.
    /// </summary>
    public static IQueryable<PlatformCourseOrderItem> QueryOrders(IApplicationDbContext context) =>
        from order in context.CourseOrders.AsNoTracking()
        join course in context.PlatformCourses on order.CourseId equals course.Id
        join organization in context.Organizations on order.OrganizationId equals organization.Id
        join creator in context.Users on order.CreatedByUserId equals creator.Id into creators
        from creator in creators.DefaultIfEmpty()
        orderby order.CreatedAt descending
        select new PlatformCourseOrderItem
        {
            Id = order.Id,
            OrganizationId = order.OrganizationId,
            OrganizationName = organization.Name,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            Amount = order.Amount,
            Reason = order.Reason,
            CreatedByEmail = creator == null ? null : creator.Email,
            CreatedAt = order.CreatedAt,
        };

    /// <summary>A published course by code (its current row: the M-code over a historical A-code alias).</summary>
    public static async Task<PlatformCourse> FindCourseAsync(IApplicationDbContext context, string code)
    {
        var requested = code.Trim().ToUpperInvariant();
        var normalized = CourseCodes.Canonical(requested);
        var aliases = CourseCodes.Aliases(normalized);
        return await context.PlatformCourses.Include(c => c.Domain)
                   .Where(c => aliases.Contains(c.Code) && c.PublishedAt != null)
                   .OrderByDescending(c => c.Code == requested).ThenByDescending(c => c.Code == normalized).ThenBy(c => c.Id).FirstOrDefaultAsync()
               ?? throw new DigiTalent.Application.Common.Exceptions.NotFoundException($"Course '{code}' not found.");
    }
}
