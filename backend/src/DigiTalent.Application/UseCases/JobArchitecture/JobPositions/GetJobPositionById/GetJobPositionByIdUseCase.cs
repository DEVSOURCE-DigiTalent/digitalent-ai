using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

/// <summary>
/// One job position of the caller's organization (OW-10): family, department, grade, headcount and the version of
/// its ACTIVE requirement set. The requirement items themselves come from the position-requirements API.
/// </summary>
public class GetJobPositionByIdUseCase : IUseCase<GetJobPositionByIdUseCaseInput, GetJobPositionByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetJobPositionByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetJobPositionByIdUseCaseOutput> ExecuteAsync(GetJobPositionByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var position = await _context.JobPositions
            .AsNoTracking()
            .Where(p => p.Id == input.Id && p.OrganizationId == organizationId)
            .Select(p => new GetJobPositionByIdUseCaseOutput
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
                ActiveRequirementSetVersionNo = _context.PositionRequirementSets
                    .Where(s => s.JobPositionId == p.Id && s.Status == Statuses.PositionRequirementSet.Active)
                    .Select(s => (int?)s.VersionNo)
                    .FirstOrDefault(),
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
            })
            .FirstOrDefaultAsync();

        if (position == null)
        {
            throw new NotFoundException($"Job position with Id '{input.Id}' not found.");
        }

        position.HasRequirementSet = position.ActiveRequirementSetVersionNo.HasValue;
        position.JobGradeName = (await JobGradeNames.LoadAsync(_context, organizationId)).NameOf(position.JobGrade);
        return position;
    }
}
