using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

/// <summary>
/// Job positions of the caller's organization (OW-09): search by code/name, filter by status, family,
/// department and grade; each row carries its headcount and whether an ACTIVE requirement set exists.
/// </summary>
public class GetPagedJobPositionsUseCase : IUseCase<GetPagedJobPositionsUseCaseInput, GetPagedJobPositionsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPagedJobPositionsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPagedJobPositionsUseCaseOutput> ExecuteAsync(GetPagedJobPositionsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.JobPositions
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId);

        // Status filter (default: exclude archived)
        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(p => p.Status == status);
        }
        else
        {
            query = query.Where(p => p.Status != Statuses.MasterData.Archived);
        }

        if (input.JobFamilyId.HasValue)
        {
            query = query.Where(p => p.JobFamilyId == input.JobFamilyId.Value);
        }

        if (input.DepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == input.DepartmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.JobGrade))
        {
            var grade = input.JobGrade.Trim().ToUpper();
            query = query.Where(p => p.JobGrade == grade);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(p => p.Code.ToLower().Contains(search) || p.Name.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var items = await query
            .OrderBy(p => p.Code)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new JobPositionListItem
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Description = p.Description,
                JobFamilyId = p.JobFamilyId,
                JobFamilyName = _context.JobFamilies
                    .Where(f => f.Id == p.JobFamilyId)
                    .Select(f => f.Name)
                    .FirstOrDefault(),
                DepartmentId = p.DepartmentId,
                DepartmentName = _context.Departments
                    .Where(d => d.Id == p.DepartmentId)
                    .Select(d => d.Name)
                    .FirstOrDefault(),
                JobGrade = p.JobGrade,
                Headcount = _context.Employees
                    .Count(e => e.JobPositionId == p.Id && e.Status == Statuses.Employee.Active),
                HasRequirementSet = _context.PositionRequirementSets
                    .Any(s => s.JobPositionId == p.Id && s.Status == Statuses.PositionRequirementSet.Active),
                Status = p.Status,
            })
            .ToListAsync();

        // Grade labels: custom name of the organization or the default one
        var gradeNames = await JobGradeNames.LoadAsync(_context, organizationId);
        foreach (var item in items)
        {
            item.JobGradeName = gradeNames.NameOf(item.JobGrade);
        }

        return new GetPagedJobPositionsUseCaseOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
