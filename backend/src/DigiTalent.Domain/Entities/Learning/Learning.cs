using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Learning;

public class Course : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DifficultyLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public Guid? OwnerTrainerId { get; set; }
    public decimal? PassingScore { get; set; }
    public string Status { get; set; } = "DRAFT";

    public ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public ICollection<CourseCompetency> CourseCompetencies { get; set; } = new List<CourseCompetency>();
    public ICollection<CourseAssignment> Assignments { get; set; } = new List<CourseAssignment>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<LearningMaterial> Materials { get; set; } = new List<LearningMaterial>();
}

public class CourseModule : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}

public class Lesson : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public CourseModule Module { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string ContentType { get; set; } = "TEXT";
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public string Status { get; set; } = "DRAFT";
}

public class LearningMaterial : AuditableEntity
{
    public Guid? CourseId { get; set; }
    public Guid? LessonId { get; set; }
    public Guid? FileObjectId { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public string? ExternalUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class CourseCompetency : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid CompetencyId { get; set; }
    public Competency.Competency Competency { get; set; } = null!;
    public int? TargetLevelValue { get; set; }
    public decimal CoverageWeight { get; set; }
    public string? Notes { get; set; }
}

public class CourseAssignment : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string AssignmentType { get; set; } = "EMPLOYEE";
    public Guid? TargetEmployeeId { get; set; }
    public Guid? TargetDepartmentId { get; set; }
    public Guid? TargetJobPositionId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Status { get; set; } = "ACTIVE";
}

public class Enrollment : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public Organization.Employee Employee { get; set; } = null!;
    public Guid? CourseAssignmentId { get; set; }
    public string Status { get; set; } = "ASSIGNED";
    public decimal ProgressPercentage { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateOnly? DueDate { get; set; }

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
}

public class LessonProgress : AuditableEntity
{
    public Guid EnrollmentId { get; set; }
    public Enrollment Enrollment { get; set; } = null!;
    public Guid LessonId { get; set; }
    public string Status { get; set; } = "NOT_STARTED";
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
