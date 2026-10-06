using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-03 — Khoảng trống năng lực của tôi: tính trực tiếp theo bộ tiêu chuẩn ACTIVE của vị trí,
/// mỗi năng lực còn thiếu kèm khóa học đang dạy năng lực đó (để bù gap).
/// </summary>
public class GetMySkillGapUseCase : IUseCase<GetMySkillGapUseCaseInput, GetMySkillGapUseCaseOutput>
{
    private const int MaxSuggestionsPerCompetency = 3;

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyCompetencySnapshotBuilder _snapshotBuilder;

    public GetMySkillGapUseCase(IApplicationDbContext context, MyEmployeeContext me, MyCompetencySnapshotBuilder snapshotBuilder)
    {
        _context = context;
        _me = me;
        _snapshotBuilder = snapshotBuilder;
    }

    public async Task<GetMySkillGapUseCaseOutput> ExecuteAsync(GetMySkillGapUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var snapshot = await _snapshotBuilder.BuildAsync(employee);

        var lastSnapshotAt = await _context.SkillGapRuns
            .AsNoTracking()
            .Where(r => r.EmployeeId == employee.Id)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => (DateTimeOffset?)r.GeneratedAt)
            .FirstOrDefaultAsync();

        var gapCompetencyIds = snapshot.Lines.Where(l => l.GapSteps > 0).Select(l => l.CompetencyId).ToList();
        var courses = _context.Courses.AsNoTracking();
        var teachings = await (
                    from teaching in _context.CourseCompetencies.AsNoTracking()
                    join course in courses on teaching.CourseId equals course.Id
                    where gapCompetencyIds.Contains(teaching.CompetencyId)
                          && course.OrganizationId == employee.OrganizationId
                          && course.Status == Statuses.Course.Published
                          && !courses.Any(newer => newer.OrganizationId == course.OrganizationId
                                                   && newer.Code == course.Code
                                                   && newer.Status == Statuses.Course.Published
                                                   && newer.VersionNo > course.VersionNo)
                    select new
                    {
                        teaching.CompetencyId,
                        teaching.TargetLevel,
                        course.Id,
                        course.Code,
                        course.Title,
                        course.EstimatedDurationMinutes,
                    })
                .ToListAsync();

        var courseIds = teachings.Select(t => t.Id).Distinct().ToList();
        var enrollmentStatus = (await _context.Enrollments
                .AsNoTracking()
                .Where(e => e.EmployeeId == employee.Id && courseIds.Contains(e.CourseId) && e.Status != Statuses.Enrollment.Cancelled)
                .Select(e => new { e.CourseId, e.Status, e.CreatedAt })
                .ToListAsync())
            .GroupBy(e => e.CourseId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(e => e.CreatedAt).First().Status);

        return new GetMySkillGapUseCaseOutput
        {
            JobPositionName = snapshot.Position?.Name,
            RequirementSetVersionNo = snapshot.RequirementSet?.VersionNo,
            SkipReason = snapshot.SkipReason,
            Summary = MyCompetencyLineDto.Summary(snapshot),
            LastSnapshotAt = lastSnapshotAt,
            CalculatedAt = DateTimeOffset.UtcNow,
            Items = snapshot.Lines.Select(line =>
            {
                var dto = MyCompetencyLineDto.Map<MySkillGapLineDto>(line);
                if (line.GapSteps > 0)
                {
                    var current = line.CurrentLevel ?? 0;
                    dto.SuggestedCourses = teachings
                        .Where(t => t.CompetencyId == line.CompetencyId && t.TargetLevel > current)
                        // Ưu tiên khóa đưa lên đúng mức kế tiếp, rồi khóa ngắn hơn
                        .OrderBy(t => Math.Abs(t.TargetLevel - Math.Min(current + 1, line.RequiredLevel)))
                        .ThenBy(t => t.EstimatedDurationMinutes ?? int.MaxValue)
                        .ThenBy(t => t.Code, StringComparer.OrdinalIgnoreCase)
                        .Take(MaxSuggestionsPerCompetency)
                        .Select(t => new MySuggestedCourseDto
                        {
                            CourseId = t.Id,
                            Code = t.Code,
                            Title = t.Title,
                            TargetLevel = t.TargetLevel,
                            EstimatedDurationMinutes = t.EstimatedDurationMinutes,
                            EnrollmentStatus = enrollmentStatus.GetValueOrDefault(t.Id),
                        })
                        .ToList();
                }

                return dto;
            }).ToList(),
        };
    }
}
