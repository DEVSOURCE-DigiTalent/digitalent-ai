using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Employee codes for profiles created from the members screens (invitation activation, first placement):
/// the requested code when it is free, otherwise the next free "NV001", "NV002"… of the organization.
/// </summary>
public static class EmployeeCodeGenerator
{
    private const string Prefix = "NV";

    public static async Task<string> NextAsync(IApplicationDbContext context, Guid organizationId, string? requested = null)
    {
        var used = (await context.Employees
                .Where(e => e.OrganizationId == organizationId)
                .Select(e => e.EmployeeCode)
                .ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var preferred = requested?.Trim().ToUpperInvariant();
        if (!string.IsNullOrEmpty(preferred) && !used.Contains(preferred))
        {
            return preferred;
        }

        for (var number = used.Count + 1; ; number++)
        {
            var code = $"{Prefix}{number:D3}";
            if (!used.Contains(code))
            {
                return code;
            }
        }
    }
}
