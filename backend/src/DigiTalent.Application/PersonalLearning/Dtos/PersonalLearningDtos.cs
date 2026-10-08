using System.Text.Json.Serialization;

namespace DigiTalent.Application.PersonalLearning.Dtos;

public record DomainRequirementSummaryDto(
    int DomainNumber,
    string DomainName,
    int RequiredCompetencies,
    int MaxLevel
);

public record PersonalTargetDto(
    string Code,
    string Name,
    string Description,
    int RequiredCount,
    IReadOnlyList<DomainRequirementSummaryDto> Domains,
    DateTimeOffset? SelectedAt = null
);

public record PersonalDomainLevelDto(
    int Number,
    string Name,
    int Required,
    int Current,
    int GapCount
);

public record PersonalCompetencyGapDto(
    string Code,
    string Name,
    int DomainNumber,
    string DomainName,
    int RequiredLevel,
    int CurrentLevel,
    int GapSteps,
    bool Mandatory,
    string? Severity, // "HIGH", "MEDIUM", "LOW"
    string? Source
);

public record PersonalSkillGapDto(
    PersonalTargetDto? Target,
    bool Assessed,
    int CoveragePercent,
    int TotalRequired,
    int TotalMet,
    int HighCount,
    int MediumCount,
    int LowCount,
    IReadOnlyList<PersonalDomainLevelDto> Domains,
    IReadOnlyList<PersonalCompetencyGapDto> Items
);

public record PathCourseDto(
    string Id,
    string Code,
    string Title,
    int DomainNumber,
    string DomainName,
    int Level,
    int DurationMinutes,
    int LessonCount,
    int CompletedLessons,
    int ProgressPercent,
    string Status, // "COMPLETED", "IN_PROGRESS", "AVAILABLE", "LOCKED"
    string? PrerequisiteTitle,
    IReadOnlyList<string> Closes,
    bool PlanLocked,
    bool TrialSlot
);

public record PathStageDto(
    int Level,
    string Title,
    IReadOnlyList<PathCourseDto> Courses
);

public record ExemptCourseDto(
    string Id,
    string Code,
    string Title,
    int Level
);

public record PersonalPathDto(
    PersonalTargetDto? Target,
    bool Assessed,
    IReadOnlyList<PathStageDto> Stages,
    IReadOnlyList<ExemptCourseDto> Exempt,
    int TotalCourses,
    int CompletedCourses,
    int MinutesLeft,
    int ProgressPercent,
    PathCourseDto? NextCourse
);

public record DiagnosticQuestionDto(
    string Id,
    int DomainNumber,
    string DomainName,
    string CompetencyCode,
    int Level,
    string Text,
    IReadOnlyList<string> Options
);

public record DiagnosticReviewDto(
    string QuestionId,
    int? ChosenIndex,
    int CorrectIndex,
    string Explanation
);

public record DiagnosticDomainResultDto(
    int Number,
    string Name,
    int Level,
    int Correct,
    int Total
);

public record DiagnosticResultDto(
    DateTimeOffset CompletedAt,
    int Correct,
    int Total,
    int ScorePercent,
    IReadOnlyList<DiagnosticDomainResultDto> Domains,
    IReadOnlyList<DiagnosticReviewDto> Review
);

public record TryOrientationDto(
    int Correct,
    int Total
);

public record PersonalDiagnosticDto(
    PersonalTargetDto? Target,
    IReadOnlyList<DiagnosticQuestionDto> Questions,
    DiagnosticResultDto? Result,
    TryOrientationDto? TryOrientation
);

public record PersonalLessonDto(
    string Id,
    string Title,
    string Kind, // "VIDEO", "READING", "PRACTICE"
    int DurationMinutes,
    bool Completed,
    string Summary,
    IReadOnlyList<string> Body,
    IReadOnlyList<string> Takeaways,
    string? Practice
);

public record PersonalModuleDto(
    string Id,
    string CompetencyCode,
    string Title,
    IReadOnlyList<PersonalLessonDto> Lessons
);

public record TaskSubmissionDto(
    string LinkUrl,
    string Content,
    DateTimeOffset SubmittedAt,
    int? Score = null,
    string? Feedback = null,
    DateTimeOffset? ReviewedAt = null
);

public record PersonalTaskDto(
    string Id,
    string CourseId,
    string CourseCode,
    string CourseTitle,
    string DomainName,
    int Level,
    string Title,
    string Brief,
    string Deliverable,
    IReadOnlyList<string> Rubric,
    IReadOnlyList<string> CompetencyCodes,
    string Status, // "LOCKED", "OPEN", "PENDING_REVIEW", "REVISION_REQUESTED", "APPROVED"
    TaskSubmissionDto? Submission
);

public record CourseAssessmentSummaryDto(
    int QuestionCount,
    int PassPercent,
    int Attempts,
    int? BestScore,
    bool Passed
);

public record PrerequisiteRefDto(
    string Id,
    string Title,
    bool Satisfied
);

