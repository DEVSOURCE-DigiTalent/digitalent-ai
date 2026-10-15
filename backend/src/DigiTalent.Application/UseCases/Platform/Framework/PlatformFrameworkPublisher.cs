using System.Text.Json;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// Publishes a framework as its next version: draft descriptions become published, the framework becomes
/// PUBLISHED and a release snapshot is recorded. Used by PublishPlatformFramework and when a catalog version
/// publishes the first courses of a draft framework.
/// </summary>
public static class PlatformFrameworkPublisher
{
    public static PlatformFrameworkRelease Publish(
        PlatformFramework framework, IReadOnlyCollection<PlatformFrameworkDomain> domains, Guid? userId, string? releaseNote, DateTimeOffset now)
    {
        foreach (var domain in domains)
        {
            domain.PublishedDescription = domain.DraftDescription;
        }

        framework.Status = Statuses.PlatformFramework.Published;
        framework.CurrentVersionNo += 1;
        return new PlatformFrameworkRelease
        {
            FrameworkId = framework.Id,
            VersionNo = framework.CurrentVersionNo,
            Snapshot = JsonSerializer.Serialize(domains.OrderBy(d => d.SortOrder)
                .Select(d => new { code = d.Code, name = d.Name, description = d.PublishedDescription })),
            ReleaseNote = string.IsNullOrWhiteSpace(releaseNote) ? null : releaseNote.Trim(),
            PublishedByUserId = userId,
            PublishedAt = now,
        };
    }
}
