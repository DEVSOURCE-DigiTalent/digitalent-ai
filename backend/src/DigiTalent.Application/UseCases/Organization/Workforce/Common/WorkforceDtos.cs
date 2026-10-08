using DigiTalent.Application.UseCases.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Application.UseCases.Learning.CourseAssignments;
using DigiTalent.Application.UseCases.Organization.Employees;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

/// <summary>
/// One employee of the workforce (frontend services/workforce.service.ts WorkforceRow): the employee, the latest
/// skill gap snapshot and the course assignment counts.
/// </summary>
public class WorkforceRow : EmployeeListItem
{
    public bool HasSnapshot { get; set; }

    /// <summary>Why no skill gap can be calculated (NO_JOB_POSITION / NO_ACTIVE_REQUIREMENT_SET / EMPLOYEE_NOT_ACTIVE); null when it can.</summary>
    public string? Blocker { get; set; }

    /// <summary>Values of the latest snapshot; null when there is none.</summary>
    public decimal? CoveragePercent { get; set; }
    public int? GapCount { get; set; }
    public int? HighCount { get; set; }

    /// <summary>Course assignments (cancelled ones excluded): not completed / completed / past due and not completed.</summary>
    public int ActiveCourses { get; set; }
    public int CompletedCourses { get; set; }
    public int OverdueCourses { get; set; }
}

/// <summary>
/// Everything an Owner sees about one employee (OW-03 member tabs, OW-20 competency profile).
/// </summary>
public class EmployeeCapability
{
    public EmployeeListItem Employee { get; set; } = new();
    public WorkforceRow Summary { get; set; } = new();

    /// <summary>Every competency of the Circular 02/2025 framework with the confirmed and the required level.</summary>
    public List<CompetencyLevelRow> Competencies { get; set; } = new();

    /// <summary>Latest skill gap snapshot; null when none was calculated.</summary>
    public WorkforceSkillGap? SkillGap { get; set; }

    /// <summary>Always empty: course recommendations are served by GET /intelligence/recommendations?employeeId=.</summary>
    public List<CourseRecommendationDto> Recommendations { get; set; } = new();

    public List<AssignmentRow> Learning { get; set; } = new();
    public List<EvidenceRow> Evidence { get; set; } = new();
    public List<WorkforceTaskRow> Tasks { get; set; } = new();
    public List<WorkforceSubmissionRow> Submissions { get; set; } = new();
    public List<WorkforceAttemptRow> Assessments { get; set; } = new();
    public List<WorkforceCertificateRow> Certificates { get; set; } = new();
}

public class CompetencyLevelRow
{
    public Guid CompetencyId { get; set; }
    public string FrameworkCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int CategorySortOrder { get; set; }

    /// <summary>Confirmed level; null = nothing confirmed yet.</summary>
    public short? CurrentLevel { get; set; }

    /// <summary>Level the active requirement set of the position asks for; 0 = not required.</summary>
    public int RequiredLevel { get; set; }

    /// <summary>MIGRATION / TASK / MANUAL (source of the confirming evidence).</summary>
    public string? Source { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public string? Note { get; set; }
}

public class EvidenceRow
{
    public Guid CompetencyId { get; set; }
    public string CompetencyName { get; set; } = string.Empty;
    public string FrameworkCode { get; set; } = string.Empty;
    public short Level { get; set; }
    public string Source { get; set; } = string.Empty;
    public DateTimeOffset ConfirmedAt { get; set; }
    public string? Note { get; set; }
}

public class WorkforceSkillGap
{
    public Guid RunId { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public int RequirementSetVersionNo { get; set; }
    public SkillGapSummaryDto Summary { get; set; } = new();
    public List<SkillGapItemDto> Items { get; set; } = new();
}

/// <summary>A practical task given to the employee (OW-03 tab Nhiệm vụ).</summary>
public class WorkforceTaskRow
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<Guid> CompetencyIds { get; set; } = new();
}

/// <summary>A submission of a practical task (OW-03 tab Minh chứng).</summary>
public class WorkforceSubmissionRow
{
    public Guid Id { get; set; }
    public string TaskTitle { get; set; } = string.Empty;

    /// <summary>Submission note, or the first link when there is no note.</summary>
    public string? Content { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    public string? EvaluatorName { get; set; }
}

/// <summary>A submitted assessment attempt (OW-03 tab Đánh giá).</summary>
public class WorkforceAttemptRow
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public bool Passed { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
}

/// <summary>A certificate of the employee (OW-03 tab Thành tựu).</summary>
public class WorkforceCertificateRow
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTimeOffset IssueDate { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
