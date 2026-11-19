using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

/// <summary>
/// Rules shared by the create / update job position use cases. Positions are the organization's 5 standard ones, shared by
/// every department (see <see cref="StandardPositions"/>): nothing ties a position to one department any more.
/// </summary>
public static class JobPositionRules
{
    public static async Task EnsureNameAvailableAsync(IApplicationDbContext context, Guid organizationId, string name, Guid? positionId = null)
    {
        var normalizedName = name.Trim().ToUpperInvariant();
        if (await context.JobPositions.AnyAsync(p => p.OrganizationId == organizationId
            && p.Id != positionId && p.Status != Statuses.MasterData.Archived
            && p.Name.Trim().ToUpper() == normalizedName))
            throw new ConflictException("Tên vị trí công việc đã được sử dụng trong doanh nghiệp.");
    }

    /// <summary>Grade code as stored: upper-case, null when empty.</summary>
    public static string? NormalizeGrade(string? jobGrade) =>
        string.IsNullOrWhiteSpace(jobGrade) ? null : jobGrade.Trim().ToUpperInvariant();
}
