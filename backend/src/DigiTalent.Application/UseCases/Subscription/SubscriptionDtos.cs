namespace DigiTalent.Application.UseCases.Subscription;

// ── GET /subscription ──
public class GetSubscriptionInput { }

public class SubscriptionDto
{
    public string PlanCode { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Cycle { get; set; } = string.Empty;
    public int? SeatLimit { get; set; }
    public int SeatsUsed { get; set; }
    public DateTimeOffset? RenewsAt { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
    public decimal? AmountPerPeriod { get; set; }
    public List<string> Entitlements { get; set; } = new();
    public List<InvoiceDto> Invoices { get; set; } = new();
}

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}

// ── GET /subscription/usage ──
public class GetUsageInput { }

public class UsageDto
{
    public string PlanName { get; set; } = string.Empty;
    public SeatUsage Seats { get; set; } = new();
    public StorageUsage Storage { get; set; } = new();
    public MemberUsage Members { get; set; } = new();
    public List<FeatureUsage> Features { get; set; } = new();
}

public class SeatUsage
{
    public int Used { get; set; }
    public int? Limit { get; set; }
}

public class StorageUsage
{
    public long UsedMb { get; set; }
    public long LimitMb { get; set; }
}

public class MemberUsage
{
    public int Active { get; set; }
    public int Pending { get; set; }
    public int Inactive { get; set; }
}

public class FeatureUsage
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool Enabled { get; set; }
}

// ── POST /subscription/cancel ──
public class CancelSubscriptionInput { }

public class CancelSubscriptionOutput
{
    public bool CancelAtPeriodEnd { get; set; }
}

// ── POST /subscription/resume ──
public class ResumeSubscriptionInput { }

public class ResumeSubscriptionOutput
{
    public bool CancelAtPeriodEnd { get; set; }
}
