using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Common;

public static class PlatformCatalogReader
{
    /// <summary>
    /// Published courses (those in the catalog version in use), by framework, domain then level, with content size,
    /// draft price and seat totals (optionally limited to one organization's orders).
    /// </summary>
    public static async Task<List<PlatformCourseItem>> ReadCoursesAsync(IApplicationDbContext context, Guid? organizationId = null)
    {
        var courses = await (
                from course in context.PlatformCourses.AsNoTracking()
                join domain in context.PlatformFrameworkDomains on course.DomainId equals domain.Id
                join framework in context.PlatformFrameworks on domain.FrameworkId equals framework.Id
                where course.PublishedAt != null
                orderby framework.SortOrder, domain.SortOrder, course.Level, course.Code
                select new { Course = course, Domain = domain, Framework = framework })
            .ToListAsync();

        var current = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status == Statuses.PlatformCatalogVersion.Current).Select(v => (Guid?)v.Id).FirstOrDefaultAsync();
        var draft = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status == Statuses.PlatformCatalogVersion.Draft).Select(v => (Guid?)v.Id).FirstOrDefaultAsync();
        var sizes = current is { } currentId ? await ContentSizesAsync(context, currentId) : new Dictionary<Guid, (int, int)>();
        var draftPrices = draft is { } draftId
            ? await context.PlatformCatalogCourses.AsNoTracking().Where(c => c.VersionId == draftId)
                .ToDictionaryAsync(c => c.CourseId, c => (c.PricePerSeat, c.SalesStatus))
            : new Dictionary<Guid, (long PricePerSeat, string SalesStatus)>();

        var orders = context.CourseSeatOrders.AsNoTracking();
        if (organizationId.HasValue) orders = orders.Where(o => o.OrganizationId == organizationId.Value);
        var seatTotals = await orders
            .GroupBy(o => new { o.CourseId, o.Kind })
            .Select(g => new { g.Key.CourseId, g.Key.Kind, Seats = g.Sum(o => o.Seats), Amount = g.Sum(o => o.TotalAmount) })
            .ToListAsync();

        return courses.Select(row =>
        {
            var c = row.Course;
            var purchased = seatTotals.Where(s => s.CourseId == c.Id && s.Kind == PlatformCatalog.SeatOrderKind.Purchase).ToList();
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
                PricePerSeat = c.PricePerSeat,
                SalesStatus = c.SalesStatus,
                DraftPricePerSeat = draftPrices.TryGetValue(c.Id, out var draftCourse) ? draftCourse.PricePerSeat : null,
                DraftSalesStatus = draftPrices.TryGetValue(c.Id, out var draftSales) ? draftSales.SalesStatus : null,
                PublishedAt = c.PublishedAt,
                ModuleCount = size.Item1,
                QuestionCount = size.Item2,
                SeatsPurchased = purchased.Sum(s => s.Seats),
                SeatsGranted = seatTotals.Where(s => s.CourseId == c.Id && s.Kind == PlatformCatalog.SeatOrderKind.AdminGrant).Sum(s => s.Seats),
                Revenue = purchased.Sum(s => s.Amount),
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
    /// Seat orders projected for display, newest first.
    /// </summary>
    public static IQueryable<PlatformSeatOrderItem> QueryOrders(IApplicationDbContext context) =>
        from order in context.CourseSeatOrders.AsNoTracking()
        join course in context.PlatformCourses on order.CourseId equals course.Id
        join organization in context.Organizations on order.OrganizationId equals organization.Id
        join creator in context.Users on order.CreatedByUserId equals creator.Id into creators
        from creator in creators.DefaultIfEmpty()
        orderby order.CreatedAt descending
        select new PlatformSeatOrderItem
        {
            Id = order.Id,
            OrganizationId = order.OrganizationId,
            OrganizationName = organization.Name,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            Seats = order.Seats,
            Kind = order.Kind,
            UnitPrice = order.UnitPrice,
            TotalAmount = order.TotalAmount,
            Reason = order.Reason,
            CreatedByEmail = creator == null ? null : creator.Email,
            CreatedAt = order.CreatedAt,
        };

    /// <summary>A published course by code (seat grants only apply to courses in the version in use).</summary>
    public static async Task<PlatformCourse> FindCourseAsync(IApplicationDbContext context, string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return await context.PlatformCourses.Include(c => c.Domain)
                   .FirstOrDefaultAsync(c => c.Code == normalized && c.PublishedAt != null)
               ?? throw new DigiTalent.Application.Common.Exceptions.NotFoundException($"Course '{code}' not found.");
    }
}
