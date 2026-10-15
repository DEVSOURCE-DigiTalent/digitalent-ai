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

public class PulseDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    /// <summary>Mục tiêu vị trí, 0 = ngoài lộ trình.</summary>
    public int Target { get; set; }
    /// <summary>Mức đầu vào; null = chưa làm bài đầu vào.</summary>
    public int? Baseline { get; set; }
    /// <summary>Mức đã xác nhận; 0 = chưa xác nhận.</summary>
    public int Verified { get; set; }
    /// <summary>BASELINE | COURSE | PRACTICAL_EVIDENCE.</summary>
    public string Source { get; set; } = string.Empty;
    /// <summary>PENDING | GAP | MET | OUTSIDE_PATH.</summary>
    public string Status { get; set; } = string.Empty;
    public int Gap { get; set; }
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
    public bool InPath { get; set; }
    /// <summary>FREE_FULL | SEAT_ACTIVE | PREVIEW.</summary>
    public string Access { get; set; } = string.Empty;
    public bool CanWork { get; set; }
    /// <summary>NO_POSITION | NOT_ASSESSED | OUTSIDE_PATH | SEAT_REQUIRED | PRIOR_LEVEL_REQUIRED | null.</summary>
    public string? BlockReason { get; set; }
    /// <summary>COMPLETED | IN_REVIEW | IN_PROGRESS | SEAT_HELD | NEEDS_SUPPORT | AFTER_BASELINE | FREE_TO_START | SEAT_NEEDED | AFTER_PRIOR_LEVEL.</summary>
    public string SlotStatus { get; set; } = string.Empty;
    /// <summary>Trạng thái bài cuối khóa — xem PulseFinalStatus.</summary>
    public string FinalStatus { get; set; } = string.Empty;
    public Guid? EnrollmentId { get; set; }
    public string? EnrollmentStatus { get; set; }
    public int ModuleCount { get; set; }
    public int ModulesPassed { get; set; }
    public int FinalAttempts { get; set; }
}

public class PulseLatestOutcomeDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public int Tier { get; set; }
    public int Baseline { get; set; }
    public int Verified { get; set; }
    public int Target { get; set; }
    /// <summary>true = khóa đã nâng mức đã xác nhận cao hơn mức đầu vào.</summary>
    public bool Gained { get; set; }
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

    public static PulseDomainDto Domain(PulseDomainState d) => new()
    {
        CategoryId = d.CategoryId,
        Number = d.Number,
        Code = d.Code,
        Name = d.Name,
        Target = d.Target,
        Baseline = d.Baseline,
        Verified = d.Verified,
        Source = d.Source,
        Status = d.Status,
        Gap = d.Gap,
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
        InPath = c.InPath,
        Access = c.Access,
        CanWork = c.CanWork,
        BlockReason = c.BlockReason,
        SlotStatus = c.SlotStatus,
        FinalStatus = c.FinalStatus,
        EnrollmentId = c.Enrollment?.Id,
        EnrollmentStatus = c.Enrollment?.Status,
        ModuleCount = c.Modules.Count,
        ModulesPassed = c.ModulesPassed,
        FinalAttempts = c.Submissions.Count,
    };
}
