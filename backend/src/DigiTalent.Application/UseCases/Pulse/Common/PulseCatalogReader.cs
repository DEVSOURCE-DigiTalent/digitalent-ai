using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// 18 khóa chuẩn của một tổ chức: một khóa cho mỗi (lĩnh vực, cấp) trong số khóa PUBLISHED. Cấp khóa = target_level
/// lớn nhất trong course_competencies; lĩnh vực = lĩnh vực có nhiều năng lực nhất của khóa; mỗi mã khóa lấy bản mới
/// nhất, trùng ô thì lấy mã nhỏ nhất. Dùng chung cho lộ trình nhân viên, phạm vi năng lực và hàng chờ chấm bài.
/// </summary>
public class PulseCatalogReader
{
    private readonly IApplicationDbContext _context;

    public PulseCatalogReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PulseCourseRef>> LoadAsync(Guid organizationId, IReadOnlyCollection<string>? trialCourseCodes = null)
    {
        var many = await LoadManyAsync(new[] { organizationId }, trialCourseCodes);
        return many.GetValueOrDefault(organizationId) ?? new List<PulseCourseRef>();
    }

    public async Task<Dictionary<Guid, List<PulseCourseRef>>> LoadManyAsync(
        IReadOnlyCollection<Guid> organizationIds,
        IReadOnlyCollection<string>? trialCourseCodes = null)
    {
        var orgIds = organizationIds.Distinct().ToList();
        if (orgIds.Count == 0)
        {
            return new Dictionary<Guid, List<PulseCourseRef>>();
        }

        var publishedCourses = _context.Courses.AsNoTracking()
            .Where(course => orgIds.Contains(course.OrganizationId) && course.Status == Statuses.Course.Published);
        if (trialCourseCodes != null)
        {
            var trialAliases = trialCourseCodes.SelectMany(CourseCodes.Aliases).Distinct().ToArray();
            publishedCourses = publishedCourses.Where(course => trialAliases.Contains(course.Code));
        }

        var rows = await (
                from course in publishedCourses
                join teaching in _context.CourseCompetencies.AsNoTracking() on course.Id equals teaching.CourseId
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                select new
                {
                    course.OrganizationId,
                    course.Id,
                    course.Code,
                    course.Title,
                    course.Description,
                    course.Purpose,
                    course.EstimatedDurationMinutes,
                    course.VersionNo,
                    competency.CategoryId,
                    teaching.TargetLevel,
                })
            .ToListAsync();

        var result = orgIds.ToDictionary(id => id, _ => new List<PulseCourseRef>());
        foreach (var byOrg in rows.GroupBy(r => r.OrganizationId))
        {
            var perCourse = byOrg
                .GroupBy(r => r.Id)
                .Select(g =>
                {
                    var first = g.First();
                    var category = g.GroupBy(r => r.CategoryId).OrderByDescending(c => c.Count()).ThenBy(c => c.Key).First().Key;
                    return new PulseCourseRef
                    {
                        CourseId = first.Id,
                        Code = first.Code,
                        Title = first.Title,
                        Description = first.Description,
                        Purpose = first.Purpose,
                        EstimatedMinutes = first.EstimatedDurationMinutes,
                        VersionNo = first.VersionNo,
                        CategoryId = category,
                        Tier = Math.Clamp((int)g.Max(r => r.TargetLevel), 1, PulseRules.MaxLevel),
                    };
                })
                .Where(course => trialCourseCodes == null || course.Tier == 1)
                .ToList();

            result[byOrg.Key] = perCourse
                .GroupBy(c => c.Code, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.OrderByDescending(c => c.VersionNo).First())
                .GroupBy(c => (c.CategoryId, c.Tier))
                .Select(g => g.OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).First())
                .ToList();
        }

        return result;
    }
}
