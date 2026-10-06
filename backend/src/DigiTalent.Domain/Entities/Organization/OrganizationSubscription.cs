using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table organization_subscriptions: the organization's current plan (one row per organization).
/// </summary>
public class OrganizationSubscription : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string PlanCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = Statuses.Subscription.Active;
    /// <summary>Null means an unlimited number of users.</summary>
    public int? SeatLimit { get; set; }
    public DateTimeOffset? RenewsAt { get; set; }
}
