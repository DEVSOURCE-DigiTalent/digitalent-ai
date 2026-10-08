using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

/// <summary>
/// Requirement overview of the organization's positions (OW-16): the active and draft requirement sets of each
/// position that is not archived, how many versions exist and how many active employees hold the position.
/// </summary>
public class GetPositionRequirementSummariesUseCase
    : IUseCase<GetPositionRequirementSummariesUseCaseInput, GetPositionRequirementSummariesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPositionRequirementSummariesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPositionRequirementSummariesUseCaseOutput> ExecuteAsync(GetPositionRequirementSummariesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var sets = _context.PositionRequirementSets.AsNoTracking();

        var summaries = await _context.JobPositions
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived)
            .OrderBy(p => p.Code)
            .Select(p => new PositionRequirementSummary
            {
                JobPositionId = p.Id,
                JobPositionCode = p.Code,
                JobPositionName = p.Name,
                JobGrade = p.JobGrade,
                DepartmentId = p.DepartmentId,
                DepartmentName = _context.Departments.Where(d => d.Id == p.DepartmentId).Select(d => d.Name).FirstOrDefault(),
                EmployeeCount = _context.Employees.Count(e => e.JobPositionId == p.Id && e.Status == Statuses.Employee.Active),
                TotalVersions = sets.Count(s => s.JobPositionId == p.Id),
                ActiveSet = sets
                    .Where(s => s.JobPositionId == p.Id && s.Status == Statuses.PositionRequirementSet.Active)
                    .Select(s => new RequirementSetBrief
                    {
                        Id = s.Id,
                        VersionNo = s.VersionNo,
                        EffectiveFrom = s.EffectiveFrom,
                        ActivatedAt = s.ActivatedAt,
                        CompetencyCount = _context.PositionRequirementItems.Count(i => i.RequirementSetId == s.Id),
                    })
                    .FirstOrDefault(),
                DraftSet = sets
                    .Where(s => s.JobPositionId == p.Id && s.Status == Statuses.PositionRequirementSet.Draft)
                    .OrderByDescending(s => s.VersionNo)
                    .Select(s => new RequirementSetBrief
                    {
                        Id = s.Id,
                        VersionNo = s.VersionNo,
                        EffectiveFrom = s.EffectiveFrom,
                        CompetencyCount = _context.PositionRequirementItems.Count(i => i.RequirementSetId == s.Id),
                    })
                    .FirstOrDefault(),
            })
            .ToListAsync();

        var output = new GetPositionRequirementSummariesUseCaseOutput();
        foreach (var summary in summaries)
        {
            summary.Status = summary.ActiveSet != null ? RequirementSummaryStatuses.Active
                : summary.DraftSet != null ? RequirementSummaryStatuses.Draft
                : RequirementSummaryStatuses.NotConfigured;
            output.Add(summary);
        }

        return output;
    }
}
