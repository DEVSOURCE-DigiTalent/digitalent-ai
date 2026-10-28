namespace DigiTalent.Application.UseCases.TrialProgram;

public class GetPlatformTrialsUseCaseOutput
{
    public List<PlatformTrialItem> Items { get; set; } = new();
}

/// <summary>Một doanh nghiệp dùng thử trong hàng chờ phân công / theo dõi của quản trị nền tảng hoặc mentor.</summary>
public class PlatformTrialItem
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? TestDeadline { get; set; }
    public DateTimeOffset? PreferredReviewAt { get; set; }
    public string? RequestNote { get; set; }
    public DateTimeOffset? RequestedAt { get; set; }
    public Guid? MentorUserId { get; set; }
    public string? MentorName { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
    public int Participants { get; set; }
    public int Submitted { get; set; }
    public int Reviewed { get; set; }
}
