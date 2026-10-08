using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Tests.Competency;

/// <summary>
/// Dữ liệu khung Thông tư 02/2025 cho test: khung TT02_2025 dùng chung (unique code + version toàn cục,
/// nên lấy lại nếu đã có) và 24 năng lực có mapping DIRECT cho một tổ chức.
/// </summary>
internal static class Tt02TestData
{
    /// <summary>24 năng lực theo thứ tự mã 1.1 … 6.3.</summary>
    public static async Task<IReadOnlyList<Domain.Entities.Competency>> SeedMappedCompetenciesAsync(AppDbContext context, Guid organizationId)
    {
        var framework = await FrameworkAsync(context);

        var category = new CompetencyCategory
        {
            OrganizationId = organizationId,
            Code = $"TT02_{Guid.NewGuid():N}"[..20],
            Name = "Thông tư 02/2025",
        };
        context.CompetencyCategories.Add(category);

        var competencies = new List<Domain.Entities.Competency>();
        foreach (var sourceCode in CompetencyFrameworks.Tt02.CompetencyCodes)
        {
            var competency = new Domain.Entities.Competency
            {
                CategoryId = category.Id,
                Code = $"TT02-{sourceCode}",
                Name = $"Competency {sourceCode}",
                CompetencyType = Statuses.CompetencyType.CoreDigital,
                Status = Statuses.Competency.Active,
            };
            context.Competencies.Add(competency);
            context.CompetencyFrameworkMappings.Add(new CompetencyFrameworkMapping
            {
                CompetencyId = competency.Id,
                FrameworkId = framework.Id,
                SourceAreaCode = sourceCode[..1],
                SourceCode = sourceCode,
                Relationship = "DIRECT",
                IsPrimary = true,
            });
            competencies.Add(competency);
        }

        await context.SaveChangesAsync();
        return competencies;
    }

    /// <summary>Maps existing competencies to Circular 02/2025 codes (competency id → code such as "4.2").</summary>
    public static async Task MapAsync(AppDbContext context, IReadOnlyDictionary<Guid, string> codes)
    {
        var framework = await FrameworkAsync(context);
        foreach (var (competencyId, sourceCode) in codes)
        {
            context.CompetencyFrameworkMappings.Add(new CompetencyFrameworkMapping
            {
                CompetencyId = competencyId,
                FrameworkId = framework.Id,
                SourceAreaCode = sourceCode[..1],
                SourceCode = sourceCode,
                Relationship = "DIRECT",
                IsPrimary = true,
            });
        }

        await context.SaveChangesAsync();
    }

    /// <summary>The shared TT02_2025 framework (unique code + version), created on first use.</summary>
    private static async Task<CompetencyFramework> FrameworkAsync(AppDbContext context)
    {
        var framework = await context.CompetencyFrameworks.FirstOrDefaultAsync(f =>
            f.Code == CompetencyFrameworks.Tt02.Code && f.Version == CompetencyFrameworks.Tt02.Version);
        if (framework == null)
        {
            framework = new CompetencyFramework
            {
                Code = CompetencyFrameworks.Tt02.Code,
                Version = CompetencyFrameworks.Tt02.Version,
                Name = "Khung năng lực số",
                IsActive = true,
            };
            context.CompetencyFrameworks.Add(framework);
        }

        return framework;
    }

    /// <summary>Một dòng cho mỗi năng lực, cùng mức; trọng số 23 × 4.17 + 4.09 = 100.</summary>
    public static IEnumerable<PositionRequirementItem> Items(Guid requirementSetId, IEnumerable<Domain.Entities.Competency> competencies, int level = 2)
    {
        var list = competencies.ToList();
        return list.Select((c, index) => new PositionRequirementItem
        {
            RequirementSetId = requirementSetId,
            CompetencyId = c.Id,
            RequiredLevel = level,
            WeightPercent = index < list.Count - 1 ? 4.17m : 100m - 4.17m * (list.Count - 1),
        });
    }
}
