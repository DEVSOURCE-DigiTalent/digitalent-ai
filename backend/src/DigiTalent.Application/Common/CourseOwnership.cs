using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common;

/// <summary>
/// Paid courses (Intermediate / Advanced) are bought once per organization: as soon as the organization has an order
/// for a course, every employee may learn it. Basic courses are always free. Codes are compared through
/// <see cref="CourseCodes"/>, so the historical A-codes count as the same course as the M-codes.
/// </summary>
public static class CourseOwnership
{
    /// <summary>Whether a course code is a paid level (Intermediate -I or Advanced -A).</summary>
    public static bool IsPaid(string code)
    {
        var canonical = CourseCodes.Canonical(code);
        return canonical.EndsWith("-I", StringComparison.OrdinalIgnoreCase)
               || canonical.EndsWith("-A", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// The lower paid course a course is bought with: an Advanced course (Mx-A) comes with the Intermediate course of
    /// the same domain (Mx-I); anything else needs none.
    /// </summary>
    public static string? BoughtWith(string code)
    {
        var canonical = CourseCodes.Canonical(code);
        return canonical.Length == 4 && canonical[0] == 'M' && canonical.EndsWith("-A", StringComparison.OrdinalIgnoreCase)
            ? $"{canonical[..3]}I"
            : null;
    }

    /// <summary>Whether the organization bought the course (under any of its code aliases).</summary>
    public static Task<bool> IsPurchasedAsync(IApplicationDbContext context, Guid organizationId, string code)
    {
        var codes = CourseCodes.Aliases(code);
        return (
            from order in context.CourseOrders.AsNoTracking()
            join course in context.PlatformCourses.AsNoTracking() on order.CourseId equals course.Id
            where order.OrganizationId == organizationId && codes.Contains(course.Code)
            select order.Id).AnyAsync();
    }

    /// <summary>Canonical codes of every course the organization bought.</summary>
    public static async Task<HashSet<string>> PurchasedCodesAsync(IApplicationDbContext context, Guid organizationId)
    {
        var codes = await (
                from order in context.CourseOrders.AsNoTracking()
                join course in context.PlatformCourses.AsNoTracking() on order.CourseId equals course.Id
                where order.OrganizationId == organizationId
                select course.Code)
            .Distinct()
            .ToListAsync();
        return codes.Select(CourseCodes.Canonical).ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Price of a course for the whole organization: the published price of its current catalog row (the M-code row
    /// over a historical A-code row, then the latest version), or the default of its level. Basic courses are free.
    /// </summary>
    public static async Task<long> PriceAsync(IApplicationDbContext context, string code)
    {
        if (!IsPaid(code)) return 0;
        var canonical = CourseCodes.Canonical(code);
        var codes = CourseCodes.Aliases(canonical);
        var rows = await context.PlatformCourses.AsNoTracking()
            .Where(c => codes.Contains(c.Code) && c.PublishedAt != null)
            .Select(c => new { c.Code, c.VersionNo, c.Price })
            .ToListAsync();
        var listed = rows.OrderByDescending(c => c.Code == canonical).ThenByDescending(c => c.VersionNo).FirstOrDefault()?.Price ?? 0;
        return listed > 0 ? listed : PlatformCatalog.DefaultPrice(canonical.EndsWith("-A", StringComparison.OrdinalIgnoreCase) ? 3 : 2);
    }

    /// <summary>
    /// Current price of every paid course by canonical code, with the same rule as <see cref="PriceAsync"/>
    /// (for lists, read once).
    /// </summary>
    public static async Task<Dictionary<string, long>> PricesAsync(IApplicationDbContext context)
    {
        var rows = await context.PlatformCourses.AsNoTracking()
            .Where(c => c.PublishedAt != null)
            .Select(c => new { c.Code, c.Level, c.VersionNo, c.Price })
            .ToListAsync();
        return rows
            .Where(c => IsPaid(c.Code))
            .GroupBy(c => CourseCodes.Canonical(c.Code), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var current = g.OrderByDescending(c => c.Code == g.Key).ThenByDescending(c => c.VersionNo).First();
                    return current.Price > 0 ? current.Price : PlatformCatalog.DefaultPrice(current.Level);
                },
                StringComparer.OrdinalIgnoreCase);
    }
}
