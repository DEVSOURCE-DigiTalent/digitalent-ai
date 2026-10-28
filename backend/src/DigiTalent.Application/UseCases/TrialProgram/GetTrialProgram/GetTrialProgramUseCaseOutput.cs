namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Trang "Dùng thử" của chủ doanh nghiệp: bước hiện tại, nhân viên, hạn làm bài, mentor và bảng năng lực.</summary>
public class GetTrialProgramUseCaseOutput
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    /// <summary>SETUP | REQUESTED | ASSIGNED | REPORTED.</summary>
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset? TestDeadline { get; set; }
    public DateTimeOffset? PreferredReviewAt { get; set; }
    public string? RequestNote { get; set; }
    public DateTimeOffset? RequestedAt { get; set; }
    public string? MentorName { get; set; }
    public DateTimeOffset? MentorAssignedAt { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
    public int MaxParticipants { get; set; }
    /// <summary>Số câu trắc nghiệm của đề tổng hợp và số bài tự luận.</summary>
    public int ChoiceCount { get; set; }
    public int EssayCount { get; set; }
    public List<TrialParticipantDto> Participants { get; set; } = new();
    /// <summary>Tên phòng ban / vị trí đang có (gợi ý khi nhập).</summary>
    public List<string> Departments { get; set; } = new();
    public List<string> Positions { get; set; } = new();
    /// <summary>Bảng năng lực — chỉ có khi mentor đã công bố.</summary>
    public TrialReportDto? Report { get; set; }
}
