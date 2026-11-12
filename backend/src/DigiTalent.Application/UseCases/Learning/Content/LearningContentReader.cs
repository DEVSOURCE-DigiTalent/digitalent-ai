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
        if (courseIds.Count == 0) return new();

        var tasks = await context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => t.RelatedCourseId != null && courseIds.Contains(t.RelatedCourseId.Value) && t.Status == "ACTIVE")
            .OrderByDescending(t => t.CreatedAt).ToListAsync();
        var result = new Dictionary<Guid, PlatformCourseFinalDto>();
        var arrayFallbackTasks = new Dictionary<Guid, PlatformCourseFinalDto>();

        foreach (var task in tasks)
        {
            var courseId = task.RelatedCourseId!.Value;
            if (result.ContainsKey(courseId)) continue;
            try
            {
                using var document = JsonDocument.Parse(task.GeneralMarkingCriteria ?? "{}");
                var root = document.RootElement;
                if (root.ValueKind == JsonValueKind.Object &&
                    root.TryGetProperty("track", out var track) &&
                    track.ValueKind == JsonValueKind.String &&
                    track.GetString() == "general")
                {
                    var criteria = root.TryGetProperty("criteria", out var titles) && titles.ValueKind == JsonValueKind.Array
                        ? titles.EnumerateArray().Where(t => t.ValueKind == JsonValueKind.String).Select(t => t.GetString() ?? "").ToList()
                        : root.TryGetProperty("rubric", out var rubric) && rubric.ValueKind == JsonValueKind.Array
                            ? rubric.EnumerateArray().Where(r => r.ValueKind == JsonValueKind.Array && r.GetArrayLength() > 0).Select(r => r[0].GetString() ?? "").ToList()
                            : new List<string>();
                    result[courseId] = new PlatformCourseFinalDto { Title = task.Title, PromptHtml = task.Description ?? "", Criteria = criteria };
                }
                else if (!arrayFallbackTasks.ContainsKey(courseId) && root.ValueKind == JsonValueKind.Array && !string.IsNullOrWhiteSpace(task.Description))
                {
                    var arrayCriteria = root.EnumerateArray()
                        .Select(el => el.ValueKind == JsonValueKind.Object && el.TryGetProperty("criterion", out var c) && c.ValueKind == JsonValueKind.String
                            ? c.GetString() ?? ""
                            : el.ValueKind == JsonValueKind.String ? el.GetString() ?? "" : "")
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToList();
                    var promptHtml = string.IsNullOrWhiteSpace(task.ExpectedOutput)
                        ? task.Description
                        : $"{task.Description}\nKết quả đầu ra mong đợi: {task.ExpectedOutput}";
                    arrayFallbackTasks[courseId] = new PlatformCourseFinalDto
                    {
                        Title = string.IsNullOrWhiteSpace(task.Title) ? "Bài thực hành cuối cấp" : task.Title,
                        PromptHtml = promptHtml,
                        Criteria = arrayCriteria,
                    };
                }
            }
            catch (JsonException) { /* Unstructured legacy templates keep the existing default brief. */ }
        }

        // Fallback cho các khóa học kế thừa (chưa công bố catalog v2+) sang danh mục nền tảng hiện hành.
        var missingIds = courseIds.Where(id => !result.ContainsKey(id)).ToList();
        if (missingIds.Count > 0)
        {
            var orgCourses = await context.Courses.AsNoTracking()
                .Where(c => missingIds.Contains(c.Id))
                .Select(c => new { c.Id, c.Code })
                .ToListAsync();

            var catalogRows = await (
                    from version in context.PlatformCatalogVersions.AsNoTracking()
                    join catalogCourse in context.PlatformCatalogCourses.AsNoTracking() on version.Id equals catalogCourse.VersionId
                    join platformCourse in context.PlatformCourses.AsNoTracking() on catalogCourse.CourseId equals platformCourse.Id
                    join domain in context.PlatformFrameworkDomains.AsNoTracking() on catalogCourse.DomainId equals domain.Id
                    where version.Status == Domain.Constants.Statuses.PlatformCatalogVersion.Current
                    select new
                    {
                        Code = platformCourse.Code,
                        catalogCourse.FinalTitle,
                        catalogCourse.FinalPrompt,
                        catalogCourse.FinalCriteria,
                        catalogCourse.Level,
                        DomainName = domain.Name,
                    })
                .ToListAsync();

            var catalogByKey = new Dictionary<string, PlatformCourseFinalDto>(StringComparer.OrdinalIgnoreCase);
            foreach (var row in catalogRows)
            {
                var criteria = PlatformCourseContentReader.Criteria(row.FinalCriteria);
                var domainDisplay = System.Text.RegularExpressions.Regex.Replace(row.DomainName ?? string.Empty, @"^\d+\.\s*", string.Empty).Trim();
                var levelName = Domain.Constants.PlatformCatalog.LevelName(row.Level).ToLowerInvariant();
                var prompt = !string.IsNullOrWhiteSpace(row.FinalPrompt)
                    ? row.FinalPrompt
                    : $"<p>Mô tả một nhiệm vụ thực tế trong vị trí của bạn có dùng năng lực {EscapeHtml(domainDisplay.ToLowerInvariant())} ở mức {EscapeHtml(levelName)}: nêu <b>nguồn</b>, <b>hành động hoặc phép tính</b> người khác kiểm tra lại được, <b>kết luận</b> và bước tiếp theo.</p>";
                var dto = new PlatformCourseFinalDto
                {
                    Title = string.IsNullOrWhiteSpace(row.FinalTitle) ? "Bài cuối cấp" : row.FinalTitle,
                    PromptHtml = prompt,
                    Criteria = criteria,
                };
                foreach (var alias in CodeAliases(row.Code))
                {
                    catalogByKey.TryAdd(alias, dto);
                }
            }

            foreach (var oc in orgCourses)
            {
                PlatformCourseFinalDto? matched = null;
                foreach (var alias in CodeAliases(oc.Code))
                {
                    if (catalogByKey.TryGetValue(alias, out matched)) break;
                }

                if (matched != null)
                {
                    result[oc.Id] = matched;
                }
                else if (arrayFallbackTasks.TryGetValue(oc.Id, out var arrayDto))
                {
                    result[oc.Id] = arrayDto;
                }
            }
        }

        return result;
    }

    private static IEnumerable<string> CodeAliases(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) yield break;
        var clean = code.Trim().ToUpperInvariant();
        yield return clean;
        if (clean.Length >= 3 && (clean[0] == 'A' || clean[0] == 'M') && char.IsDigit(clean[1]) && clean[2] == '-')
        {
            yield return (clean[0] == 'M' ? 'A' : 'M') + clean[1..];
        }
    }

    private static string EscapeHtml(string value) => value
        .Replace("&", "&amp;")
        .Replace("<", "&lt;")
        .Replace(">", "&gt;")
        .Replace("\"", "&quot;")
        .Replace("'", "&#39;");

    private static Guid? AssetId(string? reference) => reference?.StartsWith("platform-asset:", StringComparison.Ordinal) == true
        && Guid.TryParse(reference[15..], out var id) ? id : null;
}
