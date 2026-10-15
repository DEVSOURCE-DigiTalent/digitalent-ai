using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Publishes the framework's draft descriptions as its next version (snapshot kept in platform_framework_releases).
/// A framework never published can be published without description changes; every domain needs a description.
/// </summary>
public class PublishPlatformFrameworkUseCase : IUseCase<PublishPlatformFrameworkUseCaseInput, PlatformFrameworkDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly TimeProvider _clock;

    public PublishPlatformFrameworkUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService, TimeProvider clock)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _clock = clock;
    }

    public async Task<PlatformFrameworkDetail> ExecuteAsync(PublishPlatformFrameworkUseCaseInput input)
    {
        var framework = await PlatformFrameworkGuard.ActiveAsync(_context, input.FrameworkId);
        var domains = await _context.PlatformFrameworkDomains.Where(d => d.FrameworkId == framework.Id && d.Status == Statuses.PlatformFrameworkDomain.Active).OrderBy(d => d.SortOrder).ToListAsync();
        if (domains.Count == 0)
            throw new BadRequestException("Khung chưa có lĩnh vực nào.", "domains", "NO_DOMAINS");
        if (domains.Any(d => d.DraftDescription.Trim().Length < 10))
            throw new BadRequestException("Mỗi lĩnh vực cần mô tả ít nhất 10 ký tự trước khi công bố.", "domains", "DOMAIN_DESCRIPTION_REQUIRED");
        if (framework.Status == Statuses.PlatformFramework.Published && domains.All(d => d.DraftDescription == d.PublishedDescription))
            throw new BadRequestException("Không có thay đổi nào để công bố.", "domains", "NO_DRAFT_CHANGES");

        var previous = framework.CurrentVersionNo;
        var release = PlatformFrameworkPublisher.Publish(framework, domains, _currentUser.UserId, input.ReleaseNote, _clock.GetUtcNow());
        _context.PlatformFrameworkReleases.Add(release);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_FRAMEWORK_PUBLISHED",
            "platform_framework_releases",
            release.Id,
            new { versionNo = previous },
            new { versionNo = release.VersionNo, reason = release.ReleaseNote },
            $"{framework.Name} v{release.VersionNo}");

        return await PlatformFrameworkReader.ReadDetailAsync(_context, framework.Id);
    }
}
