using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Trang chấm bài dùng thử của một doanh nghiệp cho mentor.</summary>
public class GetMentorTrialUseCaseOutput
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public DateTimeOffset? TestDeadline { get; set; }
    public DateTimeOffset? PreferredReviewAt { get; set; }
    public string? RequestNote { get; set; }
    public DateTimeOffset? ReportPublishedAt { get; set; }
    public List<TrialDomainDto> Domains { get; set; } = new();
    public List<TrialParticipantDto> Participants { get; set; } = new();
    public List<MentorAssessmentDto> Assessments { get; set; } = new();
    /// <summary>Công bố được khi có ít nhất một bài và mọi bài đã nộp đều đã chấm.</summary>
    public bool CanPublish { get; set; }

    /// <summary>Có khóa AI để gợi ý chấm tự luận.</summary>
    public bool AiAvailable { get; set; }

    /// <summary>Thang điểm tự luận và điểm đạt (10 / 5).</summary>
    public int EssayMaxScore { get; set; } = TrialProgramRules.EssayMaxScore;
    public int EssayPassScore { get; set; } = TrialProgramRules.EssayPassScore;
}

public class MentorAssessmentDto
{
    public Guid AssessmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewNote { get; set; }
    public int ChoiceScore { get; set; }
    public int ChoiceTotal { get; set; }
    public List<MentorDomainResultDto> Domains { get; set; } = new();
    public List<MentorEssayDto> Essays { get; set; } = new();
    public List<PulseChoiceItemDto> ChoiceItems { get; set; } = new();
    public PulseRecordingDto? Recording { get; set; }

    /// <summary>Gợi ý chấm tự luận của AI đã lưu (null khi chưa chạy).</summary>
    public TrialEssayAiReviewDto? AiReview { get; set; }
}

public class MentorDomainResultDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Số câu đúng / số câu theo cấp: [Cơ bản, Trung cấp, Nâng cao].</summary>
    public List<int> Correct { get; set; } = new();
    public List<int> Total { get; set; } = new();
    public int SuggestedLevel { get; set; }
    public int? MentorLevel { get; set; }
}

public class MentorEssayDto
{
    public int Tier { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;

    /// <summary>Điểm mentor đã cho (0–10), null khi chưa chấm.</summary>
    public int? Score { get; set; }
}
