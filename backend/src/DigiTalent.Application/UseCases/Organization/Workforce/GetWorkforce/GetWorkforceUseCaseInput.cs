using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

/// <summary>
/// Filters of the workforce list (frontend WorkforceListParams). Search matches the name or the employee code.
/// </summary>
public class GetWorkforceUseCaseInput : PaginationRequest
{
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }

    /// <summary>Employee status; empty = ACTIVE and INACTIVE.</summary>
    public string? Status { get; set; }

    /// <summary>HIGH (has HIGH gaps) / ANY (has gaps) / NONE (snapshot without gap) / UNKNOWN (no snapshot).</summary>
    public string? Gap { get; set; }

    /// <summary>OVERDUE (overdue courses) / ACTIVE (courses not completed) / NONE (no course in progress).</summary>
    public string? Learning { get; set; }
}
