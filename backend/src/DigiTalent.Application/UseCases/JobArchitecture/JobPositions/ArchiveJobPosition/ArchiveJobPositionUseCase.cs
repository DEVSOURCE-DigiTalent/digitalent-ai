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

    public ArchiveJobPositionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
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

        position.Status = Statuses.MasterData.Archived;
        await _context.SaveChangesAsync();

        return new ArchiveJobPositionUseCaseOutput { Id = position.Id };
    }
}
