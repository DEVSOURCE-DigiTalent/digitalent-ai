using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

/// <summary>
/// Where one competency is used (OW-15): requiring positions, courses teaching it, and — for the employees in the
/// caller's scope — the spread of confirmed levels and who falls short of their position's requirement.
/// </summary>
public class GetCompetencyUsageUseCase : IUseCase<GetCompetencyUsageUseCaseInput, GetCompetencyUsageUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;

    public GetCompetencyUsageUseCase(IApplicationDbContext context, ICurrentUser currentUser, EmployeeScope employeeScope)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
    }

    public async Task<GetCompetencyUsageUseCaseOutput> ExecuteAsync(GetCompetencyUsageUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var competencyId = input.CompetencyId;
        var exists = await (
                from competency in _context.Competencies
                join category in _context.CompetencyCategories on competency.CategoryId equals category.Id
                where competency.Id == competencyId && category.OrganizationId == organizationId
                select competency.Id)
            .AnyAsync();
        if (!exists)
        {
            throw new NotFoundException($"Competency with ID '{competencyId}' not found.");
        }

        var activeEmployees = _employeeScope.VisibleEmployees().Where(e => e.Status == Statuses.Employee.Active);
        var activeRequirements =
            from item in _context.PositionRequirementItems
            join set in _context.PositionRequirementSets on item.RequirementSetId equals set.Id
            where item.CompetencyId == competencyId && set.Status == Statuses.PositionRequirementSet.Active
            select new { set.JobPositionId, item.RequiredLevel, item.IsMandatory, item.WeightPercent };

        var positions = await (
                from requirement in activeRequirements
                join position in _context.JobPositions on requirement.JobPositionId equals position.Id
                where position.OrganizationId == organizationId && position.Status == Statuses.MasterData.Active
                orderby position.Name
                select new CompetencyUsagePosition
                {
                    PositionId = position.Id,
                    PositionName = position.Name,
                    RequiredLevel = requirement.RequiredLevel,
                    IsMandatory = requirement.IsMandatory,
                    WeightPercent = requirement.WeightPercent,
                    Employees = activeEmployees.Count(e => e.JobPositionId == position.Id),
                })
            .AsNoTracking()
            .ToListAsync();

        var levels = await activeEmployees
            .Select(e => _context.EmployeeCompetencyProfiles
                .Where(p => p.EmployeeId == e.Id && p.CompetencyId == competencyId)
                .Select(p => (short?)p.ConfirmedLevel)
                .FirstOrDefault())
            .ToListAsync();

        var shortfalls = await (
                from employee in activeEmployees
                join requirement in activeRequirements on employee.JobPositionId equals (Guid?)requirement.JobPositionId
                join department in _context.Departments on employee.DepartmentId equals department.Id
                join position in _context.JobPositions on employee.JobPositionId equals position.Id
                let current = _context.EmployeeCompetencyProfiles
                    .Where(p => p.EmployeeId == employee.Id && p.CompetencyId == competencyId)
                    .Select(p => (short?)p.ConfirmedLevel)
                    .FirstOrDefault() ?? (short)0
                where current < requirement.RequiredLevel
                select new EmployeeWithGap
                {
                    EmployeeId = employee.Id,
                    FullName = employee.FullName,
                    Email = employee.WorkEmail ?? string.Empty,
                    DepartmentName = department.Name,
                    JobPositionName = position.Name,
                    JobGrade = position.JobGrade,
                    CurrentLevel = current,
                    RequiredLevel = requirement.RequiredLevel,
                    Gap = requirement.RequiredLevel - current,
                })
            .AsNoTracking()
            .ToListAsync();

        return new GetCompetencyUsageUseCaseOutput
        {
            Positions = positions,
            Courses = await LoadCoursesAsync(organizationId, competencyId),
            LevelDistribution = Enumerable.Range(0, 4).ToDictionary(level => level.ToString(), level => levels.Count(l => (l ?? 0) == level)),
            EmployeesWithGap = shortfalls
                .OrderByDescending(e => e.Gap)
                .ThenBy(e => e.FullName, NameOrder.Vietnamese)
                .ToList(),
        };
    }

    /// <summary>Published courses teaching the competency — only the latest published version of each course code.</summary>
    private async Task<List<CompetencyUsageCourse>> LoadCoursesAsync(Guid organizationId, Guid competencyId)
    {
        var courses = _context.Courses.AsNoTracking();
        return await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join course in courses on teaching.CourseId equals course.Id
                where teaching.CompetencyId == competencyId
                      && course.OrganizationId == organizationId
                      && course.Status == Statuses.Course.Published
                      && !courses.Any(newer => newer.OrganizationId == course.OrganizationId
                                               && newer.Code == course.Code
                                               && newer.Status == Statuses.Course.Published
                                               && newer.VersionNo > course.VersionNo)
                orderby teaching.TargetLevel, course.Code
                select new CompetencyUsageCourse
                {
                    Id = course.Id,
                    Code = course.Code,
                    Title = course.Title,
                    Level = teaching.TargetLevel,
                    Assigned = _context.CourseAssignments.Count(a => a.CourseId == course.Id && a.Status != Statuses.Enrollment.Cancelled),
                })
            .ToListAsync();
    }
}
