namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Result of a batch invitation (frontend types/commerce.ts InviteResult).
/// </summary>
public class InviteMembersUseCaseOutput
{
    public List<InvitationSummary> Created { get; set; } = new();
    public List<RejectedInvitation> Rejected { get; set; } = new();
}

/// <summary>
/// An invitation that was created and sent.
/// </summary>
public class InvitationSummary
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public string Status { get; set; } = "pending";
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>Raw activation token — Development only (no e-mail provider yet), null elsewhere.</summary>
    public string? Token { get; set; }

    /// <summary>Full activation link — Development only, null elsewhere.</summary>
    public string? DebugLink { get; set; }
}

/// <summary>
/// A row that was not invited, with the reason shown to the Owner (Vietnamese UI text).
/// </summary>
public class RejectedInvitation
{
    public string Email { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
