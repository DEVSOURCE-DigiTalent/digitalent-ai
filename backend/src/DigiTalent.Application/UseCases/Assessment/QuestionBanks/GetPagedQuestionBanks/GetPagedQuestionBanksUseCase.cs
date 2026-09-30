using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

public class GetPagedQuestionBanksUseCase : IUseCase<GetPagedQuestionBanksUseCaseInput, GetPagedQuestionBanksUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPagedQuestionBanksUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPagedQuestionBanksUseCaseOutput> ExecuteAsync(GetPagedQuestionBanksUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.QuestionBanks
            .AsNoTracking()
            .Where(b => b.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var bankIds = await query
            .OrderBy(b => b.Title)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new QuestionBankListItemDto
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        var idList = bankIds.Select(b => b.Id).ToList();
        var counts = await _context.Questions
            .Where(q => idList.Contains(q.BankId))
            .GroupBy(q => q.BankId)
            .Select(g => new { BankId = g.Key, Count = g.Count() })
            .ToListAsync();

        foreach (var bank in bankIds)
        {
            bank.QuestionCount = counts.FirstOrDefault(c => c.BankId == bank.Id)?.Count ?? 0;
        }

        return new GetPagedQuestionBanksUseCaseOutput
        {
            Items = bankIds,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}
