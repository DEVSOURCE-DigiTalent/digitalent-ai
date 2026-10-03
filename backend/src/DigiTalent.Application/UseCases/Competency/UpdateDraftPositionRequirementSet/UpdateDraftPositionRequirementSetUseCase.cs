using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class UpdateDraftPositionRequirementSetUseCase : IUseCase<UpdateDraftPositionRequirementSetUseCaseInput, UpdateDraftPositionRequirementSetUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateDraftPositionRequirementSetUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateDraftPositionRequirementSetUseCaseOutput> ExecuteAsync(UpdateDraftPositionRequirementSetUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var set = await (from s in _context.GetDbSet<PositionRequirementSet>()
                         join p in _context.JobPositions on s.JobPositionId equals p.Id
                         where s.Id == input.Id && p.OrganizationId == orgId
                         select s).FirstOrDefaultAsync();

        if (set == null)
        {
            throw new NotFoundException($"Position requirement set with ID '{input.Id}' not found.");
        }

        if (set.Status != Statuses.PositionRequirementSet.Draft)
        {
            throw new BadRequestException($"Cannot update position requirement set with status '{set.Status}'. Only DRAFT sets can be modified.");
        }

        if (input.EffectiveTo.HasValue && input.EffectiveFrom.HasValue && input.EffectiveTo < input.EffectiveFrom)
        {
            throw new BadRequestException("EffectiveTo must be greater than or equal to EffectiveFrom.");
        }

        if (input.Items == null || input.Items.Count == 0)
        {
            throw new BadRequestException("At least one competency requirement item is required.");
        }

        var compIds = input.Items.Select(i => i.CompetencyId).Distinct().ToList();
        if (compIds.Count != input.Items.Count)
        {
            throw new BadRequestException("Duplicate competencies are not allowed in the same requirement set.");
        }

        var validCompCount = await (from comp in _context.GetDbSet<Domain.Entities.Competency>()
                                    join cat in _context.GetDbSet<CompetencyCategory>() on comp.CategoryId equals cat.Id
                                    where compIds.Contains(comp.Id) && cat.OrganizationId == orgId && comp.Status != Statuses.Competency.Archived
                                    select comp.Id).CountAsync();

        if (validCompCount != compIds.Count)
        {
            throw new BadRequestException("One or more competencies do not exist, belong to another organization, or are archived.");
        }

        set.EffectiveFrom = input.EffectiveFrom;
        set.EffectiveTo = input.EffectiveTo;
        set.ReviewDate = input.ReviewDate;
        set.RowVersion += 1;

        var existingItems = await _context.GetDbSet<PositionRequirementItem>()
            .Where(i => i.RequirementSetId == set.Id)
            .ToListAsync();

        _context.GetDbSet<PositionRequirementItem>().RemoveRange(existingItems);

        foreach (var item in input.Items)
        {
            _context.GetDbSet<PositionRequirementItem>().Add(new PositionRequirementItem
            {
                RequirementSetId = set.Id,
                CompetencyId = item.CompetencyId,
                RequiredLevel = item.RequiredLevel,
                WeightPercent = item.WeightPercent,
                IsMandatory = item.IsMandatory,
                RequiresPracticalEvidence = item.RequiresPracticalEvidence,
                Note = item.Note?.Trim()
            });
        }

        await _context.SaveChangesAsync();

        return new UpdateDraftPositionRequirementSetUseCaseOutput
        {
            Id = set.Id,
            VersionNo = set.VersionNo,
            Status = set.Status
        };
    }
}
