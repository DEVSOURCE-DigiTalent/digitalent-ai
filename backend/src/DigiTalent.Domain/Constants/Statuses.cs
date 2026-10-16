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

    /// <summary>organizations.status — SUSPENDED is set by Platform Admin and blocks sign-in for the members.</summary>
    public static class Organization
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Suspended = "SUSPENDED";
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

    /// <summary>platform_courses.sales_status, platform_catalog_courses.sales_status</summary>
    public static class PlatformCourseSales
    {
        public const string Open = "OPEN";
        public const string Paused = "PAUSED";

        public static bool IsValid(string? value) => value is Open or Paused;
    }

    /// <summary>platform_frameworks.status</summary>
    public static class PlatformFramework
    {
        public const string Draft = "DRAFT";
        public const string Published = "PUBLISHED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>platform_framework_domains.status — "xóa lĩnh vực" archives it (only while it has no course).</summary>
    public static class PlatformFrameworkDomain
    {
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>platform_catalog_versions.status — one DRAFT and one CURRENT at most.</summary>
    public static class PlatformCatalogVersion
    {
        public const string Draft = "DRAFT";
        public const string Current = "CURRENT";
        public const string Retired = "RETIRED";
    }

    /// <summary>file_objects.access_level</summary>
    public static class FileAccessLevel
    {
        public const string Private = "PRIVATE";
        public const string Internal = "INTERNAL";
        public const string PublicVerify = "PUBLIC_VERIFY";
    }

    /// <summary>course_final_submissions.decision</summary>
    public static class FinalSubmissionDecision
    {
        public const string Passed = "PASSED";
        public const string NotYet = "NOT_YET";
    }

    /// <summary>course_final_submissions.support_action</summary>
    public static class FinalSupportAction
    {
        public const string Coaching = "COACHING";
        public const string FreshCycle = "FRESH_CYCLE";
        public const string Pause = "PAUSE";
    }

    /// <summary>proctoring_sessions.kind — loại bài làm có giám sát.</summary>
    public static class ProctoringKind
    {
        public const string PreAssessment = "PRE_ASSESSMENT";
        public const string Final = "FINAL";

        public static readonly string[] All = { PreAssessment, Final };
    }

    /// <summary>proctoring_sessions.status</summary>
    public static class ProctoringSession
    {
        public const string Recording = "RECORDING";
        public const string Submitted = "SUBMITTED";
        public const string Abandoned = "ABANDONED";
    }

    /// <summary>proctoring_recordings.track — SCREEN: toàn bộ màn hình; CAMERA: camera kèm âm thanh micro.</summary>
    public static class ProctoringTrack
    {
        public const string Screen = "SCREEN";
        public const string Camera = "CAMERA";

        public static readonly string[] All = { Screen, Camera };
    }

    /// <summary>proctoring_events.kind</summary>
    public static class ProctoringEvent
    {
        public const string Started = "STARTED";
        public const string TabHidden = "TAB_HIDDEN";
        public const string FocusLost = "FOCUS_LOST";
        public const string ShareStopped = "SHARE_STOPPED";
        public const string ShareResumed = "SHARE_RESUMED";
        public const string CameraStopped = "CAMERA_STOPPED";
        public const string CameraResumed = "CAMERA_RESUMED";
        public const string MicStopped = "MIC_STOPPED";
        public const string MicResumed = "MIC_RESUMED";
        public const string Submitted = "SUBMITTED";

        public static readonly string[] All =
        {
            Started, TabHidden, FocusLost, ShareStopped, ShareResumed, CameraStopped, CameraResumed, MicStopped, MicResumed, Submitted,
        };

        /// <summary>Sự kiện người chấm cần xem (rời bài làm hoặc mất một nguồn ghi).</summary>
        public static readonly string[] Flagged = { TabHidden, FocusLost, ShareStopped, CameraStopped, MicStopped };
    }
}
