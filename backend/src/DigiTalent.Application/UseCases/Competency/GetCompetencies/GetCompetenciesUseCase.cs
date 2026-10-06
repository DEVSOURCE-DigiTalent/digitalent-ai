using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class GetCompetenciesUseCase : IUseCase<GetCompetenciesUseCaseInput, GetCompetenciesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCompetenciesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCompetenciesUseCaseOutput> ExecuteAsync(GetCompetenciesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var categories = _context.GetDbSet<CompetencyCategory>()
            .AsNoTracking()
            .Where(cat => cat.OrganizationId == organizationId);

        var competencies = _context.GetDbSet<Domain.Entities.Competency>()
            .AsNoTracking();

        var query = from c in competencies
                    join cat in categories on c.CategoryId equals cat.Id
                    select new { Competency = c, Category = cat };

        if (input.CategoryId.HasValue)
        {
            query = query.Where(x => x.Competency.CategoryId == input.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.CompetencyType))
        {
            var type = input.CompetencyType.Trim().ToUpper();
            query = query.Where(x => x.Competency.CompetencyType == type);
        }

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(x => x.Competency.Status == status);
        }
        else
        {
            query = query.Where(x => x.Competency.Status != Statuses.Competency.Archived);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x => x.Competency.Code.ToLower().Contains(search) || x.Competency.Name.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var criteriaSet = _context.GetDbSet<CompetencyLevelCriterion>().AsNoTracking();
        var tt02Mappings = Tt02Mappings.Query(_context);

        var items = await query
            .OrderBy(x => x.Category.SortOrder)
            .ThenBy(x => x.Competency.Code)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CompetencyListItem
            {
                Id = x.Competency.Id,
                CategoryId = x.Competency.CategoryId,
                CategoryName = x.Category.Name,
                CategoryCode = x.Category.Code,
                CategorySortOrder = x.Category.SortOrder,
                FrameworkCode = tt02Mappings.Where(m => m.CompetencyId == x.Competency.Id).Select(m => m.SourceCode).FirstOrDefault(),
                Code = x.Competency.Code,
                Name = x.Competency.Name,
                Description = x.Competency.Description,
                CompetencyType = x.Competency.CompetencyType,
                Status = x.Competency.Status,
                CriteriaCount = criteriaSet.Count(cr => cr.CompetencyId == x.Competency.Id)
            })
            .ToListAsync();

        return new GetCompetenciesUseCaseOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}
