namespace DigiTalent.Application.Learning.DTOs;

// ═══════════════════════════════════════════════
// Courses
// ═══════════════════════════════════════════════

public class CreateCourseRequest
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DifficultyLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public Guid? OwnerTrainerId { get; set; }
    public decimal? PassingScore { get; set; }
}

public class UpdateCourseRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? DifficultyLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public Guid? OwnerTrainerId { get; set; }
    public decimal? PassingScore { get; set; }
}

public class CourseResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DifficultyLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ModuleCount { get; set; }
    public int EnrollmentCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CourseDetailResponse : CourseResponse
{
    public Guid? OwnerTrainerId { get; set; }
    public decimal? PassingScore { get; set; }
    public List<ModuleResponse> Modules { get; set; } = new();
    public List<CourseCompetencyResponse> Competencies { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Modules
// ═══════════════════════════════════════════════

public class CreateModuleRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}

public class UpdateModuleRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}

public class ModuleResponse
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public int LessonCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class ModuleDetailResponse : ModuleResponse
{
    public List<LessonResponse> Lessons { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Lessons
// ═══════════════════════════════════════════════

public class CreateLessonRequest
{
    public string Title { get; set; } = string.Empty;
    public string ContentType { get; set; } = "TEXT";
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; } = true;
}

public class UpdateLessonRequest
{
    public string? Title { get; set; }
    public string? ContentType { get; set; }
    public string? ContentBody { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int? SortOrder { get; set; }
    public bool? IsRequired { get; set; }
    public string? Status { get; set; }
}

public class LessonResponse
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public int? EstimatedMinutes { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class LessonDetailResponse : LessonResponse
{
    public string? ContentBody { get; set; }
}

// ═══════════════════════════════════════════════
// Learning Materials
// ═══════════════════════════════════════════════

public class CreateMaterialRequest
{
    public Guid? LessonId { get; set; }
    public Guid? FileObjectId { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public string? ExternalUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class MaterialResponse
{
    public Guid Id { get; set; }
    public Guid? CourseId { get; set; }
    public Guid? LessonId { get; set; }
    public Guid? FileObjectId { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public string? ExternalUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Course Competency Mapping
// ═══════════════════════════════════════════════

public class SaveCourseCompetencyRequest
{
    public Guid CompetencyId { get; set; }
    public int? TargetLevelValue { get; set; }
    public decimal CoverageWeight { get; set; }
    public string? Notes { get; set; }
}

public class SaveCourseCompetenciesRequest
{
    public List<SaveCourseCompetencyRequest> Competencies { get; set; } = new();
}

public class CourseCompetencyResponse
{
    public Guid CourseId { get; set; }
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public int? TargetLevelValue { get; set; }
    public decimal CoverageWeight { get; set; }
    public string? Notes { get; set; }
}

// ═══════════════════════════════════════════════
// Course Assignments
// ═══════════════════════════════════════════════

public class CreateAssignmentRequest
{
    public Guid CourseId { get; set; }
    public string AssignmentType { get; set; } = "EMPLOYEE";
    public Guid? TargetEmployeeId { get; set; }
    public Guid? TargetDepartmentId { get; set; }
    public Guid? TargetJobPositionId { get; set; }
    public DateOnly? DueDate { get; set; }
}

public class AssignmentResponse
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string AssignmentType { get; set; } = string.Empty;
    public Guid? TargetEmployeeId { get; set; }
    public Guid? TargetDepartmentId { get; set; }
    public Guid? TargetJobPositionId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Enrollments
// ═══════════════════════════════════════════════

public class StartEnrollmentRequest
{
    public Guid CourseId { get; set; }
    public Guid? CourseAssignmentId { get; set; }
}

public class EnrollmentResponse
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercentage { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class EnrollmentDetailResponse : EnrollmentResponse
{
    public List<LessonProgressResponse> LessonProgresses { get; set; } = new();
}

// ═══════════════════════════════════════════════
// Lesson Progress
// ═══════════════════════════════════════════════

public class UpdateLessonProgressRequest
{
    public string Status { get; set; } = "COMPLETED";
    public decimal? ProgressPercent { get; set; }
}

public class LessonProgressResponse
{
    public Guid Id { get; set; }
    public Guid EnrollmentId { get; set; }
    public Guid LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal ProgressPercent { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}

// ═══════════════════════════════════════════════
// Publish / Action DTOs
// ═══════════════════════════════════════════════

public class PublishCourseRequest
{
    public string? Message { get; set; }
}

public class LessonCompletionRequest
{
    public decimal? ProgressPercent { get; set; }
}
