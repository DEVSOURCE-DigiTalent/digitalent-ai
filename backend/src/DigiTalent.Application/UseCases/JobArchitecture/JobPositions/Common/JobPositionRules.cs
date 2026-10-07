using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

/// <summary>
/// Rules shared by the create / update job position use cases.
/// </summary>
public static class JobPositionRules
{
    /// <summary>The owning department (optional) must exist in the organization and not be archived.</summary>
    public static async Task EnsureValidDepartmentAsync(IApplicationDbContext context, Guid organizationId, Guid? departmentId)
    {
        if (!departmentId.HasValue)
        {
            return;
        }

        var exists = await context.Departments.AnyAsync(d =>
            d.Id == departmentId.Value && d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived);
        if (!exists)
        {
            throw new BadRequestException("Department does not exist or is archived.", "departmentId", "INVALID_DEPARTMENT");
        }
    }

    /// <summary>Grade code as stored: upper-case, null when empty.</summary>
    public static string? NormalizeGrade(string? jobGrade) =>
        string.IsNullOrWhiteSpace(jobGrade) ? null : jobGrade.Trim().ToUpperInvariant();
}
