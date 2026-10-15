using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>Adds a domain at the end of a framework; its description is a draft until the framework is published.</summary>
public class AddPlatformFrameworkDomainUseCase : IUseCase<AddPlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public AddPlatformFrameworkDomainUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkDetail> ExecuteAsync(AddPlatformFrameworkDomainUseCaseInput input)
    {
        var framework = await PlatformFrameworkGuard.ActiveAsync(_context, input.FrameworkId);
        var domains = await _context.PlatformFrameworkDomains.Where(d => d.FrameworkId == framework.Id).ToListAsync();
        if (domains.Any(d => d.Status == Statuses.PlatformFrameworkDomain.Active && string.Equals(d.Name.Trim(), input.Name.Trim(), StringComparison.OrdinalIgnoreCase)))
        {
            throw new BadRequestException("Khung đã có lĩnh vực cùng tên.", "name", "DUPLICATE_DOMAIN_NAME");
        }

        var number = domains.Count + 1;
        var code = $"{framework.Code}_D{number}";
        while (await _context.PlatformFrameworkDomains.AnyAsync(d => d.Code == code))
        {
            code = $"{framework.Code}_D{++number}";
        }

        var domain = new PlatformFrameworkDomain
        {
            FrameworkId = framework.Id,
            Code = code,
            Name = input.Name.Trim(),
            SortOrder = (domains.Count == 0 ? 0 : domains.Max(d => d.SortOrder)) + 1,
            Status = Statuses.PlatformFrameworkDomain.Active,
            PublishedDescription = string.Empty,
            DraftDescription = input.Description?.Trim() ?? string.Empty,
        };
        _context.PlatformFrameworkDomains.Add(domain);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_FRAMEWORK_DOMAIN_ADDED",
            "platform_framework_domains",
            domain.Id,
            newValues: new { framework = framework.Code, code, name = domain.Name },
            entityLabel: framework.Name);

        return await PlatformFrameworkReader.ReadDetailAsync(_context, framework.Id);
    }
}
