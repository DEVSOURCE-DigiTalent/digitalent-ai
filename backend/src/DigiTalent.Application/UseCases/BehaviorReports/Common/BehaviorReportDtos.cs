using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// Nội dung lưu trong proctoring_behavior_reports.details (jsonb): đủ để mở lại báo cáo mà không cần tính lại.
/// </summary>
public sealed class BehaviorReportDetails
{
    public int Version { get; set; } = 1;
    public long DurationMs { get; set; }
    public BehaviorStatsDto Stats { get; set; } = new();
    /// <summary>Phần tổng hợp từ nhật ký bằng luật cố định (<see cref="PulseProctoringRisk"/>).</summary>
    public PulseProctoringRiskDto Risk { get; set; } = new();
    /// <summary>Các phát hiện của AI, mỗi phát hiện kèm các sự kiện làm bằng chứng.</summary>
    public List<BehaviorFindingDto> Findings { get; set; } = new();
    /// <summary>Điều AI khuyên chủ doanh nghiệp xem hoặc làm.</summary>
    public string? Advice { get; set; }
    /// <summary>Nhật ký quá dài, AI chỉ nhận các sự kiện đáng chú ý.</summary>
    public bool EventsTruncated { get; set; }
}

/// <summary>Số liệu của một lần làm bài tính từ nhật ký và bài nộp.</summary>
public sealed class BehaviorStatsDto
{
    public int AttemptNo { get; set; }
    /// <summary>Số ký tự của bài tự luận đã nộp.</summary>
    public int EssayChars { get; set; }
    public int PasteCount { get; set; }
    /// <summary>Tổng số ký tự đã dán (mọi nơi trên trang bài làm).</summary>
    public int PastedChars { get; set; }
    /// <summary>Số ký tự đã dán vào ô tự luận.</summary>
    public int PastedIntoEssayChars { get; set; }
    public int LargePasteCount { get; set; }
    public int CopyCount { get; set; }
    /// <summary>Số lần rời tab hoặc rời cửa sổ trình duyệt, và tổng thời gian rời.</summary>
    public int AwayCount { get; set; }
    public long AwayMs { get; set; }
    public long IdleMs { get; set; }
    /// <summary>Số khoảng khuôn mặt bất thường (vắng mặt, nhiều người, nhìn ra ngoài) và tổng thời gian.</summary>
    public int FaceAlertCount { get; set; }
    public long FaceAlertMs { get; set; }
    /// <summary>Số lần mất một nguồn ghi (màn hình, camera, micro).</summary>
    public int SourceLossCount { get; set; }
    public bool SecondScreen { get; set; }
    public int? ChoiceScore { get; set; }
    public int? ChoiceTotal { get; set; }
}

/// <summary>Một phát hiện trên dòng thời gian của phiên: khoảng thời gian, mức độ, lời giải thích và các sự kiện làm bằng chứng.</summary>
public sealed class BehaviorFindingDto
{
    public long StartMs { get; set; }
    public long EndMs { get; set; }
    /// <summary>LOW | MEDIUM | HIGH.</summary>
    public string Severity { get; set; } = PulseProctoringRisk.Low;
    public string Title { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<PulseProctoringEventDto> Events { get; set; } = new();
}

/// <summary>Một vạch trên dải thời gian thu nhỏ của danh sách báo cáo.</summary>
public sealed class BehaviorMarkDto
{
    public long StartMs { get; set; }
    public long EndMs { get; set; }
    public string Severity { get; set; } = PulseProctoringRisk.Low;
}

/// <summary>Một bài cuối khóa đã nộp và báo cáo hành vi của nó (OW-21, bảng nhân viên).</summary>
public class BehaviorReportItemDto
{
    public Guid ReportId { get; set; }
    public Guid SessionId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public Guid? CourseId { get; set; }
    public string? CourseCode { get; set; }
    public string? CourseTitle { get; set; }
    /// <summary>Lĩnh vực TT02 của khóa (1–6, như <c>domains[].number</c> của khoảng trống năng lực) và cấp của khóa (1–3).</summary>
    public int? DomainNumber { get; set; }
    public string? DomainName { get; set; }
    public int? Tier { get; set; }
    public int AttemptNo { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public long DurationMs { get; set; }
    /// <summary>PENDING | READY | FAILED.</summary>
    public string Status { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = PulseProctoringRisk.Low;
    public string? AiLevel { get; set; }
    /// <summary>Mức hiển thị: kết luận của AI khi có, không thì mức tổng hợp từ nhật ký.</summary>
    public string Level { get; set; } = PulseProctoringRisk.Low;
    public string? Summary { get; set; }
    public int FindingCount { get; set; }
    /// <summary>Tiêu đề các phát hiện của AI, nặng nhất trước (tối đa 3) — "đáng ngờ ở đâu" trên danh sách.</summary>
    public List<string> FindingTitles { get; set; } = new();
    /// <summary>Kết quả chấm bài cuối khóa: PASSED | NOT_YET | null (đang chờ chấm).</summary>
    public string? Decision { get; set; }
    public List<BehaviorMarkDto> Marks { get; set; } = new();
}

/// <summary>Các bài cuối khóa của một nhân viên, mới nộp trước, và mức nặng nhất trong số đó.</summary>
public class BehaviorEmployeeDto
{
    public Guid EmployeeId { get; set; }
    /// <summary>Mức hiển thị nặng nhất trong các bài của người này.</summary>
    public string Level { get; set; } = PulseProctoringRisk.Low;
    public int High { get; set; }
    public int Medium { get; set; }
    public int Low { get; set; }
    public int Analyzing { get; set; }
    public List<BehaviorReportItemDto> Reports { get; set; } = new();
}

/// <summary>Chi tiết một báo cáo: dòng thời gian, bằng chứng và bản ghi.</summary>
public class BehaviorReportDetailDto : BehaviorReportItemDto
{
    public BehaviorStatsDto Stats { get; set; } = new();
    public PulseProctoringRiskDto Risk { get; set; } = new();
    public List<BehaviorFindingDto> Findings { get; set; } = new();
    public string? Advice { get; set; }
    public string? Model { get; set; }
    public DateTimeOffset? AnalyzedAt { get; set; }
    /// <summary>AI_NOT_CONFIGURED | AI_UNAVAILABLE | AI_INVALID_ANSWER.</summary>
    public string? ErrorCode { get; set; }
    public bool EventsTruncated { get; set; }
    /// <summary>Bài tự luận đã nộp.</summary>
    public string? EssayText { get; set; }
    /// <summary>Bản ghi màn hình / camera (link đã ký) và toàn bộ nhật ký giám sát.</summary>
    public PulseRecordingDto? Recording { get; set; }
}
