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
    public long Price { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public DateTimeOffset? PublishedAt { get; set; }

    public PlatformFrameworkDomain? Domain { get; set; }
}

/// <summary>
/// Table course_orders: a paid course an organization bought. A course is bought once for the whole organization:
/// once there is an order, every employee may learn it. Reason keeps the purchase note (e-contract code, signer).
/// </summary>
public class CourseOrder : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid CourseId { get; set; }
    public long Amount { get; set; }
    public string? Reason { get; set; }
    public Guid? CreatedByUserId { get; set; }
}