public record CourseCompetencyRefDto(
    string Code,
    string Name,
    int CurrentLevel,
    int RequiredLevel
);

public record PersonalCourseDetailDto(
    string Id,
    string Code,
    string Title,
    int DomainNumber,
    string DomainName,
    int Level,
    int EntryLevel,
    int DurationMinutes,
    string Description,
    IReadOnlyList<string> Outcomes,
    PrerequisiteRefDto? Prerequisite,
    string Status,
    bool InPath,
    bool Exempt,
    bool PlanLocked,
    bool TrialSlot,
    IReadOnlyList<PersonalModuleDto> Modules,
    int LessonCount,
    int CompletedLessons,
    int ProgressPercent,
    IReadOnlyList<CourseCompetencyRefDto> Competencies,
    CourseAssessmentSummaryDto Assessment,
    string Notes,
    PersonalTaskDto? Task
);

public record AssessmentQuestionDto(
    string Id,
    string CompetencyCode,
    string Text,
    IReadOnlyList<string> Options
);

public record CourseAssessmentDto(
    string CourseId,
    string CourseTitle,
    int PassPercent,
    bool Ready,
    IReadOnlyList<AssessmentQuestionDto> Questions
);

public record AssessmentOutcomeDto(
    int ScorePercent,
    int Correct,
    int Total,
    bool Passed,
    IReadOnlyList<DiagnosticReviewDto> Review,
    string? CertificateId,
    bool CertificatePending
);

public record CompetencyRefDto(
    string Code,
    string Name
);

public record PersonalCertificateDto(
    string Id,
    string Status, // "ISSUED", "PENDING_UPGRADE"
    string? Code,
    string CourseId,
    string CourseCode,
    string CourseTitle,
    int Level,
    string DomainName,
    IReadOnlyList<CompetencyRefDto> Competencies,
    string RecipientName,
    DateTimeOffset PassedAt,
    DateTimeOffset? IssuedAt,
    int ScorePercent
);

public record TrialChecklistItemDto(
    string Key,
    string Label,
    string Detail,
    bool Done,
    string? Path
);

public record PersonalAccessDto(
    string Mode, // "full", "trial", "free"
    string PlanName,
    DateTimeOffset? TrialEndsAt,
    int? DaysLeft,
    int? CourseLimit,
    IReadOnlyList<string> TrialCourseIds,
    int? CoursesLeft,
    bool DiagnosticAvailable,
    DateTimeOffset? ReassessAvailableAt,
    int? TargetChangesLeft,
    int PendingCertificates,
    IReadOnlyList<TrialChecklistItemDto> Checklist,
    IReadOnlyDictionary<string, string> Seen
);

public record PersonalActivityDto(
    string Id,
    DateTimeOffset At,
    string Kind, // "TARGET", "DIAGNOSTIC", "LESSON", "ASSESSMENT", "TASK", "CERTIFICATE"
    string Title,
    string? Detail = null
);

public record ContinueLessonDto(
    string CourseId,
    string CourseTitle,
    string LessonId,
    string LessonTitle,
    int ProgressPercent
);

public record OverviewPathSummaryDto(
    int ProgressPercent,
    int CompletedCourses,
    int TotalCourses,
    int MinutesLeft
);

public record PersonalOverviewDto(
    string FullName,
    PersonalTargetDto? Target,
    bool Assessed,
    int CoveragePercent,
    int GapCount,
    IReadOnlyList<PersonalDomainLevelDto> Domains,
    OverviewPathSummaryDto Path,
    PathCourseDto? NextCourse,
    ContinueLessonDto? ContinueLesson,
    int LearnedMinutes,
    int CertificateCount,
    int OpenTaskCount,
    IReadOnlyList<PersonalActivityDto> Activity
);

public record ProfileCompetencyDto(
    string Code,
    string Name,
    int Level,
    int RequiredLevel,
    string? Source,
    DateTimeOffset? At
);

public record ProfileDomainDto(
    int Number,
    string Name,
    IReadOnlyList<ProfileCompetencyDto> Items
);

public record PersonalMilestoneDto(
    string Id,
    string Title,
    string Description,
    DateTimeOffset? AchievedAt
);

public record PersonalProgressDto(
    int LearnedMinutes,
    int LessonsCompleted,
    int AssessmentsPassed,
    int TasksApproved,
    int CoveragePercent,
    IReadOnlyList<ProfileDomainDto> Profile,
    IReadOnlyList<PersonalMilestoneDto> Milestones,
    IReadOnlyList<PersonalActivityDto> Activity
);

// Request DTOs
public record SetPersonalTargetRequest(string PositionCode);
public record SubmitDiagnosticRequest(Dictionary<string, int> Answers);
public record UpdateLessonProgressRequest(bool Completed = true);
public record SaveCourseNotesRequest(string Notes);
public record CourseNotesDto(string Notes);
public record SubmitCourseAssessmentRequest(Dictionary<string, int> Answers);
public record SubmitTaskRequest(string LinkUrl, string Content);
