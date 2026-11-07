namespace DigiTalent.Application.UseCases.TrialProgram;

public class GetPlatformTrialsUseCaseOutput
{
    public List<PlatformTrialItem> Items { get; set; } = new();
}

/// <summary>Một doanh nghiệp dùng thử trong bảng theo dõi của quản trị nền tảng (PA-14).</summary>
public class PlatformTrialItem
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    /// <summary>SETUP | OPEN | REPORTED.</summary>
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? TestDeadline { get; set; }
    /// <summary>Mentor chấm bài cuối khóa học thử (không chấm bài đánh giá).</summary>
    public Guid? MentorUserId { get; set; }
    public string? MentorName { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
    public int Participants { get; set; }
    public int Submitted { get; set; }
    /// <summary>PENDING | DONE | FALLBACK — gợi ý AI của báo cáo; null khi chưa có báo cáo.</summary>
    public string? InsightStatus { get; set; }
}
