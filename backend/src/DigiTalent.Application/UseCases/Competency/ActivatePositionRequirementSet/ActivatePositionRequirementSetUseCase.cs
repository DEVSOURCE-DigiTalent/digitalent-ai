using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class ActivatePositionRequirementSetUseCase : IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput>
{
    private const decimal RequiredTotalWeightPercent = 100m;

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

        var weights = await _context.GetDbSet<PositionRequirementItem>()
            .Where(i => i.RequirementSetId == set.Id)
            .Select(i => i.WeightPercent)
            .ToListAsync();
        if (weights.Count == 0)
        {
            throw new BadRequestException("Cannot activate a position requirement set with no items.");
        }

        // Skill gap priority & coverage assume weights sum to exactly 100 (drafts may be incomplete).
        var totalWeight = weights.Sum();
        if (totalWeight != RequiredTotalWeightPercent)
        {
            throw new BadRequestException(
                $"Total weight percent must equal {RequiredTotalWeightPercent} before activation (current: {totalWeight}).");
        }

        if (set.Status != Statuses.PositionRequirementSet.Active)
        {
            // Archive currently active sets for this position
            var activeSets = await _context.GetDbSet<PositionRequirementSet>()
                .Where(s => s.JobPositionId == set.JobPositionId && s.Status == Statuses.PositionRequirementSet.Active && s.Id != set.Id)
                .ToListAsync();

            // ux_requirement_sets_one_active (1 bộ ACTIVE / vị trí) được kiểm tra theo từng câu lệnh:
            // phải archive bộ cũ TRƯỚC khi kích hoạt bộ mới — 2 lần lưu trong cùng 1 transaction.
            await _context.ExecuteInTransactionAsync(async () =>
            {
                foreach (var prevActive in activeSets)
                {
                    prevActive.Status = Statuses.PositionRequirementSet.Archived;
                }
                await _context.SaveChangesAsync();

                set.Status = Statuses.PositionRequirementSet.Active;
                set.ActivatedByUserId = userId;
                set.ActivatedAt = DateTimeOffset.UtcNow;
                set.RowVersion += 1;

                // Nhân viên ở vị trí này được tính lại skill gap theo bộ tiêu chuẩn mới (cùng transaction)
                _context.AddDomainEvent(new PositionRequirementSetActivated(set.Id, set.JobPositionId));
                await _context.SaveChangesAsync();
            });
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
