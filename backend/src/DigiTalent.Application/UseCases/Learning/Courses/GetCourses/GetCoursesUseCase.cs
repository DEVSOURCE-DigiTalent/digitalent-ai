using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Courses;

public class GetCoursesUseCase : IUseCase<GetCoursesUseCaseInput, GetCoursesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCoursesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCoursesUseCaseOutput> ExecuteAsync(GetCoursesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.Courses
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x => x.Code.ToLower().Contains(search) || x.Title.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(x => x.Status == status);
        }

        if (input.EntryLevel.HasValue)
        {
            query = query.Where(x => x.EntryLevel == input.EntryLevel.Value);
        }

        var courseCompetencies = _context.CourseCompetencies.AsNoTracking();
        var competencies = _context.Competencies.AsNoTracking();
        var categories = _context.CompetencyCategories.AsNoTracking();

        if (input.Level.HasValue)
        {
            var level = input.Level.Value;
            var courseIdsWithLevel = courseCompetencies
                .Where(cc => cc.TargetLevel == level)
                .Select(cc => cc.CourseId)
                .Distinct();
            query = query.Where(c => courseIdsWithLevel.Contains(c.Id));
        }

        if (input.CategoryId.HasValue)
        {
            var catId = input.CategoryId.Value;
            var compIdsInCategory = competencies.Where(c => c.CategoryId == catId).Select(c => c.Id);
            var courseIdsInCategory = courseCompetencies
                .Where(cc => compIdsInCategory.Contains(cc.CompetencyId))
                .Select(cc => cc.CourseId)
                .Distinct();
            query = query.Where(c => courseIdsInCategory.Contains(c.Id));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = input.PageSize < 1 ? 50 : input.PageSize;

        var modulesSet = _context.CourseModules.AsNoTracking();
        var assignmentsSet = _context.CourseAssignments.AsNoTracking();
        var prerequisitesSet = _context.CoursePrerequisites.AsNoTracking();
        var coursesSet = _context.Courses.AsNoTracking();

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CourseListItem
            {
                Id = x.Id,
                Code = x.Code,
                Title = x.Title,
                Description = x.Description,
                EntryLevel = x.EntryLevel,
                EstimatedDurationMinutes = x.EstimatedDurationMinutes,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                Modules = modulesSet.Count(m => m.CourseId == x.Id),
                AssignedCount = assignmentsSet.Count(a => a.CourseId == x.Id),
                Level = courseCompetencies
                    .Where(cc => cc.CourseId == x.Id)
                    .Select(cc => (int)cc.TargetLevel)
                    .OrderByDescending(t => t)
                    .FirstOrDefault(),
                CategoryId = competencies
                    .Where(comp => courseCompetencies
                        .Where(cc => cc.CourseId == x.Id)
                        .Select(cc => cc.CompetencyId)
                        .Contains(comp.Id))
                    .Select(comp => (Guid?)comp.CategoryId)
                    .FirstOrDefault(),
                CategoryName = categories
                    .Where(cat => cat.Id == competencies
                        .Where(comp => courseCompetencies
                            .Where(cc => cc.CourseId == x.Id)
                            .Select(cc => cc.CompetencyId)
                            .Contains(comp.Id))
                        .Select(comp => comp.CategoryId)
                        .FirstOrDefault())
                    .Select(cat => cat.Name)
                    .FirstOrDefault(),
                PrerequisiteCourseId = prerequisitesSet
                    .Where(p => p.CourseId == x.Id)
                    .Select(p => (Guid?)p.PrerequisiteCourseId)
                    .FirstOrDefault(),
                PrerequisiteTitle = coursesSet
                    .Where(pc => pc.Id == prerequisitesSet
                        .Where(p => p.CourseId == x.Id)
                        .Select(p => p.PrerequisiteCourseId)
                        .FirstOrDefault())
                    .Select(pc => pc.Title)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return new GetCoursesUseCaseOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}
