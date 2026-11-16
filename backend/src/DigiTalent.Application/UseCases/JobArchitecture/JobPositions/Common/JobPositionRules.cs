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
    /// <summary>The owning department must exist in the organization and not be archived.</summary>
    public static async Task EnsureValidDepartmentAsync(IApplicationDbContext context, Guid organizationId, Guid? departmentId)
    {
        if (!departmentId.HasValue)
        {
            throw new BadRequestException("Vui lòng chọn phòng ban cho vị trí công việc.", "departmentId", "DEPARTMENT_REQUIRED");
        }

        var exists = await context.Departments.AnyAsync(d =>
            d.Id == departmentId.Value && d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived);
        if (!exists)
        {
            throw new BadRequestException("Department does not exist or is archived.", "departmentId", "INVALID_DEPARTMENT");
        }
    }

    public static async Task EnsureDepartmentSlotAsync(IApplicationDbContext context, Guid organizationId, Guid? departmentId, Guid? positionId = null)
    {
        await EnsureValidDepartmentAsync(context, organizationId, departmentId);
        if (await context.JobPositions.AnyAsync(p => p.OrganizationId == organizationId
            && p.DepartmentId == departmentId && p.Id != positionId && p.Status != Statuses.MasterData.Archived))
            throw new ConflictException("Phòng ban đã có một vị trí công việc. Hãy chỉnh sửa vị trí hiện tại.");
    }

    public static async Task EnsureNameAvailableAsync(IApplicationDbContext context, Guid organizationId, string name, Guid? positionId = null)
    {
        var normalizedName = name.Trim().ToUpperInvariant();
        if (await context.JobPositions.AnyAsync(p => p.OrganizationId == organizationId
            && p.Id != positionId && p.DepartmentId != null && p.Status != Statuses.MasterData.Archived
            && p.Name.Trim().ToUpper() == normalizedName))
            throw new ConflictException("Tên vị trí công việc đã được sử dụng ở một phòng ban trong doanh nghiệp.");
    }

    /// <summary>Grade code as stored: upper-case, null when empty.</summary>
    public static string? NormalizeGrade(string? jobGrade) =>
        string.IsNullOrWhiteSpace(jobGrade) ? null : jobGrade.Trim().ToUpperInvariant();
}
