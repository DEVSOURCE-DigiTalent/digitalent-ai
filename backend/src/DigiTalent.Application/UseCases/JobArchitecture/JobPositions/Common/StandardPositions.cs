using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

/// <summary>
/// The organization's job positions are the 5 standard ones (<see cref="JobPositionCatalog"/>: CEO, HR, Marketing, Sales,
/// Accountant), one row per code, shared by every department: a department has any name and may hold several positions,
/// a position may be held in any department. <c>JobPosition.DepartmentId</c> is a legacy binding no rule uses any more.
/// </summary>
public static class StandardPositions
{
    public const string NotStandard = "Chọn một trong 5 vị trí chuẩn: CEO, Nhân sự, Marketing, Sales, Kế toán.";
    public const string NotActive = "Vị trí chuẩn này đã ngừng sử dụng trong doanh nghiệp.";

    /// <summary>Catalog code of a typed position (code, label or an existing position's name); null when not one of the 5.</summary>
    public static string? CodeOf(IEnumerable<JobPosition> positions, string nameOrCode)
    {
        var value = nameOrCode.Trim();
        if (value.Length == 0) return null;
        return JobPositionCatalog.ResolveCode(value)
            ?? positions.FirstOrDefault(p => p.Name.Trim().Equals(value, StringComparison.OrdinalIgnoreCase)
                && JobPositionCatalog.Positions.ContainsKey(p.Code))?.Code.ToUpperInvariant();
    }

    /// <summary>The names to offer for the 5 standard positions, in catalog order: the organization's own name when it has the
    /// position, else the catalog label; a position taken out of use is left out.</summary>
    public static List<string> Choices(IEnumerable<JobPosition> positions)
    {
        var byCode = positions.GroupBy(p => p.Code.ToUpperInvariant()).ToDictionary(g => g.Key, g => g.First());
        return JobPositionCatalog.Positions
            .Select(entry => byCode.TryGetValue(entry.Key.ToUpperInvariant(), out var own)
                ? own.Status == Statuses.MasterData.Active ? own.Name : null
                : entry.Value)
            .OfType<string>().ToList();
    }

    /// <summary>
    /// The organization's position for a typed standard position, created (not saved) when the organization has none yet.
    /// Returns the reason instead when the value is not one of the 5 or that position was taken out of use.
    /// </summary>
    public static (JobPosition? Position, string? Error) Resolve(
        IApplicationDbContext context, Guid organizationId, List<JobPosition> positions, string nameOrCode)
    {
        var code = CodeOf(positions, nameOrCode);
        if (code == null) return (null, NotStandard);
        var position = positions.Find(p => p.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        if (position != null)
            return position.Status == Statuses.MasterData.Active ? (position, null) : (null, NotActive);

        position = new JobPosition { OrganizationId = organizationId, Code = code, Name = JobPositionCatalog.Positions[code] };
        context.JobPositions.Add(position);
        positions.Add(position);
        return (position, null);
    }
}
