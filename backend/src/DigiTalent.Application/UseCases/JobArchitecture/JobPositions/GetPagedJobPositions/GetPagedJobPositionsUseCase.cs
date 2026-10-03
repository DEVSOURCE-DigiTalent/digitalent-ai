using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetPagedJobPositionsUseCase : IUseCase<GetPagedJobPositionsUseCaseInput, GetPagedJobPositionsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPagedJobPositionsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPagedJobPositionsUseCaseOutput> ExecuteAsync(GetPagedJobPositionsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.JobPositions
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId);

        // Status filter (default: exclude archived)
        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(p => p.Status == status);
        }
        else
        {
            query = query.Where(p => p.Status != Statuses.MasterData.Archived);
        }

        if (input.JobFamilyId.HasValue)
        {
            query = query.Where(p => p.JobFamilyId == input.JobFamilyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(p => p.Code.ToLower().Contains(search) || p.Name.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = input.PageSize < 1 ? 10 : input.PageSize;

        var items = await query
            .OrderBy(p => p.Code)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new JobPositionListItem
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                JobFamilyId = p.JobFamilyId,
                JobFamilyName = _context.JobFamilies
                    .Where(f => f.Id == p.JobFamilyId)
                    .Select(f => f.Name)
                    .FirstOrDefault(),
                Status = p.Status,
            })
            .ToListAsync();

        return new GetPagedJobPositionsUseCaseOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
