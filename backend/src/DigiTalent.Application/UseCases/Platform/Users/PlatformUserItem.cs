namespace DigiTalent.Application.UseCases.Platform.Users;

/// <summary>
/// One account as Platform Admin sees it. Role is the highest persisted role, or LEARNER for personal accounts.
/// </summary>
public class PlatformUserItem
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public Guid? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public string Status { get; set; } = string.Empty;
    /// <summary>LOCKED with no end date = locked by an administrator (not by failed sign-ins).</summary>
    public bool IsManuallyLocked { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
