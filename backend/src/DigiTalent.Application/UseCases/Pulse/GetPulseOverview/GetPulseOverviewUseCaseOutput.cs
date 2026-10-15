namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseOverviewUseCaseOutput
{
    public PulsePersonDto Person { get; set; } = new();
    public bool HasPosition { get; set; }
    public bool HasTargets { get; set; }
    public bool Assessed { get; set; }
    public DateTimeOffset? AssessedAt { get; set; }
    public List<PulseDomainDto> Domains { get; set; } = new();
    public List<PulseCourseSummaryDto> Courses { get; set; } = new();
    /// <summary>Khóa nên học tiếp (đang học dở, hoặc ô đầu tiên chưa được duyệt trên lộ trình).</summary>
    public PulseCourseSummaryDto? NextCourse { get; set; }
    /// <summary>Kết quả bài cuối khóa được quản lý duyệt gần nhất (§7.2: mức đầu vào → mức đã xác nhận).</summary>
    public PulseLatestOutcomeDto? LatestOutcome { get; set; }
    public PulseOverviewStatsDto Stats { get; set; } = new();
}

public class PulseOverviewStatsDto
{
    /// <summary>Lĩnh vực có khoảng cách đã đo (mức đã xác nhận ≥ 1 và thấp hơn mục tiêu).</summary>
    public int GapCount { get; set; }
    /// <summary>Lĩnh vực trong mục tiêu chưa có mức đo được.</summary>
    public int PendingCount { get; set; }
    public int TargetDomainCount { get; set; }
    public int MetCount { get; set; }
    /// <summary>Khóa có lượt học (được giao / đang học / đã xong).</summary>
    public int AssignedCourses { get; set; }
    public int ApprovedCourses { get; set; }
    public int InReview { get; set; }
}
