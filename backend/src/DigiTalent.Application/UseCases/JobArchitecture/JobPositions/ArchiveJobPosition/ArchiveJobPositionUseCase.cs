using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class ArchiveJobPositionUseCase : IUseCase<ArchiveJobPositionUseCaseInput, ArchiveJobPositionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public ArchiveJobPositionUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<ArchiveJobPositionUseCaseOutput> ExecuteAsync(ArchiveJobPositionUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var position = await _context.JobPositions
            .FirstOrDefaultAsync(p => p.Id == input.Id && p.OrganizationId == organizationId);

        if (position == null)
        {
            throw new NotFoundException($"Job position with Id '{input.Id}' not found.");
        }

        var hasEmployees = await _context.Employees
            .AnyAsync(e => e.JobPositionId == position.Id && e.OrganizationId == organizationId && e.Status != Statuses.Employee.Archived);

        if (hasEmployees)
        {
            throw new ConflictException($"Cannot archive job position '{position.Name}' because it is currently assigned to one or more active employees.");
        }

        position.Status = Statuses.MasterData.Archived;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync("POSITION_ARCHIVED", "job_positions", position.Id, entityLabel: position.Name);

        return new ArchiveJobPositionUseCaseOutput { Id = position.Id };
    }
}
