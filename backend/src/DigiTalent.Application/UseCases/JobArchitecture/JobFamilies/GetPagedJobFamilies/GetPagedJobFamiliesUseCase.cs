using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class GetPagedJobFamiliesUseCase : IUseCase<GetPagedJobFamiliesUseCaseInput, GetPagedJobFamiliesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPagedJobFamiliesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPagedJobFamiliesUseCaseOutput> ExecuteAsync(GetPagedJobFamiliesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.JobFamilies
            .AsNoTracking()
            .Where(f => f.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            query = query.Where(f => f.Status == input.Status);
        }
        else
        {
            query = query.Where(f => f.Status != Statuses.MasterData.Archived);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(f => f.Name.ToLower().Contains(search) || f.Code.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var items = await query
            .OrderBy(f => f.Name)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new JobFamilyListItemDto
            {
                Id = f.Id,
                Code = f.Code,
                Name = f.Name,
                Description = f.Description,
                Status = f.Status,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return new GetPagedJobFamiliesUseCaseOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}
