namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Bài đánh giá tổng hợp của nhân viên dùng thử: đề, hạn, trạng thái và kết quả (sau khi công bố).</summary>
public class GetMyTrialAssessmentUseCaseOutput
{
    public string OrganizationName { get; set; } = string.Empty;
    public DateTimeOffset? TestDeadline { get; set; }
    /// <summary>NOT_STARTED | SUBMITTED | REVIEWED (đã công bố kết quả).</summary>
    public string Status { get; set; } = string.Empty;
    public bool CanStart { get; set; }
    public string? ClosedMessage { get; set; }
    public int ChoiceCount { get; set; }
    public List<TrialDomainDto> Domains { get; set; } = new();
    public List<TrialEssayPromptDto> Essays { get; set; } = new();
    public DateTimeOffset? SubmittedAt { get; set; }
    public bool ReportPublished { get; set; }
    /// <summary>Mức của từng lĩnh vực (thứ tự <see cref="Domains"/>) — chỉ có sau khi công bố.</summary>
    public List<int>? Levels { get; set; }
    /// <summary>Chi tiết kết quả từng lĩnh vực kèm số câu đúng, giải thích và khóa học đề xuất.</summary>
    public List<TrialReportEmployeeDomainDetailDto>? DomainDetails { get; set; }
    public string? ReviewNote { get; set; }
    public string? MentorName { get; set; }
    /// <summary>Chi tiết 3 bài viết tự luận kèm điểm và đánh giá từ Mentor / AI.</summary>
    public List<MyTrialEssayResultDto>? EssayResults { get; set; }
    public string? EssaySummary { get; set; }
}

public class MyTrialEssayResultDto
{
    public int Tier { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int? Score { get; set; }
    public bool? Passed { get; set; }
    public string? Feedback { get; set; }
}
