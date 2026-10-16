using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Pulse;

public class PulsePersonDto
{
    public Guid EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? WorkEmail { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public string? OrganizationName { get; set; }
}

/// <summary>Người đánh giá quá trình học: quản lý phòng ban (hoặc chủ doanh nghiệp khi nhân viên là quản lý).</summary>
public class PulseReviewerDto
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

/// <summary>Một năng lực thành phần vị trí yêu cầu (mã theo Khung TT02).</summary>
public class PulseCompetencyDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    /// <summary>1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.</summary>
    public int RequiredLevel { get; set; }
    /// <summary>Năng lực lõi bắt buộc với mọi vị trí (4.1, 4.2).</summary>
    public bool Core { get; set; }
}

public class PulseDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    /// <summary>Mục tiêu vị trí, 0 = vị trí không yêu cầu lĩnh vực.</summary>
    public int Target { get; set; }
    /// <summary>Trần năng lực doanh nghiệp đặt cho phòng ban (0..3).</summary>
    public int Ceiling { get; set; }
    /// <summary>Đỉnh lộ trình = min(mục tiêu, trần); 0 = ngoài lộ trình.</summary>
    public int PathTop { get; set; }
    /// <summary>Mức đã xác nhận; 0 = chưa xác nhận.</summary>
    public int Verified { get; set; }
    /// <summary>NONE | COURSE | PRACTICAL_EVIDENCE.</summary>
    public string Source { get; set; } = string.Empty;
    /// <summary>PENDING | GAP | MET | OUTSIDE_PATH.</summary>
    public string Status { get; set; } = string.Empty;
    public int Gap { get; set; }
    public List<PulseCompetencyDto> Competencies { get; set; } = new();
}

/// <summary>Một mô đun của khóa trên lộ trình (tên và đã qua hay chưa).</summary>
public class PulseCourseModuleBriefDto
{
    public string Title { get; set; } = string.Empty;
    public bool Passed { get; set; }
}

/// <summary>Bài đánh giá trước khi học đã nộp của một khóa.</summary>
public class PulsePreAssessmentBriefDto
{
    public Guid PreAssessmentId { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>PASSED | NOT_YET | null (chờ chấm).</summary>
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
}

public class PulseCourseSummaryDto
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int DomainNumber { get; set; }
    public string DomainName { get; set; } = string.Empty;
    /// <summary>1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.</summary>
    public int Tier { get; set; }
    /// <summary>PATH | OPTIONAL | ABOVE_CEILING | OUTSIDE_PATH.</summary>
    public string Zone { get; set; } = string.Empty;
    public bool InPath { get; set; }
    /// <summary>FREE_FULL | SEAT_ACTIVE | PREVIEW.</summary>
    public string Access { get; set; } = string.Empty;
    public bool CanWork { get; set; }
    /// <summary>Lý do chưa được học / ghi tiến độ — xem PulseBlockReason; null nếu được.</summary>
    public string? BlockReason { get; set; }
    /// <summary>Trạng thái hiển thị của ô — xem PulseSlotStatus.</summary>
    public string SlotStatus { get; set; } = string.Empty;
    /// <summary>Trạng thái bài cuối khóa — xem PulseFinalStatus.</summary>
    public string FinalStatus { get; set; } = string.Empty;
    /// <summary>Bài đánh giá trước khi học — xem PulsePreStatus.</summary>
    public string PreStatus { get; set; } = string.Empty;
    public PulsePreAssessmentBriefDto? PreAssessment { get; set; }
    public bool CanStartPreAssessment { get; set; }
    public bool CanStartFinal { get; set; }
    public bool Approved { get; set; }
    /// <summary>PRE_ASSESSMENT | FINAL | LEGACY khi đã được công nhận.</summary>
    public string? ApprovedVia { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public Guid? EnrollmentId { get; set; }
    public string? EnrollmentStatus { get; set; }
    public int ModuleCount { get; set; }
    public int ModulesPassed { get; set; }
    /// <summary>% đã học (đọc trang + câu ôn tập của từng mô đun).</summary>
    public int ProgressPercent { get; set; }
    public int FinalAttempts { get; set; }
    public List<PulseCourseModuleBriefDto> Modules { get; set; } = new();
}

public class PulseLatestOutcomeDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public int Tier { get; set; }
    public int Verified { get; set; }
    public int Target { get; set; }
    /// <summary>PRE_ASSESSMENT | FINAL.</summary>
    public string Via { get; set; } = string.Empty;
    public DateTimeOffset ReviewedAt { get; set; }
}

