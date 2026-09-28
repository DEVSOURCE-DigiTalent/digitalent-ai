namespace DigiTalent.Domain.Constants;

/// <summary>
/// Giá trị cột status (lưu varchar). PHẢI khớp CHECK constraint trong
/// docs/database/DigiTalent_AI_Canonical_v2_3.sql — sửa SQL trước rồi mới sửa ở đây.
/// </summary>
public static class Statuses
{
    /// <summary>users.status</summary>
    public static class User
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Locked = "LOCKED";
    }

    /// <summary>employees.status</summary>
    public static class Employee
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Transferred = "TRANSFERRED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>
    /// Dữ liệu danh mục: departments, job_families, job_positions.
    /// ARCHIVED thay cho xóa cứng (không xóa dòng đã được tham chiếu).
    /// </summary>
    public static class MasterData
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>organizations.status, roles.status</summary>
    public static class Simple
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
    }

    /// <summary>competencies.status</summary>
    public static class Competency
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>competencies.competency_type</summary>
    public static class CompetencyType
    {
        public const string CoreDigital = "CORE_DIGITAL";
        public const string Professional = "PROFESSIONAL";
        public const string Internal = "INTERNAL";
        public const string Behavioural = "BEHAVIOURAL";
    }

    /// <summary>position_requirement_sets.status</summary>
    public static class PositionRequirementSet
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>courses.status</summary>
    public static class Course
    {
        public const string Draft = "DRAFT";
        public const string Review = "REVIEW";
        public const string Published = "PUBLISHED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>course_competencies.coverage_type</summary>
    public static class CourseCoverageType
    {
        public const string Primary = "PRIMARY";
        public const string Secondary = "SECONDARY";
        public const string Supporting = "SUPPORTING";
    }

    /// <summary>enrollments.status</summary>
    public static class Enrollment
    {
        public const string NotStarted = "NOT_STARTED";
        public const string InProgress = "IN_PROGRESS";
        public const string ReadyForAssessment = "READY_FOR_ASSESSMENT";
        public const string Completed = "COMPLETED";
        public const string Cancelled = "CANCELLED";
    }

    /// <summary>competency_evidences.source_type</summary>
    public static class EvidenceSourceType
    {
        public const string PracticalTask = "PRACTICAL_TASK";
        public const string ManualOverride = "MANUAL_OVERRIDE";
        public const string Migration = "MIGRATION";
    }

    /// <summary>competency_evidences.status</summary>
    public static class EvidenceStatus
    {
        public const string Pending = "PENDING";
        public const string Confirmed = "CONFIRMED";
        public const string Rejected = "REJECTED";
        public const string Superseded = "SUPERSEDED";
    }

    /// <summary>skill_gap_items.severity (NULL = đã đạt yêu cầu)</summary>
    public static class SkillGapSeverity
    {
        public const string High = "HIGH";
        public const string Medium = "MEDIUM";
        public const string Low = "LOW";
    }

    /// <summary>skill_gap_runs.generated_by</summary>
    public static class SkillGapGeneratedBy
    {
        public const string System = "SYSTEM";
        public const string UserRequest = "USER_REQUEST";
    }

    /// <summary>scoring_configs.config_type</summary>
    public static class ScoringConfigType
    {
        public const string RecommendationWeights = "RECOMMENDATION_WEIGHTS";
        public const string TrainingRisk = "TRAINING_RISK";
        public const string Readiness = "READINESS";
    }
}
