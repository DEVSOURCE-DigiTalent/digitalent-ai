using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class Subscription : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string PlanCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = "ACTIVE";
    public string Cycle { get; set; } = "month";
    public int? SeatLimit { get; set; }
    public int SeatsUsed { get; set; }
    public decimal AmountPerPeriod { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public DateTimeOffset? RenewsAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
