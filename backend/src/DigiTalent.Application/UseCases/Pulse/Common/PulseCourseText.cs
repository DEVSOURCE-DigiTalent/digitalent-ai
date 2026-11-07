using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Plain text of a course version's active modules and lessons, given to the AI reviewer so it can check an answer
/// against what the course taught. PDF, image and video pages contribute only their titles.
/// </summary>
public static partial class PulseCourseText
{
    public const int MaxChars = 30_000;
    public const string TruncatedNote = "\n… (nội dung khóa đã được rút gọn)";

    public static async Task<Dictionary<Guid, string>> LoadAsync(IApplicationDbContext context, IReadOnlyCollection<Guid> courseIds, int maxChars = MaxChars)
    {
        if (courseIds.Count == 0)
        {
            return new Dictionary<Guid, string>();
        }

        var modules = await context.CourseModules.AsNoTracking()
            .Where(m => courseIds.Contains(m.CourseId) && m.Status == Statuses.CourseContent.Active)
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Title)
            .Select(m => new { m.Id, m.CourseId, m.Title })
            .ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var lessons = (await context.Lessons.AsNoTracking()
                .Where(l => moduleIds.Contains(l.ModuleId) && l.Status == Statuses.CourseContent.Active)
                .OrderBy(l => l.SortOrder).ThenBy(l => l.Title)
                .Select(l => new { l.ModuleId, l.Title, l.ContentBody })
                .ToListAsync())
            .ToLookup(l => l.ModuleId);

        var result = new Dictionary<Guid, string>();
        foreach (var course in modules.GroupBy(m => m.CourseId))
        {
            var text = new StringBuilder();
            foreach (var (module, index) in course.Select((m, i) => (m, i)))
            {
                text.Append("Mô đun ").Append(index + 1).Append(": ").Append(module.Title).Append('\n');
                foreach (var lesson in lessons[module.Id])
                {
                    var body = Plain(lesson.ContentBody);
                    text.Append("- ").Append(lesson.Title);
                    if (body.Length > 0)
                    {
                        text.Append(": ").Append(body);
                    }
                    text.Append('\n');
                }
            }

            var value = text.ToString().Trim();
            result[course.Key] = value.Length <= maxChars ? value : value[..maxChars] + TruncatedNote;
        }

        return result;
    }

    private static string Plain(string? html) =>
        string.IsNullOrWhiteSpace(html) ? string.Empty : Spaces().Replace(WebUtility.HtmlDecode(Tags().Replace(html, " ")), " ").Trim();

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex Tags();

    [GeneratedRegex(@"\s+")]
    private static partial Regex Spaces();
}
