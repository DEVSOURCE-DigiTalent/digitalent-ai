using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_courses: the stable identity of a standard course (its code) and a mirror of the course as it
/// is in the CURRENT catalog version (domain, level, title, price…). VersionNo = the catalog version in use.
/// The mirror is updated only when a catalog version is published; drafts live in platform_catalog_courses.
/// </summary>
public class PlatformCourse : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public Guid DomainId { get; set; }
    public short Level { get; set; }
    public int VersionNo { get; set; } = 1;
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public DateTimeOffset? PublishedAt { get; set; }

    public PlatformFrameworkDomain? Domain { get; set; }
}

/// <summary>
/// Table course_seat_orders: paid course seats bought by an organization (PURCHASE) or granted to it by
/// Platform Admin (ADMIN_GRANT, reason required). One seat = one employee in one course.
/// </summary>
public class CourseSeatOrder : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid CourseId { get; set; }
    public int Seats { get; set; }
    public string Kind { get; set; } = string.Empty;
    public long UnitPrice { get; set; }
    public long TotalAmount { get; set; }
    public string? Reason { get; set; }
    public Guid? CreatedByUserId { get; set; }
}
