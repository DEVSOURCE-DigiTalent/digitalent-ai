namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Trang "Đánh giá đội ngũ" của chủ doanh nghiệp: bước hiện tại, nhân viên, hạn làm bài và báo cáo năng lực.</summary>
public class GetTrialProgramUseCaseOutput
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    /// <summary>SETUP | OPEN | REPORTED.</summary>
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset? TestDeadline { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
    public int MaxParticipants { get; set; }
    /// <summary>Số câu trắc nghiệm của đề tổng hợp.</summary>
    public int ChoiceCount { get; set; }
    public List<TrialParticipantDto> Participants { get; set; } = new();
    /// <summary>Tên phòng ban / vị trí đang có (gợi ý khi nhập).</summary>
    public List<string> Departments { get; set; } = new();
    public List<string> Positions { get; set; } = new();
    /// <summary>Báo cáo năng lực — chỉ có khi bài đã đóng.</summary>
    public TrialReportDto? Report { get; set; }
}
