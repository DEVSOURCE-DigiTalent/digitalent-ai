using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class ArchiveJobFamilyUseCase : IUseCase<ArchiveJobFamilyUseCaseInput, ArchiveJobFamilyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ArchiveJobFamilyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ArchiveJobFamilyUseCaseOutput> ExecuteAsync(ArchiveJobFamilyUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var family = await _context.JobFamilies
            .FirstOrDefaultAsync(f => f.Id == input.Id && f.OrganizationId == organizationId);

        if (family == null)
        {
            throw new NotFoundException($"Job family with Id '{input.Id}' not found.");
        }

        var hasPositions = await _context.JobPositions
            .AnyAsync(p => p.JobFamilyId == family.Id && p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived);

        if (hasPositions)
        {
            throw new ConflictException($"Cannot archive job family '{family.Name}' because it has active job positions associated with it.");
        }

        family.Status = Statuses.MasterData.Archived;
        await _context.SaveChangesAsync();

        return new ArchiveJobFamilyUseCaseOutput { Id = family.Id };
    }
}
