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

    /// <summary>Personal plan: IND_PLUS / IND_PRO, IND_FREE once the trial ended; null for organization accounts.</summary>
    public string? PlanCode { get; set; }
    /// <summary>ACTIVE (in the 7-day trial) or ENDED (trial over, now on the Free plan); null without a trial.</summary>
    public string? TrialState { get; set; }
    public DateTimeOffset? TrialStartedAt { get; set; }
    public DateTimeOffset? TrialEndsAt { get; set; }
}
