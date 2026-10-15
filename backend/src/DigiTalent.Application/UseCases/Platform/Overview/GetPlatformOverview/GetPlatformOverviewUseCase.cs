using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Application.UseCases.Platform.Organizations;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformOverviewUseCase : IUseCase<GetPlatformOverviewUseCaseInput, GetPlatformOverviewUseCaseOutput>
{
    private static readonly TimeSpan EndingSoon = TimeSpan.FromDays(2);

    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _clock;

    public GetPlatformOverviewUseCase(IApplicationDbContext context, TimeProvider clock)
    {
        _context = context;
        _clock = clock;
    }

    public async Task<GetPlatformOverviewUseCaseOutput> ExecuteAsync(GetPlatformOverviewUseCaseInput input)
    {
        var now = _clock.GetUtcNow();
        var organizations = await PlatformOrganizationReader.ReadAllAsync(_context);
        var courses = await PlatformCatalogReader.ReadCoursesAsync(_context);
        var frameworks = await _context.PlatformFrameworks.AsNoTracking()
            .Where(f => f.Status != Statuses.PlatformFramework.Archived).ToListAsync();
        var frameworkIds = frameworks.Select(f => f.Id).ToList();
        var domains = await _context.PlatformFrameworkDomains.AsNoTracking()
            .Where(d => frameworkIds.Contains(d.FrameworkId) && d.Status == Statuses.PlatformFrameworkDomain.Active).ToListAsync();
        var versions = await _context.PlatformCatalogVersions.AsNoTracking()
            .Where(v => v.Status != Statuses.PlatformCatalogVersion.Retired).ToListAsync();
        var current = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Current);
        var draft = versions.FirstOrDefault(v => v.Status == Statuses.PlatformCatalogVersion.Draft);
        var draftChanges = draft == null
            ? new List<string>()
            : await _context.PlatformCatalogCourses.AsNoTracking()
                .Where(c => c.VersionId == draft.Id && c.ChangeKind != PlatformCatalog.ChangeKind.Unchanged)
                .Select(c => c.ChangeKind).ToListAsync();
        var trials = await _context.UserSubscriptions.AsNoTracking()
            .Where(s => s.Status == UserSubscriptionStatuses.Trialing && s.TrialEndsAt != null && s.TrialEndsAt > now)
            .Select(s => s.TrialEndsAt!.Value)
            .ToListAsync();
        var paid = organizations.Count(o => o.Stage == PlatformOrganizationStages.Paid);

        return new GetPlatformOverviewUseCaseOutput
        {
            OrganizationCount = organizations.Count,
            PaidOrganizationCount = paid,
            TrialOrganizationCount = organizations.Count - paid,
            SuspendedOrganizationCount = organizations.Count(o => o.Status == Statuses.Organization.Suspended),
            ConversionRate = organizations.Count == 0 ? 0 : Math.Round(paid * 100.0 / organizations.Count, 1),
            UserCount = await _context.Users.CountAsync(),
            EmployeeCount = organizations.Sum(o => o.EmployeeCount),
            LockedUserCount = await _context.Users.CountAsync(u => u.Status == Statuses.User.Locked && u.LockedUntil == null),
            TrialUserCount = trials.Count,
            TrialEndingSoonCount = trials.Count(end => end - now <= EndingSoon),
            FrameworkCount = frameworks.Count,
            DraftFrameworkCount = frameworks.Count(f => f.Status == Statuses.PlatformFramework.Draft),
            FrameworkHasDraft = domains.Any(d => d.DraftDescription != d.PublishedDescription),
            DomainCount = domains.Count,
            CurrentVersionNo = current?.VersionNo,
            CurrentVersionPublishedAt = current?.PublishedAt,
            DraftVersionNo = draft?.VersionNo,
            DraftNewCourseCount = draftChanges.Count(c => c == PlatformCatalog.ChangeKind.New),
            DraftEditedCourseCount = draftChanges.Count(c => c == PlatformCatalog.ChangeKind.Edited),
            CourseCount = courses.Count,
            PausedCourseCount = courses.Count(c => c.SalesStatus == Statuses.PlatformCourseSales.Paused),
            QuestionCount = courses.Sum(c => c.QuestionCount),
            SeatsPurchased = courses.Sum(c => c.SeatsPurchased),
            SeatsGranted = courses.Sum(c => c.SeatsGranted),
            Revenue = courses.Sum(c => c.Revenue),
            RecentOrganizations = organizations.OrderByDescending(o => o.CreatedAt).Take(5).ToList(),
            RecentActivity = await PlatformAuditReader.Query(_context).Where(l => l.OrganizationId == null).Take(6).ToListAsync(),
        };
    }
}
