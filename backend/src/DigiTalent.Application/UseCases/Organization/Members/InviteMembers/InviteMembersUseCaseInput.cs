namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Batch of people to invite (OW-02 "Mời thành viên", typed one by one or imported from CSV).
/// </summary>
public class InviteMembersUseCaseInput
{
    public List<InviteMemberRow> Rows { get; set; } = new();
}

/// <summary>
/// One invitee. Invalid rows are rejected individually (see <see cref="InviteMembersUseCaseOutput.Rejected"/>)
/// instead of failing the whole batch.
/// </summary>
public class InviteMemberRow
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = MemberRoles.Employee; // OWNER | MANAGER | EMPLOYEE
    public string? EmployeeCode { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
}
