using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class CreateDraftPositionRequirementSetUseCase : IUseCase<CreateDraftPositionRequirementSetUseCaseInput, CreateDraftPositionRequirementSetUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateDraftPositionRequirementSetUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateDraftPositionRequirementSetUseCaseOutput> ExecuteAsync(CreateDraftPositionRequirementSetUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? Guid.Empty;

        var position = await _context.JobPositions
            .FirstOrDefaultAsync(p => p.Id == input.JobPositionId && p.OrganizationId == orgId);

        if (position == null || position.Status == Statuses.MasterData.Archived)
        {
            throw new BadRequestException("Job position does not exist or is archived in your organization.");
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

        var maxVersion = await _context.GetDbSet<PositionRequirementSet>()
            .Where(s => s.JobPositionId == input.JobPositionId)
            .Select(s => (int?)s.VersionNo)
            .MaxAsync() ?? 0;

        var set = new PositionRequirementSet
        {
            JobPositionId = input.JobPositionId,
            VersionNo = maxVersion + 1,
            Status = Statuses.PositionRequirementSet.Draft,
            EffectiveFrom = input.EffectiveFrom,
            EffectiveTo = input.EffectiveTo,
            ReviewDate = input.ReviewDate,
            CreatedByUserId = userId,
            RowVersion = 1
        };

        foreach (var item in input.Items)
        {
            set.Items.Add(new PositionRequirementItem
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

        _context.GetDbSet<PositionRequirementSet>().Add(set);
        await _context.SaveChangesAsync();

        return new CreateDraftPositionRequirementSetUseCaseOutput
        {
            Id = set.Id,
            VersionNo = set.VersionNo,
            Status = set.Status
        };
    }
}
