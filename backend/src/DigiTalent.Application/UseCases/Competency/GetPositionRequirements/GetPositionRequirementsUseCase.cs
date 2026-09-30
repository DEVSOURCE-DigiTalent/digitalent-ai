using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class GetPositionRequirementsUseCase : IUseCase<GetPositionRequirementsUseCaseInput, GetPositionRequirementsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPositionRequirementsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPositionRequirementsUseCaseOutput> ExecuteAsync(GetPositionRequirementsUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var position = await _context.JobPositions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == input.PositionId && p.OrganizationId == orgId);

        if (position == null)
        {
            throw new NotFoundException($"Job position with ID '{input.PositionId}' not found.");
        }

        var setsQuery = _context.GetDbSet<PositionRequirementSet>()
            .AsNoTracking()
            .Where(s => s.JobPositionId == input.PositionId);

        PositionRequirementSet? set;

        if (input.VersionNo.HasValue)
        {
            set = await setsQuery.FirstOrDefaultAsync(s => s.VersionNo == input.VersionNo.Value);
        }
        else
        {
            // Prefer ACTIVE, otherwise latest version (e.g. DRAFT)
            set = await setsQuery.FirstOrDefaultAsync(s => s.Status == Statuses.PositionRequirementSet.Active)
                  ?? await setsQuery.OrderByDescending(s => s.VersionNo).FirstOrDefaultAsync();
        }

        if (set == null)
        {
            return new GetPositionRequirementsUseCaseOutput
            {
                JobPositionId = position.Id,
                JobPositionCode = position.Code,
                JobPositionName = position.Name,
                Status = string.Empty,
                Items = new List<PositionRequirementItemDto>()
            };
        }

        var versions = await setsQuery
            .OrderByDescending(s => s.VersionNo)
            .Select(s => new PositionRequirementVersionDto { Id = s.Id, VersionNo = s.VersionNo, Status = s.Status })
            .ToListAsync();

        var tt02Mappings = Tt02Mappings.Query(_context);
        var items = await (from item in _context.GetDbSet<PositionRequirementItem>().AsNoTracking()
                           where item.RequirementSetId == set.Id
                           join comp in _context.GetDbSet<Domain.Entities.Competency>().AsNoTracking() on item.CompetencyId equals comp.Id
                           join cat in _context.GetDbSet<CompetencyCategory>().AsNoTracking() on comp.CategoryId equals cat.Id
                           select new PositionRequirementItemDto
                           {
                               Id = item.Id,
                               CompetencyId = item.CompetencyId,
                               CompetencyCode = comp.Code,
                               CompetencyName = comp.Name,
                               CompetencyType = comp.CompetencyType,
                               CategoryId = comp.CategoryId,
                               CategoryName = cat.Name,
                               CategorySortOrder = cat.SortOrder,
                               FrameworkCode = tt02Mappings.Where(m => m.CompetencyId == comp.Id).Select(m => m.SourceCode).FirstOrDefault(),
                               RequiredLevel = item.RequiredLevel,
                               WeightPercent = item.WeightPercent,
                               IsMandatory = item.IsMandatory,
                               RequiresPracticalEvidence = item.RequiresPracticalEvidence,
                               Note = item.Note
                           }).ToListAsync();

        return new GetPositionRequirementsUseCaseOutput
        {
            Id = set.Id,
            JobPositionId = position.Id,
            JobPositionCode = position.Code,
            JobPositionName = position.Name,
            VersionNo = set.VersionNo,
            Status = set.Status,
            EffectiveFrom = set.EffectiveFrom,
            EffectiveTo = set.EffectiveTo,
            ReviewDate = set.ReviewDate,
            CreatedByUserId = set.CreatedByUserId,
            ActivatedByUserId = set.ActivatedByUserId,
            ActivatedAt = set.ActivatedAt,
            Items = items,
            Versions = versions
        };
    }
}
