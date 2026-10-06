using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class SubscriptionEntitlement : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SubscriptionId { get; set; }
    public string EntitlementKey { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
