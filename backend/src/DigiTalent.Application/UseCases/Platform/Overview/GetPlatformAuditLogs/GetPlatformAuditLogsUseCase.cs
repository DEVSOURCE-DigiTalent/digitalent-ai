using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Overview;

/// <summary>
/// Platform Admin / Nhật ký kiểm tra: audit entries with actor, time and reason.
/// </summary>
public class GetPlatformAuditLogsUseCase : IUseCase<GetPlatformAuditLogsUseCaseInput, GetPlatformAuditLogsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformAuditLogsUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformAuditLogsUseCaseOutput> ExecuteAsync(GetPlatformAuditLogsUseCaseInput input)
    {
        var query = PlatformAuditReader.Query(_context);
        if (input.Scope != "all") query = query.Where(l => l.OrganizationId == null);
        if (!string.IsNullOrWhiteSpace(input.Action)) query = query.Where(l => l.Action == input.Action.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(l =>
                l.Action.ToLower().Contains(search)
                || (l.EntityLabel != null && l.EntityLabel.ToLower().Contains(search))
                || (l.ActorEmail != null && l.ActorEmail.ToLower().Contains(search)));
        }

        return new GetPlatformAuditLogsUseCaseOutput
        {
            TotalItems = await query.CountAsync(),
            Items = await query.Skip((input.PageIndex - 1) * input.PageSize).Take(input.PageSize).ToListAsync(),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
        };
    }
}
