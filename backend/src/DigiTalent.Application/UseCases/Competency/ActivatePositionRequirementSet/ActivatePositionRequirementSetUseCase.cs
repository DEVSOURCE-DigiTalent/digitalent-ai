using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class ActivatePositionRequirementSetUseCase : IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ActivatePositionRequirementSetUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ActivatePositionRequirementSetUseCaseOutput> ExecuteAsync(ActivatePositionRequirementSetUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId;

        var set = await (from s in _context.GetDbSet<PositionRequirementSet>()
                         join p in _context.JobPositions on s.JobPositionId equals p.Id
                         where s.Id == input.Id && p.OrganizationId == orgId
                         select s).FirstOrDefaultAsync();

        if (set == null)
        {
            throw new NotFoundException($"Position requirement set with ID '{input.Id}' not found.");
        }

        if (set.Status == Statuses.PositionRequirementSet.Archived)
        {
            throw new BadRequestException("Cannot activate an archived requirement set.");
        }

        var hasItems = await _context.GetDbSet<PositionRequirementItem>().AnyAsync(i => i.RequirementSetId == set.Id);
        if (!hasItems)
        {
            throw new BadRequestException("Cannot activate a position requirement set with no items.");
        }

        if (set.Status != Statuses.PositionRequirementSet.Active)
        {
            // Archive currently active sets for this position
            var activeSets = await _context.GetDbSet<PositionRequirementSet>()
                .Where(s => s.JobPositionId == set.JobPositionId && s.Status == Statuses.PositionRequirementSet.Active && s.Id != set.Id)
                .ToListAsync();

            foreach (var prevActive in activeSets)
            {
                prevActive.Status = Statuses.PositionRequirementSet.Archived;
            }

            var now = DateTimeOffset.UtcNow;
            set.Status = Statuses.PositionRequirementSet.Active;
            set.ActivatedByUserId = userId;
            set.ActivatedAt = now;
            set.RowVersion += 1;

            await _context.SaveChangesAsync();
        }

        return new ActivatePositionRequirementSetUseCaseOutput
        {
            Id = set.Id,
            VersionNo = set.VersionNo,
            Status = set.Status,
            ActivatedAt = set.ActivatedAt
        };
    }
}
