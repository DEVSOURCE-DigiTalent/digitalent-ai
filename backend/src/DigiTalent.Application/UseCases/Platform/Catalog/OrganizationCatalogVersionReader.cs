using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using OrganizationEntity = DigiTalent.Domain.Entities.Organization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Reads the version an organization learns from and what moving it to another published version changes.</summary>
public static class OrganizationCatalogVersionReader
{
    public static async Task<(OrganizationEntity Organization, List<PlatformCatalogVersion> Versions, PlatformCatalogVersion Latest, int Applied)>
        LoadAsync(IApplicationDbContext context, PlatformCatalogApplier applier, Guid organizationId)
    {
        var organization = await context.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == organizationId)
                           ?? throw new NotFoundException("Không tìm thấy tổ chức.");
        var versions = await context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status != Statuses.PlatformCatalogVersion.Draft)
            .OrderByDescending(v => v.VersionNo)
            .ToListAsync();
        var latest = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Current)
                     ?? throw new BadRequestException("Chưa có phiên bản chương trình học nào được công bố.", "versionNo", "NO_CURRENT_VERSION");
        var applied = (await applier.VersionsAsync(new[] { organizationId }, latest.VersionNo))[organizationId];
        return (organization, versions, latest, applied);
    }

    public static async Task<OrganizationCatalogVersionOutput> ReadAsync(IApplicationDbContext context, Guid organizationId, int? targetVersionNo)
    {
        var applier = new PlatformCatalogApplier(context);
        var (organization, versions, latest, applied) = await LoadAsync(context, applier, organizationId);
        var target = targetVersionNo ?? latest.VersionNo;
        if (versions.All(v => v.VersionNo != target))
        {
            throw new NotFoundException($"Không tìm thấy phiên bản đã công bố v{target}.");
        }

        var kept = applied == latest.VersionNo ? null : await CourseUpdateReader.ReadKeptAsync(context, organizationId);
        return new OrganizationCatalogVersionOutput
        {
            Kept = kept?.VersionNo == latest.VersionNo ? kept : null,
            OrganizationId = organization.Id,
            OrganizationName = organization.Name,
            Provisioned = await applier.IsProvisionedAsync(organization.Id),
            VersionNo = applied,
            LatestVersionNo = latest.VersionNo,
            Versions = versions.Select(Option).ToList(),
            TargetVersionNo = target,
            Changes = await applier.PlanAsync(applied, target),
        };
    }

    public static PlatformCatalogVersionOption Option(PlatformCatalogVersion version) => new()
    {
        VersionNo = version.VersionNo,
        Status = version.Status,
        PublishedAt = version.PublishedAt,
        ReleaseNote = version.ReleaseNote,
    };
}
