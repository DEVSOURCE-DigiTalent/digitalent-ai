using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng organization_subscriptions. Gói dịch vụ hiện tại của tổ chức (mỗi tổ chức một dòng).
/// </summary>
public class OrganizationSubscription : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string PlanCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = Statuses.Subscription.Active;
    /// <summary>NULL = không giới hạn người dùng.</summary>
    public int? SeatLimit { get; set; }
    public DateTimeOffset? RenewsAt { get; set; }
}
