using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Invitation to join an organization (table member_invitations, OW-02). The account, employee profile and role
/// are created only when the invitee activates it. Only the SHA-256 hash of the activation token is stored.
/// </summary>
public class MemberInvitation : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string Email { get; set; } = string.Empty; // always lower-case
    public string FullName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; } // optional; generated on activation when empty
    public Guid RoleId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public string Status { get; set; } = Statuses.MemberInvitation.Pending;
    public Guid? InvitedByUserId { get; set; }
    public DateTimeOffset InvitedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public Guid? AcceptedUserId { get; set; }
    public DateTimeOffset? AcceptedAt { get; set; }

    /// <summary>Pending and not past its expiry date at <paramref name="now"/>.</summary>
    public bool IsOpenAt(DateTimeOffset now) => Status == Statuses.MemberInvitation.Pending && ExpiresAt > now;
}
