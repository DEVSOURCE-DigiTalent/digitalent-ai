using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetMyFeedbacksUseCase : IUseCase<GetMyFeedbacksInput, PagedList<FeedbackDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyFeedbacksUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PagedList<FeedbackDto>> ExecuteAsync(GetMyFeedbacksInput input)
    {
        var query = _context.UserFeedbacks.AsNoTracking()
            .Where(f => f.UserId == _currentUser.UserId!.Value)
            .OrderByDescending(f => f.CreatedAt);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(f => new FeedbackDto
            {
                Id = f.Id,
                Type = f.Type,
                Title = f.Title,
                Description = f.Description,
                PageUrl = f.PageUrl,
                Status = f.Status,
                Rating = f.Rating,
                Screenshots = f.Screenshots,
                AdminNote = f.AdminNote,
                CreatedAt = f.CreatedAt,
                ResolvedAt = f.ResolvedAt,
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
