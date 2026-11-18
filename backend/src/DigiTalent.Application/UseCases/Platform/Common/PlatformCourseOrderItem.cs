namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// A course order (an organization buying a course) with readable course and organization names.
/// </summary>
public class PlatformCourseOrderItem
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;

    public long Amount { get; set; }
    public string? Reason { get; set; }
    public string? CreatedByEmail { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
