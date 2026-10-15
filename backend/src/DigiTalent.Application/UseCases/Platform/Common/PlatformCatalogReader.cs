using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Common;

public static class PlatformCatalogReader
{
    /// <summary>
    /// All 18 courses in domain then level order, with question counts and seat totals
    /// (optionally limited to one organization's orders).
    /// </summary>
    public static async Task<List<PlatformCourseItem>> ReadCoursesAsync(IApplicationDbContext context, Guid? organizationId = null)
    {
        var courses = await context.PlatformCourses.AsNoTracking()
            .Include(c => c.Domain)
            .OrderBy(c => c.Domain!.SortOrder).ThenBy(c => c.Level)
            .ToListAsync();

        var questionCounts = await context.PlatformCourseQuestions.AsNoTracking()
            .GroupBy(q => new { q.CourseId, q.Status })
            .Select(g => new { g.Key.CourseId, g.Key.Status, Count = g.Count() })
            .ToListAsync();

        var orders = context.CourseSeatOrders.AsNoTracking();
        if (organizationId.HasValue) orders = orders.Where(o => o.OrganizationId == organizationId.Value);
        var seatTotals = await orders
            .GroupBy(o => new { o.CourseId, o.Kind })
            .Select(g => new { g.Key.CourseId, g.Key.Kind, Seats = g.Sum(o => o.Seats), Amount = g.Sum(o => o.TotalAmount) })
            .ToListAsync();

        return courses.Select(c =>
        {
            int Questions(string status) => questionCounts.Where(q => q.CourseId == c.Id && q.Status == status).Sum(q => q.Count);
            var purchased = seatTotals.Where(s => s.CourseId == c.Id && s.Kind == PlatformCatalog.SeatOrderKind.Purchase).ToList();
            return new PlatformCourseItem
            {
                Id = c.Id,
                Code = c.Code,
                DomainCode = c.Domain!.Code,
                DomainName = c.Domain.Name,
                Level = c.Level,
                LevelName = PlatformCatalog.LevelName(c.Level),
                VersionNo = c.VersionNo,
                Title = c.Title,
                Outcome = c.Outcome,
                PricePerSeat = c.PricePerSeat,
                SalesStatus = c.SalesStatus,
                HasDraft = c.HasDraft,
                Draft = c.HasDraft
                    ? new PlatformCourseDraft
                    {
                        Title = c.DraftTitle ?? c.Title,
                        Outcome = c.DraftOutcome ?? c.Outcome,
                        PricePerSeat = c.DraftPricePerSeat ?? c.PricePerSeat,
                        SalesStatus = c.DraftSalesStatus ?? c.SalesStatus,
                    }
                    : null,
                PublishedAt = c.PublishedAt,
                PublishedQuestionCount = Questions(Statuses.PlatformCourseQuestion.Published),
                DraftQuestionCount = Questions(Statuses.PlatformCourseQuestion.Draft),
                SeatsPurchased = purchased.Sum(s => s.Seats),
                SeatsGranted = seatTotals.Where(s => s.CourseId == c.Id && s.Kind == PlatformCatalog.SeatOrderKind.AdminGrant).Sum(s => s.Seats),
                Revenue = purchased.Sum(s => s.Amount),
            };
        }).ToList();
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

    public static async Task<PlatformCourse> FindCourseAsync(IApplicationDbContext context, string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        return await context.PlatformCourses.Include(c => c.Domain).FirstOrDefaultAsync(c => c.Code == normalized)
            ?? throw new DigiTalent.Application.Common.Exceptions.NotFoundException($"Course '{code}' not found.");
    }
}
