namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Đề xuất phạm vi đào tạo từ kết quả trắc nghiệm (OW-T1 bản đồ năng lực, OW-05 "Theo kết quả test"). Số suất / chi phí của
/// một phạm vi = số người có mức &lt; k ≤ mức tối đa hiệu lực (Cơ bản miễn phí) — trình duyệt tính lại khi chủ doanh nghiệp chỉnh.
/// </summary>
public class GetTrialRoadmapUseCaseOutput
{
    /// <summary>false khi doanh nghiệp không dùng thử hoặc bài chưa đóng — các trường còn lại rỗng.</summary>
    public bool Available { get; set; }
    public List<TrialDomainDto> Domains { get; set; } = new();
    public List<TrialRoadmapDepartmentDto> Departments { get; set; } = new();
    /// <summary>Mức của từng người đã làm bài (ẩn danh), thứ tự lĩnh vực như <see cref="Domains"/>.</summary>
    public List<TrialRoadmapPersonDto> People { get; set; } = new();
    /// <summary>SAVING · BALANCED (đề xuất) · FULL.</summary>
    public List<TrialPlanOptionDto> Options { get; set; } = new();
    public string Suggested { get; set; } = TrialCeilingPlanner.OptionBalanced;
    /// <summary>Lý do mức tối đa đề xuất từng lĩnh vực (✦ AI hoặc câu mẫu).</summary>
    public List<TrialInsightItemDto> Reasons { get; set; } = new();
    /// <summary>PENDING | DONE | FALLBACK.</summary>
    public string InsightStatus { get; set; } = string.Empty;
    /// <summary>Đơn giá một suất theo cấp: [0] = 0, [1] Cơ bản = 0, [2] Trung cấp, [3] Nâng cao.</summary>
    public List<long> Prices { get; set; } = new();
}

public class TrialRoadmapDepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int People { get; set; }
}

public class TrialRoadmapPersonDto
{
    public Guid DepartmentId { get; set; }
    public List<int> Levels { get; set; } = new();
}
