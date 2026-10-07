using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// Display name of each grade for an organization: the custom name from job_grades, else the default.
/// </summary>
public static class JobGradeNames
{
    public static async Task<Dictionary<string, string>> LoadAsync(IApplicationDbContext context, Guid organizationId)
    {
        var custom = await context.JobGrades
            .Where(g => g.OrganizationId == organizationId)
            .ToDictionaryAsync(g => g.Code, g => g.Name);
        return JobGrades.Codes.ToDictionary(code => code, code => custom.GetValueOrDefault(code) ?? JobGrades.Defaults[code].Name);
    }

    /// <summary>Name of <paramref name="code"/>, or null when the position has no grade.</summary>
    public static string? NameOf(this Dictionary<string, string> names, string? code) =>
        code == null ? null : names.GetValueOrDefault(code);
}
