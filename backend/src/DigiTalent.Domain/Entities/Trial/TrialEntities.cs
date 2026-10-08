using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public sealed class TrialRegistration : BaseEntity
{
    public string Email { get; set; } = "";
    public string OrganizationName { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Industry { get; set; } = "";
    public string Size { get; set; } = "";
    public string Goal { get; set; } = "";
    public string TokenHash { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid? OrganizationId { get; set; }
    public int Revision { get; set; }
}

public sealed class TrialWorkspace : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid OwnerUserId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? PositionId { get; set; }
    public string Industry { get; set; } = "";
    public string Size { get; set; } = "";
    public string Goal { get; set; } = "";
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public string PolicyJson { get; set; } = "";
    public string? BundleJson { get; set; }
    public DateTimeOffset? ResultsViewedAt { get; set; }
    public DateTimeOffset? ConversionRequestedAt { get; set; }
    public DateTimeOffset? ConvertedAt { get; set; }
    public string? ConversionReference { get; set; }
    public long Revision { get; set; }
}

public sealed class TrialInvitation : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid PositionId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "Employee";
    public string TokenHash { get; set; } = "";
    public DateTimeOffset SentAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }
    public Guid? EmployeeId { get; set; }
    public bool SendFailed { get; set; }
    public int SendCount { get; set; }
}

public sealed class PositionDiagnosticAttempt : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid PositionId { get; set; }
    public string BundleJson { get; set; } = "";
    public string AnswersJson { get; set; } = "[]";
    public int AnswerRevision { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public string? ResultJson { get; set; }
    public string? PathJson { get; set; }
    public DateTimeOffset? PathViewedAt { get; set; }
}
