namespace DigiTalent.Application.UseCases.OrganizationOverview;

public class GetOrganizationOverviewUseCaseOutput
{
    public string Name { get; set; } = string.Empty;
    public MemberCounts Members { get; set; } = new();
    public SeatUsage Seats { get; set; } = new();
    /// <summary>Null when the organization has no subscription.</summary>
    public PlanSummary? Plan { get; set; }
    /// <summary>Practical task submissions waiting for a reviewer's evaluation.</summary>
    public int PendingReviews { get; set; }
    public int RunningBatches { get; set; }
    public List<SetupItem> Setup { get; set; } = new();
    public bool SetupCompleted { get; set; }
    public List<RecentActivityItem> RecentActivity { get; set; } = new();
}

/// <summary>Non-archived employees by status; ACTIVE employees are split into active and pending activation.</summary>
public class MemberCounts
{
    /// <summary>ACTIVE employees without an account, or whose account has signed in at least once.</summary>
    public int Active { get; set; }
    /// <summary>ACTIVE employees whose account has never signed in.</summary>
    public int Pending { get; set; }
    public int Inactive { get; set; }
}

public class SeatUsage
{
    /// <summary>ACTIVE user accounts in the organization.</summary>
    public int Used { get; set; }
    /// <summary>Null means unlimited.</summary>
    public int? Limit { get; set; }
}

public class PlanSummary
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? RenewsAt { get; set; }
}

public class SetupItem
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool Done { get; set; }
    public string Detail { get; set; } = string.Empty;
    /// <summary>Frontend route where the step is completed.</summary>
    public string Path { get; set; } = string.Empty;
}

public class RecentActivityItem
{
    public Guid Id { get; set; }
    public DateTimeOffset At { get; set; }
    public string? ActorName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string TargetLabel { get; set; } = string.Empty;
}
