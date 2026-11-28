using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Catalog;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// The organization keeps the version it learns from instead of the newest one, with a reason. Nothing changes for its
/// employees; the update stays offered and can be applied later. A newer publication asks again.
/// </summary>
public class KeepCourseVersionUseCase : IUseCase<KeepCourseVersionUseCaseInput, CourseUpdatesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;
    private readonly IAuditService _auditService;

    public KeepCourseVersionUseCase(IApplicationDbContext context, ICurrentUser currentUser, TimeProvider time, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _time = time;
        _auditService = auditService;
    }

    public async Task<CourseUpdatesOutput> ExecuteAsync(KeepCourseVersionUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        await CourseUpdateDeciders.EnsureCanDecideAsync(_context, organizationId, _currentUser.UserId);
        var applier = new PlatformCatalogApplier(_context);
        var (organization, _, latest, applied) = await OrganizationCatalogVersionReader.LoadAsync(_context, applier, organizationId);
        CourseUpdateRules.EnsureNewest(input.VersionNo, latest.VersionNo, applied);

        var reason = input.Reason.Trim();
        await CourseUpdateReader.SaveKeptAsync(_context, organizationId, latest.VersionNo, reason, _currentUser.UserId, _time.GetUtcNow());
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "COURSE_UPDATE_KEPT",
            "organizations",
            organizationId,
            new { versionNo = applied },
            new { versionNo = applied, declinedVersionNo = latest.VersionNo, reason },
            $"{organization.Name} · giữ v{applied}, không áp dụng v{latest.VersionNo}");

        return await CourseUpdateReader.ReadAsync(_context, organizationId, _currentUser.UserId);
    }
}
