namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// A seat order (purchase or Admin grant) with readable course and organization names.
/// </summary>
public class PlatformSeatOrderItem
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int Seats { get; set; }
    public string Kind { get; set; } = string.Empty;
    public long UnitPrice { get; set; }
    public long TotalAmount { get; set; }
    public string? Reason { get; set; }
    public string? CreatedByEmail { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
