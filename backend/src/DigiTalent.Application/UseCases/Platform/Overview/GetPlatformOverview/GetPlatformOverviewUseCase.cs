using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Application.UseCases.Platform.Organizations;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformOverviewUseCase : IUseCase<GetPlatformOverviewUseCaseInput, GetPlatformOverviewUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformOverviewUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformOverviewUseCaseOutput> ExecuteAsync(GetPlatformOverviewUseCaseInput input)
    {
        var organizations = await PlatformOrganizationReader.ReadAllAsync(_context);
        var courses = await PlatformCatalogReader.ReadCoursesAsync(_context);
        var domains = await _context.PlatformFrameworkDomains.AsNoTracking().ToListAsync();
        var frameworkVersion = await _context.PlatformFrameworkReleases.Select(r => (int?)r.VersionNo).MaxAsync() ?? 0;
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
            FrameworkVersion = frameworkVersion,
            FrameworkHasDraft = domains.Any(d => d.DraftDescription != d.PublishedDescription),
            DomainCount = domains.Count,
            CourseCount = courses.Count,
            PausedCourseCount = courses.Count(c => c.SalesStatus == Statuses.PlatformCourseSales.Paused),
            CoursesWithDraft = courses.Count(c => c.HasDraft || c.DraftQuestionCount > 0),
            PublishedQuestionCount = courses.Sum(c => c.PublishedQuestionCount),
            DraftQuestionCount = courses.Sum(c => c.DraftQuestionCount),
            SeatsPurchased = courses.Sum(c => c.SeatsPurchased),
            SeatsGranted = courses.Sum(c => c.SeatsGranted),
            Revenue = courses.Sum(c => c.Revenue),
            RecentOrganizations = organizations.OrderByDescending(o => o.CreatedAt).Take(5).ToList(),
            RecentActivity = await PlatformAuditReader.Query(_context).Where(l => l.OrganizationId == null).Take(6).ToListAsync(),
        };
    }
}
