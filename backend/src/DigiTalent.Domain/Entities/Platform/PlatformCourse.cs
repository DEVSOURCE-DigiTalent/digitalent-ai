using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_courses: one of the 18 standard courses (domain x level). The published fields are what
/// organizations see; the Draft* fields hold unpublished edits (all null = no pending draft).
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
    public string? DraftTitle { get; set; }
    public string? DraftOutcome { get; set; }
    public long? DraftPricePerSeat { get; set; }
    public string? DraftSalesStatus { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }

    public PlatformFrameworkDomain? Domain { get; set; }

    public bool HasDraft => DraftTitle != null || DraftOutcome != null || DraftPricePerSeat != null || DraftSalesStatus != null;

    public void ClearDraft()
    {
        DraftTitle = null;
        DraftOutcome = null;
        DraftPricePerSeat = null;
        DraftSalesStatus = null;
    }
}

/// <summary>
/// Table platform_course_releases: the published fields of a course at each version, so learners and
/// orders keep a traceable course reference.
/// </summary>
public class PlatformCourseRelease : BaseEntity
{
    public Guid CourseId { get; set; }
    public int VersionNo { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public Guid? PublishedByUserId { get; set; }
    public DateTimeOffset PublishedAt { get; set; }
}

/// <summary>
/// Table platform_course_questions: question bank of a standard course. New questions are DRAFT and are
/// published together with the next course release.
/// </summary>
public class PlatformCourseQuestion : BaseEntity
{
    public Guid CourseId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
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
