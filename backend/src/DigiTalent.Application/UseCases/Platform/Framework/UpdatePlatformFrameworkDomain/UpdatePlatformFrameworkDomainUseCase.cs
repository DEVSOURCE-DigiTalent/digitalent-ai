using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Sửa lĩnh vực: the new name applies at once; the description goes to the draft and reaches organizations when the
/// framework is published (PublishPlatformFramework).
/// </summary>
public class UpdatePlatformFrameworkDomainUseCase : IUseCase<UpdatePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public UpdatePlatformFrameworkDomainUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkDetail> ExecuteAsync(UpdatePlatformFrameworkDomainUseCaseInput input)
    {
        var framework = await PlatformFrameworkGuard.ActiveAsync(_context, input.FrameworkId);
        var domains = await _context.PlatformFrameworkDomains
            .Where(d => d.FrameworkId == framework.Id && d.Status == Statuses.PlatformFrameworkDomain.Active)
            .ToListAsync();
        var domain = domains.FirstOrDefault(d => d.Id == input.DomainId)
            ?? throw new NotFoundException("Không tìm thấy lĩnh vực trong khung này.");

        var name = input.Name.Trim();
        if (domains.Any(d => d.Id != domain.Id && string.Equals(d.Name.Trim(), name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new BadRequestException("Khung đã có lĩnh vực cùng tên.", "name", "DUPLICATE_DOMAIN_NAME");
        }

        var changes = new List<object>();
        if (name != domain.Name)
        {
            changes.Add(new { field = "name", from = domain.Name, to = name });
            domain.Name = name;
        }

        if (input.Description != null && input.Description.Trim() != domain.DraftDescription)
        {
            changes.Add(new { field = "draftDescription" });
            domain.DraftDescription = input.Description.Trim();
        }

        if (changes.Count > 0)
        {
            await _context.SaveChangesAsync();
            await _auditService.LogAsync(
                "PLATFORM_FRAMEWORK_DOMAIN_UPDATED",
                "platform_framework_domains",
                domain.Id,
                newValues: new { code = domain.Code, changes },
                entityLabel: $"{domain.Code} · {domain.Name}");
        }

        return await PlatformFrameworkReader.ReadDetailAsync(_context, framework.Id);
    }
}
