using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Saves draft descriptions. The published version is unchanged until PublishPlatformFramework.
/// </summary>
public class SavePlatformFrameworkDraftUseCase : IUseCase<SavePlatformFrameworkDraftUseCaseInput, PlatformFrameworkOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public SavePlatformFrameworkDraftUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkOutput> ExecuteAsync(SavePlatformFrameworkDraftUseCaseInput input)
    {
        var domains = await _context.PlatformFrameworkDomains.ToListAsync();
        var changed = new List<string>();
        foreach (var item in input.Domains)
        {
            var code = item.Code.Trim().ToUpperInvariant();
            var domain = domains.FirstOrDefault(d => d.Code == code)
                ?? throw new BadRequestException($"Domain '{item.Code}' does not exist.", "domains", "DOMAIN_NOT_FOUND");
            var description = item.Description.Trim();
            if (domain.DraftDescription == description) continue;
            domain.DraftDescription = description;
            changed.Add(code);
        }

        if (changed.Count > 0)
        {
            await _context.SaveChangesAsync();
            await _auditService.LogAsync(
                "PLATFORM_FRAMEWORK_DRAFT_SAVED",
                "platform_framework_domains",
                newValues: new { domains = changed },
                entityLabel: "Khung chuẩn Digital AI");
        }

        return await PlatformFrameworkOutput.ReadAsync(_context);
    }
}
