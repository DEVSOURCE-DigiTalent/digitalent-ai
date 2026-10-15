using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Saves the draft description of the framework's domains (published with the next framework version).
/// </summary>
public class SavePlatformFrameworkDraftUseCase : IUseCase<SavePlatformFrameworkDraftUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public SavePlatformFrameworkDraftUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkDetail> ExecuteAsync(SavePlatformFrameworkDraftUseCaseInput input)
    {
        var framework = await PlatformFrameworkGuard.ActiveAsync(_context, input.FrameworkId);
        var domains = await _context.PlatformFrameworkDomains.Where(d => d.FrameworkId == framework.Id && d.Status == Statuses.PlatformFrameworkDomain.Active).ToListAsync();
        var changed = new List<string>();

        foreach (var item in input.Domains)
        {
            var domain = domains.FirstOrDefault(d => d.Id == item.DomainId)
                ?? throw new BadRequestException("Lĩnh vực không thuộc khung này.", "domains", "DOMAIN_NOT_FOUND");
            var description = item.Description.Trim();
            if (domain.DraftDescription == description) continue;
            domain.DraftDescription = description;
            changed.Add(domain.Code);
        }

        if (changed.Count > 0)
        {
            await _context.SaveChangesAsync();
            await _auditService.LogAsync(
                "PLATFORM_FRAMEWORK_DRAFT_SAVED",
                "platform_frameworks",
                framework.Id,
                newValues: new { changed },
                entityLabel: framework.Name);
        }

        return await PlatformFrameworkReader.ReadDetailAsync(_context, framework.Id);
    }
}
