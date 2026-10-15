using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Publishes the drafts as the next framework version (snapshot kept in platform_framework_releases).
/// </summary>
public class PublishPlatformFrameworkUseCase : IUseCase<PublishPlatformFrameworkUseCaseInput, PlatformFrameworkOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public PublishPlatformFrameworkUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<PlatformFrameworkOutput> ExecuteAsync(PublishPlatformFrameworkUseCaseInput input)
    {
        var domains = await _context.PlatformFrameworkDomains.OrderBy(d => d.SortOrder).ToListAsync();
        if (domains.All(d => d.DraftDescription == d.PublishedDescription))
            throw new BadRequestException("There is no draft change to publish.", "domains", "NO_DRAFT_CHANGES");

        var currentVersion = await _context.PlatformFrameworkReleases.Select(r => (int?)r.VersionNo).MaxAsync() ?? 0;
        var nextVersion = currentVersion + 1;
        foreach (var domain in domains) domain.PublishedDescription = domain.DraftDescription;

        var release = new PlatformFrameworkRelease
        {
            VersionNo = nextVersion,
            Snapshot = JsonSerializer.Serialize(domains.Select(d => new { code = d.Code, name = d.Name, description = d.PublishedDescription })),
            ReleaseNote = string.IsNullOrWhiteSpace(input.ReleaseNote) ? null : input.ReleaseNote.Trim(),
            PublishedByUserId = _currentUser.UserId,
            PublishedAt = DateTimeOffset.UtcNow,
        };
        _context.PlatformFrameworkReleases.Add(release);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_FRAMEWORK_PUBLISHED",
            "platform_framework_releases",
            release.Id,
            new { versionNo = currentVersion },
            new { versionNo = nextVersion, reason = release.ReleaseNote },
            $"Khung chuẩn Digital AI v{nextVersion}.0");

        return await PlatformFrameworkOutput.ReadAsync(_context);
    }
}
