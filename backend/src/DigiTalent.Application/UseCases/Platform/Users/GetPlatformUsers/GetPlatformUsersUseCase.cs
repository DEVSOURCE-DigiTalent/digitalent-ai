using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

/// <summary>
/// Platform Admin / Người dùng: every account across organizations and personal learners.
/// </summary>
public class GetPlatformUsersUseCase : IUseCase<GetPlatformUsersUseCaseInput, GetPlatformUsersUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformUsersUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformUsersUseCaseOutput> ExecuteAsync(GetPlatformUsersUseCaseInput input)
    {
        var query = PlatformUserReader.Query(_context, input);
        var total = await query.CountAsync();
        var pageIds = await query
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .Select(u => u.Id)
            .ToListAsync();

        return new GetPlatformUsersUseCaseOutput
        {
            Items = await PlatformUserReader.ReadAsync(_context, pageIds),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = total,
        };
    }
}
