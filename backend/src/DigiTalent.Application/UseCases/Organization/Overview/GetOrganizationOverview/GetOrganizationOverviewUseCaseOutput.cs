namespace DigiTalent.Application.UseCases.OrganizationOverview;

public class GetOrganizationOverviewUseCaseOutput
{
    public string Name { get; set; } = string.Empty;
    public MemberCounts Members { get; set; } = new();
    public SeatUsage Seats { get; set; } = new();
    /// <summary>NULL khi tổ chức chưa có gói dịch vụ.</summary>
    public PlanSummary? Plan { get; set; }
    /// <summary>Nhiệm vụ thực tế đã nộp, đang chờ người duyệt đánh giá.</summary>
    public int PendingReviews { get; set; }
    public int RunningBatches { get; set; }
    public List<SetupItem> Setup { get; set; } = new();
    public bool SetupCompleted { get; set; }
    public List<RecentActivityItem> RecentActivity { get; set; } = new();
}

/// <summary>Nhân viên chưa lưu trữ theo trạng thái; ACTIVE được tách thành đã đăng nhập và chờ kích hoạt.</summary>
public class MemberCounts
{
    /// <summary>ACTIVE, không có tài khoản hoặc tài khoản đã đăng nhập ít nhất một lần.</summary>
    public int Active { get; set; }
    /// <summary>ACTIVE nhưng tài khoản chưa đăng nhập lần nào (chờ kích hoạt).</summary>
    public int Pending { get; set; }
    public int Inactive { get; set; }
}

public class SeatUsage
{
    /// <summary>Số tài khoản người dùng đang ACTIVE của tổ chức.</summary>
    public int Used { get; set; }
    /// <summary>NULL = không giới hạn.</summary>
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
    /// <summary>Đường dẫn màn hình frontend để hoàn thành bước này.</summary>
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