public class PulseFinalAttemptDto
{
    public Guid SubmissionId { get; set; }
    public int AttemptNo { get; set; }
    public string EvidenceText { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>PASSED | NOT_YET | null (chờ quản lý).</summary>
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public string? ReviewerName { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public DateTimeOffset? RetryOpensAt { get; set; }
    public DateTimeOffset? RetryDueAt { get; set; }
    /// <summary>COACHING | FRESH_CYCLE | PAUSE | null.</summary>
    public string? SupportAction { get; set; }
    public string? SupportNote { get; set; }
    public DateTimeOffset? SupportRecordedAt { get; set; }
    /// <summary>Phiên làm bài có giám sát của lần nộp (null với bài nộp trước khi có giám sát).</summary>
    public Guid? ProctoringSessionId { get; set; }
    /// <summary>Phần trắc nghiệm. Nhân viên chỉ thấy sau khi bài được chấm; người chấm thấy cả từng câu.</summary>
    public PulseChoiceResultDto? Choice { get; set; }
}

/// <summary>Kết quả phần trắc nghiệm của một bài làm.</summary>
public class PulseChoiceResultDto
{
    public int Score { get; set; }
    public int Total { get; set; }
    /// <summary>Số câu đúng tối thiểu để phần trắc nghiệm đạt.</summary>
    public int PassMark { get; set; }
    public bool Passed { get; set; }
    /// <summary>Từng câu — chỉ người chấm thấy (null với nhân viên).</summary>
    public List<PulseChoiceItemDto>? Items { get; set; }
}

public class PulseChoiceItemDto
{
    public int Number { get; set; }
    public string Question { get; set; } = string.Empty;
    /// <summary>Phương án nhân viên đã chọn.</summary>
    public string Selected { get; set; } = string.Empty;
    /// <summary>Đáp án đúng.</summary>
    public string Correct { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

/// <summary>Một câu trắc nghiệm của đề (không kèm đáp án), phát lúc bắt đầu phiên có giám sát.</summary>
public class PulseExamQuestionDto
{
    public Guid QuestionId { get; set; }
    public int Number { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<PulseOptionDto> Options { get; set; } = new();
}

/// <summary>Một phương án của câu hỏi trắc nghiệm (không kèm đáp án).</summary>
public class PulseOptionDto
{
    public Guid OptionId { get; set; }
    public string Content { get; set; } = string.Empty;
}

/// <summary>Câu trả lời: một phương án cho mỗi câu hỏi được phục vụ.</summary>
public class PulseAnswerInput
{
    public Guid QuestionId { get; set; }
    public Guid OptionId { get; set; }
}

public static class PulseMapping
{
    public static PulsePersonDto Person(PulseLearnerSnapshot snapshot) => new()
    {
        EmployeeId = snapshot.Employee.Id,
        FullName = snapshot.Employee.FullName,
        WorkEmail = snapshot.Employee.WorkEmail,
        DepartmentName = snapshot.DepartmentName,
        PositionName = snapshot.PositionName,
        OrganizationName = snapshot.OrganizationName,
    };

    public static PulseReviewerDto? Reviewer(PulseLearnerSnapshot snapshot) =>
        snapshot.Reviewer == null ? null : new PulseReviewerDto { Name = snapshot.Reviewer.Name, Role = snapshot.Reviewer.Role };

    public static PulseDomainDto Domain(PulseDomainState d) => new()
    {
        CategoryId = d.CategoryId,
        Number = d.Number,
        Code = d.Code,
        Name = d.Name,
        Target = d.Target,
        Ceiling = d.Ceiling,
        PathTop = d.PathTop,
        Verified = d.Verified,
        Source = d.Source,
        Status = d.Status,
        Gap = d.Gap,
        Competencies = d.Competencies
            .Select(c => new PulseCompetencyDto { Code = c.Code, Name = c.Name, RequiredLevel = c.RequiredLevel, Core = c.Core })
            .ToList(),
    };

    public static PulseCourseSummaryDto Course(PulseCourseState c) => new()
    {
        CourseId = c.Course.CourseId,
        Code = c.Course.Code,
        Title = c.Course.Title,
        CategoryId = c.Course.CategoryId,
        DomainNumber = c.Domain.Number,
        DomainName = c.Domain.Name,
        Tier = c.Course.Tier,
        Zone = c.Zone,
        InPath = c.InPath,
        Access = c.Access,
        CanWork = c.CanWork,
        BlockReason = c.BlockReason,
        SlotStatus = c.SlotStatus,
        FinalStatus = c.FinalStatus,
        PreStatus = c.PreStatus,
        PreAssessment = c.PreAssessment == null ? null : new PulsePreAssessmentBriefDto
        {
            PreAssessmentId = c.PreAssessment.Id,
            SubmittedAt = c.PreAssessment.SubmittedAt,
            Decision = c.PreAssessment.Decision,
            DecisionReason = c.PreAssessment.DecisionReason,
            ReviewedAt = c.PreAssessment.ReviewedAt,
        },
        CanStartPreAssessment = c.CanStartPreAssessment,
        CanStartFinal = c.CanStartFinal,
        Approved = c.Approved,
        ApprovedVia = c.ApprovedVia,
        ApprovedAt = c.Approved ? ApprovedAt(c) : null,
        EnrollmentId = c.Enrollment?.Id,
        EnrollmentStatus = c.Enrollment?.Status,
        ModuleCount = c.Modules.Count,
        ModulesPassed = c.ModulesPassed,
        ProgressPercent = c.ProgressPercent,
        FinalAttempts = c.Submissions.Count,
        Modules = c.Modules
            .Select(m => new PulseCourseModuleBriefDto
            {
                Title = m.Title,
                Passed = c.Progress?.GetValueOrDefault(m.ModuleId) is { } p && p.Passed(m),
            })
            .ToList(),
    };

    /// <summary>Thời điểm khóa được công nhận: lúc chấm bài đạt, không có thì lúc lượt học hoàn thành.</summary>
    private static DateTimeOffset? ApprovedAt(PulseCourseState c) => c.ApprovedVia switch
    {
        PulseApprovedVia.PreAssessment => c.PreAssessment?.ReviewedAt,
        PulseApprovedVia.Final => c.Submissions.Where(s => s.Decision == Statuses.FinalSubmissionDecision.Passed).Max(s => s.ReviewedAt),
        _ => c.Enrollment?.CompletedAt,
    } ?? c.Enrollment?.CompletedAt;
}
