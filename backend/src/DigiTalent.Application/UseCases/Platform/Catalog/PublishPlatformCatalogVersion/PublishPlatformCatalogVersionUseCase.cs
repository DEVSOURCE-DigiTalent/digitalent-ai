using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Publishes the draft: the version in use becomes RETIRED, the draft becomes CURRENT (the anchor moves), the
/// mirror in platform_courses takes the new course fields, and a draft framework whose courses are published here
/// is published too. Refused while the publish check has a BLOCK item.
/// </summary>
public class PublishPlatformCatalogVersionUseCase : IUseCase<PublishPlatformCatalogVersionUseCaseInput, PlatformCatalogVersionDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformPublishChecker _checker;
    private readonly IAuditService _auditService;

    public PublishPlatformCatalogVersionUseCase(
        IApplicationDbContext context, PlatformCatalogEditor editor, PlatformPublishChecker checker, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _checker = checker;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogVersionDetail> ExecuteAsync(PublishPlatformCatalogVersionUseCaseInput input)
    {
        var draft = await _editor.DraftAsync(input.VersionNo);
        var check = await _checker.CheckAsync(draft);
        if (!check.CanPublish)
        {
            throw new BadRequestException("Bản nháp còn mục phải sửa trước khi công bố.", "version", "PUBLISH_BLOCKED");
        }

        var now = _editor.Now;
        var current = await _context.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.Status == Statuses.PlatformCatalogVersion.Current);
        var courses = await _context.PlatformCatalogCourses.Where(c => c.VersionId == draft.Id).ToListAsync();
        var changed = courses.Where(c => c.ChangeKind != PlatformCatalog.ChangeKind.Unchanged).ToList();
        var courseIds = courses.Select(c => c.CourseId).ToList();
        var mirrors = await _context.PlatformCourses.Where(c => courseIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);
        var domainIds = courses.Select(c => c.DomainId).Distinct().ToList();
        var frameworkIds = await _context.PlatformFrameworkDomains.Where(d => domainIds.Contains(d.Id)).Select(d => d.FrameworkId).Distinct().ToListAsync();
        var draftFrameworks = await _context.PlatformFrameworks
            .Where(f => frameworkIds.Contains(f.Id) && f.Status == Statuses.PlatformFramework.Draft)
            .ToListAsync();

        await _context.ExecuteInTransactionAsync(async () =>
        {
            // Two saves: the partial unique index allows one CURRENT, so the old one is retired first.
            if (current != null)
            {
                current.Status = Statuses.PlatformCatalogVersion.Retired;
                await _context.SaveChangesAsync();
            }

            draft.Status = Statuses.PlatformCatalogVersion.Current;
            draft.PublishedAt = now;
            draft.PublishedByUserId = _editor.UserId;
            draft.ReleaseNote = string.IsNullOrWhiteSpace(input.ReleaseNote) ? null : input.ReleaseNote.Trim();

            foreach (var course in courses)
            {
                var mirror = mirrors[course.CourseId];
                mirror.DomainId = course.DomainId;
                mirror.Level = course.Level;
                mirror.Title = course.Title;
                mirror.Outcome = course.Outcome;
                mirror.PricePerSeat = course.PricePerSeat;
                mirror.SalesStatus = course.SalesStatus;
                mirror.VersionNo = draft.VersionNo;
                if (course.ChangeKind != PlatformCatalog.ChangeKind.Unchanged || mirror.PublishedAt == null)
                {
                    mirror.PublishedAt = now;
                }
            }

            foreach (var framework in draftFrameworks)
            {
                var domains = await _context.PlatformFrameworkDomains.Where(d => d.FrameworkId == framework.Id && d.Status == Statuses.PlatformFrameworkDomain.Active).ToListAsync();
                _context.PlatformFrameworkReleases.Add(PlatformFrameworkPublisher.Publish(
                    framework, domains, _editor.UserId, $"Công bố cùng chương trình học v{draft.VersionNo}.", now));
            }

            await _context.SaveChangesAsync();
        });

        await _auditService.LogAsync(
            "PLATFORM_CATALOG_PUBLISHED",
            "platform_catalog_versions",
            draft.Id,
            new { versionNo = current?.VersionNo },
            new
            {
                versionNo = draft.VersionNo,
                reason = draft.ReleaseNote,
                added = changed.Count(c => c.ChangeKind == PlatformCatalog.ChangeKind.New),
                edited = changed.Count(c => c.ChangeKind == PlatformCatalog.ChangeKind.Edited),
            },
            $"Chương trình học v{draft.VersionNo}");

        return await PlatformCatalogVersionReader.ReadDetailAsync(_context, draft.VersionNo);
    }
}
