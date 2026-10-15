using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Xóa lĩnh vực: archives a domain (no hard delete of business data). Only a domain without courses in the version in
/// use or in the draft can go — published courses stay in every later version — and the framework keeps at least one.
/// </summary>
public class ArchivePlatformFrameworkDomainUseCase : IUseCase<ArchivePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public ArchivePlatformFrameworkDomainUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkDetail> ExecuteAsync(ArchivePlatformFrameworkDomainUseCaseInput input)
    {
        var framework = await PlatformFrameworkGuard.ActiveAsync(_context, input.FrameworkId);
        var domains = await _context.PlatformFrameworkDomains
            .Where(d => d.FrameworkId == framework.Id && d.Status == Statuses.PlatformFrameworkDomain.Active)
            .ToListAsync();
        var domain = domains.FirstOrDefault(d => d.Id == input.DomainId)
            ?? throw new NotFoundException("Không tìm thấy lĩnh vực trong khung này.");

        var courseCount = await (
                from catalogCourse in _context.PlatformCatalogCourses
                join version in _context.PlatformCatalogVersions on catalogCourse.VersionId equals version.Id
                where catalogCourse.DomainId == domain.Id && version.Status != Statuses.PlatformCatalogVersion.Retired
                select catalogCourse.CourseId)
            .Distinct()
            .CountAsync();
        if (courseCount > 0)
        {
            throw new BadRequestException(
                $"Lĩnh vực còn {courseCount} khóa học trong phiên bản đang dùng hoặc bản nháp nên không xóa được.",
                "domainId",
                "DOMAIN_HAS_COURSES");
        }

        if (domains.Count <= 1)
        {
            throw new BadRequestException("Khung cần ít nhất một lĩnh vực.", "domainId", "LAST_DOMAIN");
        }

        domain.Status = Statuses.PlatformFrameworkDomain.Archived;
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_FRAMEWORK_DOMAIN_ARCHIVED",
            "platform_framework_domains",
            domain.Id,
            oldValues: new { status = Statuses.PlatformFrameworkDomain.Active },
            newValues: new { status = domain.Status, code = domain.Code },
            entityLabel: $"{domain.Code} · {domain.Name}");

        return await PlatformFrameworkReader.ReadDetailAsync(_context, framework.Id);
    }
}
