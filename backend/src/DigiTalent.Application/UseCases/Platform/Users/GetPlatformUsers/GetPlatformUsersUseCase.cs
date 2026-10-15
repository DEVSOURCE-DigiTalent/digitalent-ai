using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

/// <summary>
/// Platform Admin / Người dùng: every account across organizations and personal learners, with the trial follow-up
/// of personal accounts (filter <c>trial</c> = ACTIVE / ENDING_SOON / ENDED / ANY, and the trial counts).
/// </summary>
public class GetPlatformUsersUseCase : IUseCase<GetPlatformUsersUseCaseInput, GetPlatformUsersUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _clock;

    public GetPlatformUsersUseCase(IApplicationDbContext context, TimeProvider clock)
    {
        _context = context;
        _clock = clock;
    }

    public async Task<GetPlatformUsersUseCaseOutput> ExecuteAsync(GetPlatformUsersUseCaseInput input)
    {
        var now = _clock.GetUtcNow();
        var query = PlatformUserReader.Query(_context, input, now);
        var total = await query.CountAsync();
        var pageIds = await query
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(u => u.Id)
            .ToListAsync();

        return new GetPlatformUsersUseCaseOutput
        {
            Items = await PlatformUserReader.ReadAsync(_context, pageIds, now),
            Trials = await PlatformUserTrials.SummarizeAsync(_context, now),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = total,
        };
    }
}
