using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Filters of the member list (OW-02). Search matches name, e-mail or employee code.
/// </summary>
public class GetPagedMembersUseCaseInput : PaginationRequest
{
    public string? Status { get; set; }        // ACTIVE | INACTIVE | PENDING; null = all
    public string? Role { get; set; }          // OWNER | MANAGER | EMPLOYEE (system role codes also accepted)
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public string? JobGrade { get; set; }      // G1 | G2 | G3

    /// <summary>true = only active people with an employee profile and no position (they have no required level yet).</summary>
    public bool NoPosition { get; set; }
}
