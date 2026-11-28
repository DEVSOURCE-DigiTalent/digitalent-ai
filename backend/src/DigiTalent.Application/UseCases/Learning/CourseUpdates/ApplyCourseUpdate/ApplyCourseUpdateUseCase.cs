using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Catalog;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// The organization applies the newest course version: the changed courses get a new revision in the organization.
/// Employees who started a course keep the version they started on; the others learn the new content.
/// </summary>
public class ApplyCourseUpdateUseCase : IUseCase<ApplyCourseUpdateUseCaseInput, CourseUpdatesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;
    private readonly IAuditService _auditService;

    public ApplyCourseUpdateUseCase(IApplicationDbContext context, ICurrentUser currentUser, TimeProvider time, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _time = time;
        _auditService = auditService;
    }

    public async Task<CourseUpdatesOutput> ExecuteAsync(ApplyCourseUpdateUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        await CourseUpdateDeciders.EnsureCanDecideAsync(_context, organizationId, _currentUser.UserId);
        var applier = new PlatformCatalogApplier(_context);
        var (organization, _, latest, applied) = await OrganizationCatalogVersionReader.LoadAsync(_context, applier, organizationId);
        CourseUpdateRules.EnsureNewest(input.VersionNo, latest.VersionNo, applied);
        if (!await applier.IsProvisionedAsync(organizationId))
        {
            throw new BadRequestException("Doanh nghiệp chưa có khóa học chuẩn nên chưa áp dụng được.", "versionNo", "ORGANIZATION_HAS_NO_COURSES");
        }

        var changes = new List<PlatformCatalogApplyChange>();
        await _context.ExecuteInTransactionAsync(async () =>
        {
            changes = await applier.ApplyAsync(organizationId, applied, latest, _currentUser.UserId, _time.GetUtcNow());
            await _context.SaveChangesAsync();
        });

        await _auditService.LogAsync(
            "COURSE_UPDATE_APPLIED",
            "organizations",
            organizationId,
            new { versionNo = applied },
            new { versionNo = latest.VersionNo, courses = changes.Select(c => c.Code).ToList() },
            $"{organization.Name} · v{applied} → v{latest.VersionNo}");

        return await CourseUpdateReader.ReadAsync(_context, organizationId, _currentUser.UserId);
    }
}
