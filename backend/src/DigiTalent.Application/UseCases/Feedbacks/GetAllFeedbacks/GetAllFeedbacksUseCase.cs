using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetAllFeedbacksInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Status { get; set; }
    public string? Type { get; set; }
    public string? Search { get; set; }
}

public class GetAllFeedbacksUseCase : IUseCase<GetAllFeedbacksInput, PagedList<FeedbackDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllFeedbacksUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedList<FeedbackDto>> ExecuteAsync(GetAllFeedbacksInput input)
    {
        var query = from f in _context.UserFeedbacks.AsNoTracking()
                    join u in _context.Users.AsNoTracking() on f.UserId equals u.Id
                    join o in _context.Organizations.AsNoTracking() on f.OrganizationId equals o.Id into orgs
                    from o in orgs.DefaultIfEmpty()
                    select new { f, u, o };

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(x => x.f.Status == input.Status);

        if (!string.IsNullOrWhiteSpace(input.Type))
            query = query.Where(x => x.f.Type == input.Type);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.ToLower();
            query = query.Where(x =>
                x.f.Title.ToLower().Contains(search) ||
                x.u.DisplayName.ToLower().Contains(search) ||
                x.u.Email.ToLower().Contains(search) ||
                (x.o != null && x.o.Name.ToLower().Contains(search)));
        }

        var ordered = query.OrderByDescending(x => x.f.CreatedAt);
        var totalItems = await ordered.CountAsync();

        var items = await ordered
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(x => new FeedbackDto
            {
                Id = x.f.Id,
                Type = x.f.Type,
                Title = x.f.Title,
                Description = x.f.Description,
                PageUrl = x.f.PageUrl,
                Status = x.f.Status,
                Rating = x.f.Rating,
                Screenshots = x.f.Screenshots,
                AdminNote = x.f.AdminNote,
                CreatedAt = x.f.CreatedAt,
                ResolvedAt = x.f.ResolvedAt,
                UserName = x.u.DisplayName,
                UserEmail = x.u.Email,
                OrganizationName = x.o != null ? x.o.Name : null,
            })
            .ToListAsync();

        return new PagedList<FeedbackDto>
        {
            Items = items,
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = totalItems,
        };
    }
}
