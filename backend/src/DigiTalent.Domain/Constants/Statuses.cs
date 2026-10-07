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

    /// <summary>subscriptions.status</summary>
    public static class Subscription
    {
        public const string Active = "ACTIVE";
        public const string Expired = "EXPIRED";
        public const string PaymentRequired = "PAYMENT_REQUIRED";
        public const string Cancelled = "CANCELLED";
    }

    /// <summary>training_batches.status</summary>
    public static class TrainingBatch
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Completed = "COMPLETED";
        public const string Cancelled = "CANCELLED";
    }

    /// <summary>task_submissions.status</summary>
    public static class TaskSubmission
    {
        public const string Submitted = "SUBMITTED";
        public const string UnderReview = "UNDER_REVIEW";
        public const string Superseded = "SUPERSEDED";
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

    /// <summary>member_invitations.status</summary>
    public static class MemberInvitation
    {
        public const string Pending = "PENDING";
        public const string Accepted = "ACCEPTED";
        public const string Revoked = "REVOKED";
    }

    /// <summary>scoring_configs.config_type</summary>
    public static class ScoringConfigType
    {
        public const string RecommendationWeights = "RECOMMENDATION_WEIGHTS";
        public const string TrainingRisk = "TRAINING_RISK";
        public const string Readiness = "READINESS";
    }

    /// <summary>course_modules.status, lessons.status</summary>
    public static class CourseContent
    {
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>lessons.completion_rule</summary>
    public static class LessonCompletionRule
    {
        public const string View = "VIEW";
        public const string ManualComplete = "MANUAL_COMPLETE";
        public const string PassCheck = "PASS_CHECK";
        public const string SubmitActivity = "SUBMIT_ACTIVITY";
    }

    /// <summary>lesson_progress.status</summary>
    public static class LessonProgress
    {
        public const string NotStarted = "NOT_STARTED";
        public const string InProgress = "IN_PROGRESS";
        public const string Completed = "COMPLETED";
    }

    /// <summary>learning_materials.material_type</summary>
    public static class LearningMaterialType
    {
        public const string File = "FILE";
        public const string Link = "LINK";
    }

    /// <summary>course_assignments.status</summary>
    public static class CourseAssignment
    {
        public const string Active = "ACTIVE";
        public const string Cancelled = "CANCELLED";
    }

    /// <summary>course_assignments.assignment_source</summary>
    public static class CourseAssignmentSource
    {
        public const string Manual = "MANUAL";
        public const string SkillGap = "SKILL_GAP";
        public const string Department = "DEPARTMENT";
        public const string Position = "POSITION";
    }

    /// <summary>question_banks.status</summary>
    public static class QuestionBank
    {
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>questions.status</summary>
    public static class Question
    {
        public const string Draft = "DRAFT";
        public const string Approved = "APPROVED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>questions.question_type</summary>
    public static class QuestionType
    {
        public const string MultipleChoice = "MULTIPLE_CHOICE";
        public const string TrueFalse = "TRUE_FALSE";
    }

    /// <summary>assessments.status</summary>
    public static class Assessment
    {
        public const string Draft = "DRAFT";
        public const string Published = "PUBLISHED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>assessments.assessment_type</summary>
    public static class AssessmentType
    {
        public const string Practice = "PRACTICE";
        public const string Quiz = "QUIZ";
        public const string Final = "FINAL";
    }

    /// <summary>assessment_attempts.status</summary>
    public static class AssessmentAttempt
    {
        public const string Started = "STARTED";
        public const string Submitted = "SUBMITTED";
        public const string Scored = "SCORED";
    }

    /// <summary>certificate_templates.status</summary>
    public static class CertificateTemplate
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>certificates.status</summary>
    public static class Certificate
    {
        public const string Valid = "VALID";
        public const string Expired = "EXPIRED";
        public const string Revoked = "REVOKED";
    }

    /// <summary>practical_task_templates.status</summary>
    public static class TaskTemplate
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>task_assignments.status</summary>
    public static class TaskAssignment
    {
        public const string Assigned = "ASSIGNED";
        public const string Submitted = "SUBMITTED";
        public const string NeedsRevision = "NEEDS_REVISION";
        public const string Passed = "PASSED";
        public const string Failed = "FAILED";
        public const string Cancelled = "CANCELLED";
    }

    /// <summary>task_evaluations.verdict, competency_evaluation_results.verdict</summary>
    public static class TaskVerdict
    {
        public const string Passed = "PASSED";
        public const string NeedsRevision = "NEEDS_REVISION";
        public const string Failed = "FAILED";
    }

    /// <summary>file_objects.access_level</summary>
    public static class FileAccessLevel
    {
        public const string Private = "PRIVATE";
        public const string Internal = "INTERNAL";
        public const string PublicVerify = "PUBLIC_VERIFY";
    }
}
