using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// 18 khóa chuẩn của một tổ chức: một khóa cho mỗi (lĩnh vực, cấp) trong số khóa PUBLISHED. Cấp khóa = target_level
/// lớn nhất trong course_competencies; lĩnh vực = lĩnh vực có nhiều năng lực nhất của khóa; mỗi mã khóa lấy bản mới
/// nhất, trùng ô thì lấy mã nhỏ nhất. Dùng chung cho lộ trình nhân viên, trần năng lực và hàng chờ chấm bài.
/// </summary>
public class PulseCatalogReader
{
    private readonly IApplicationDbContext _context;

    public PulseCatalogReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PulseCourseRef>> LoadAsync(Guid organizationId)
    {
        var rows = await (
                from course in _context.Courses.AsNoTracking()
                join teaching in _context.CourseCompetencies.AsNoTracking() on course.Id equals teaching.CourseId
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                where course.OrganizationId == organizationId && course.Status == Statuses.Course.Published
                select new
                {
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

        var perCourse = rows
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
            .ToList();

        return perCourse
            .GroupBy(c => c.Code, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderByDescending(c => c.VersionNo).First())
            .GroupBy(c => (c.CategoryId, c.Tier))
            .Select(g => g.OrderBy(c => c.Code, StringComparer.OrdinalIgnoreCase).First())
            .ToList();
    }
}
