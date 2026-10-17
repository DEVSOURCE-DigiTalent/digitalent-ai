using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Content;

public sealed class LessonMediaDto
{
    public string Kind { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
}

/// <summary>One authorized media/final projection shared by Owner, Employee and Manager.</summary>
public sealed class LearningContentReader(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
{
    public async Task<Dictionary<Guid, List<LessonMediaDto>>> MediaAsync(IReadOnlyCollection<Guid> lessonIds)
    {
        if (urls == null || lessonIds.Count == 0) return new();
        var materials = await context.LearningMaterials.AsNoTracking().Where(m => lessonIds.Contains(m.LessonId) && m.ExternalUrl != null)
            .OrderBy(m => m.SortOrder).ToListAsync();
        var references = materials.Select(m => (Material: m, AssetId: AssetId(m.ExternalUrl)))
            .Where(m => m.AssetId.HasValue).ToList();
        var ids = references.Select(r => r.AssetId!.Value).Distinct().ToList();
        var assets = await context.PlatformAssets.AsNoTracking().Where(a => ids.Contains(a.Id)).ToDictionaryAsync(a => a.Id);
        return references.Where(r => assets.ContainsKey(r.AssetId!.Value)).GroupBy(r => r.Material.LessonId)
            .ToDictionary(g => g.Key, g => g.Select(r => new LessonMediaDto
            {
                Kind = assets[r.AssetId!.Value].Kind, Url = urls.ContentPath(r.AssetId.Value), Alt = r.Material.Title,
            }).ToList());
    }

    public async Task<Dictionary<Guid, PlatformCourseFinalDto>> FinalsAsync(IReadOnlyCollection<Guid> courseIds)
    {
        var tasks = await context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => t.RelatedCourseId != null && courseIds.Contains(t.RelatedCourseId.Value) && t.Status == "ACTIVE")
            .OrderByDescending(t => t.CreatedAt).ToListAsync();
        var result = new Dictionary<Guid, PlatformCourseFinalDto>();
        foreach (var task in tasks)
        {
            if (result.ContainsKey(task.RelatedCourseId!.Value)) continue;
            try
            {
                using var document = JsonDocument.Parse(task.GeneralMarkingCriteria ?? "{}");
                var root = document.RootElement;
                if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("track", out var track) || track.ValueKind != JsonValueKind.String || track.GetString() != "general") continue;
                var criteria = root.TryGetProperty("criteria", out var titles) && titles.ValueKind == JsonValueKind.Array
                    ? titles.EnumerateArray().Where(t => t.ValueKind == JsonValueKind.String).Select(t => t.GetString() ?? "").ToList()
                    : root.TryGetProperty("rubric", out var rubric) && rubric.ValueKind == JsonValueKind.Array
                        ? rubric.EnumerateArray().Where(r => r.ValueKind == JsonValueKind.Array && r.GetArrayLength() > 0).Select(r => r[0].GetString() ?? "").ToList()
                        : new List<string>();
                result[task.RelatedCourseId.Value] = new PlatformCourseFinalDto { Title = task.Title, PromptHtml = task.Description ?? "", Criteria = criteria };
            }
            catch (JsonException) { /* Unstructured legacy templates keep the existing default brief. */ }
        }
        return result;
    }

    private static Guid? AssetId(string? reference) => reference?.StartsWith("platform-asset:", StringComparison.Ordinal) == true
        && Guid.TryParse(reference[15..], out var id) ? id : null;
}
