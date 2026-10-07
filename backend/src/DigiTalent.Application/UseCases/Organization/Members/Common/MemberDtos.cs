namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Values of <see cref="MemberListItem.Kind"/>: a person with an account / employee profile, or an invitation
/// that has not been activated yet.
/// </summary>
public static class MemberKinds
{
    public const string Member = "member";
    public const string Invitation = "invitation";
}

/// <summary>
/// Values of <see cref="MemberListItem.Status"/> (frontend MemberStatus). Derived from users.status,
/// employees.status and member_invitations.status; not a database column.
/// </summary>
public static class MemberStatuses
{
    public const string Active = "ACTIVE";
    public const string Inactive = "INACTIVE";
    public const string Pending = "PENDING";
}

/// <summary>
/// One row of the member list (frontend services/member.service.ts MemberListItem).
/// Id = user id for people with an account, employee id for profiles without an account, invitation id for
/// pending invitations — every member endpoint accepts that id.
/// </summary>
public class MemberListItem
{
    public Guid Id { get; set; }
    public string Kind { get; set; } = MemberKinds.Member;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    /// <summary>Enterprise roles (OWNER / MANAGER / EMPLOYEE), see <see cref="MemberRoles"/>.</summary>
    public List<string> Roles { get; set; } = new();

    public string Status { get; set; } = MemberStatuses.Active;
    public Guid? EmployeeId { get; set; }
    public string? EmployeeCode { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? PositionName { get; set; }
    public string? JobGrade { get; set; }
    public string? JobGradeName { get; set; }

    /// <summary>Coverage of the position requirements in the latest skill gap run; null = not assessed yet.</summary>
    public decimal? CoveragePercent { get; set; }

    /// <summary>HIGH severity gaps in the latest skill gap run; null for invitations.</summary>
    public int? HighGapCount { get; set; }

    /// <summary>Enrollments in progress (IN_PROGRESS / READY_FOR_ASSESSMENT); null for invitations.</summary>
    public int? ActiveCourses { get; set; }

    public DateTimeOffset? JoinedAt { get; set; }
    public DateTimeOffset? InvitedAt { get; set; }
    public DateTimeOffset? LastActiveAt { get; set; }
    public string? DeactivatedReason { get; set; }

    // Internal keys used by the use cases; not serialized.
    [System.Text.Json.Serialization.JsonIgnore]
    public Guid? UserId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public List<string> RoleCodes { get; set; } = new();

    /// <summary>Copies every field into a derived output type (detail, update and status-change results).</summary>
    public T CopyTo<T>() where T : MemberListItem, new() => new()
    {
        Id = Id,
        Kind = Kind,
        FullName = FullName,
        Email = Email,
        Roles = Roles,
        Status = Status,
        EmployeeId = EmployeeId,
        EmployeeCode = EmployeeCode,
        DepartmentId = DepartmentId,
        DepartmentName = DepartmentName,
        JobPositionId = JobPositionId,
        PositionName = PositionName,
        JobGrade = JobGrade,
        JobGradeName = JobGradeName,
        CoveragePercent = CoveragePercent,
        HighGapCount = HighGapCount,
        ActiveCourses = ActiveCourses,
        JoinedAt = JoinedAt,
        InvitedAt = InvitedAt,
        LastActiveAt = LastActiveAt,
        DeactivatedReason = DeactivatedReason,
        UserId = UserId,
        RoleCodes = RoleCodes,
    };
}
