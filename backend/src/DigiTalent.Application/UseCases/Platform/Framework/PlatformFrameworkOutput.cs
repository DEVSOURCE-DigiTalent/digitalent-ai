using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>
/// The six-domain Digital AI standard: current version, domains (published + draft) and release history.
/// </summary>
public class PlatformFrameworkOutput
{
    public int CurrentVersion { get; set; }
    public bool HasDraft => Domains.Any(d => d.HasDraft);
    public int LevelCount { get; set; } = 3;
    public List<PlatformFrameworkDomainItem> Domains { get; set; } = new();
    public List<PlatformFrameworkReleaseItem> Releases { get; set; } = new();

    public static async Task<PlatformFrameworkOutput> ReadAsync(IApplicationDbContext context)
    {
        var domains = await context.PlatformFrameworkDomains.AsNoTracking().OrderBy(d => d.SortOrder).ToListAsync();
        var releases = await (
            from release in context.PlatformFrameworkReleases.AsNoTracking()
            join user in context.Users on release.PublishedByUserId equals user.Id into users
            from user in users.DefaultIfEmpty()
            orderby release.VersionNo descending
            select new PlatformFrameworkReleaseItem
            {
                VersionNo = release.VersionNo,
                ReleaseNote = release.ReleaseNote,
                PublishedByEmail = user == null ? null : user.Email,
                PublishedAt = release.PublishedAt,
            }).ToListAsync();

        return new PlatformFrameworkOutput
        {
            CurrentVersion = releases.Count == 0 ? 0 : releases.Max(r => r.VersionNo),
            Domains = domains.Select(d => new PlatformFrameworkDomainItem
            {
                Code = d.Code,
                Name = d.Name,
                SortOrder = d.SortOrder,
                PublishedDescription = d.PublishedDescription,
                DraftDescription = d.DraftDescription,
            }).ToList(),
            Releases = releases,
        };
    }
}
