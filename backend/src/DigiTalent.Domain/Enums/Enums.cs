namespace DigiTalent.Domain.Enums;

public enum UserStatus
{
    Pending,
    Active,
    Locked,
    Disabled
}

public enum EmployeeStatus
{
    Active,
    Inactive,
    Transferred,
    Archived
}

public enum PublishStatus
{
    Draft,
    ReviewPending,
    Published,
    Archived
}

public enum EnrollmentStatus
{
    Assigned,
    InProgress,
    Completed,
    Failed,
    Cancelled,
    Expired
}

public enum QuestionType
{
    SingleChoice,
    MultipleChoice,
    TrueFalse,
    ShortText,
    Scenario
}

public enum CertificateStatus
{
    Valid,
    Expired,
    Revoked
}

public enum TaskAssignmentStatus
{
    Assigned,
    InProgress,
    Submitted,
    Reviewed,
    Rejected,
    Overdue,
    Cancelled
}

public enum EvidenceType
{
    Assessment,
    Certificate,
    Task,
    ManagerReview,
    Manual
}

public enum EvidenceStatus
{
    Pending,
    Verified,
    Rejected,
    Superseded
}

public enum RiskLevel
{
    Low,
    Medium,
    High,
    Critical
}

public enum ReadinessLevel
{
    NotReady,
    Developing,
    Ready,
    Strong
}

public enum RecommendationStatus
{
    New,
    Accepted,
    Dismissed,
    Assigned,
    Completed
}

public enum FileAccessLevel
{
    Private,
    Internal,
    PublicVerify
}

public enum AssessmentType
{
    Pre,
    Quiz,
    Final,
    Post
}
