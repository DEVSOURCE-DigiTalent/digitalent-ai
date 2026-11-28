using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Moves one organization to a published catalog version, newer or older (going back needs a reason). The courses
/// whose content differs get a new revision in that organization; employees who already started a course keep the
/// revision they started on, the others learn the applied content.
/// </summary>
public class ApplyOrganizationCatalogVersionUseCase : IUseCase<ApplyOrganizationCatalogVersionUseCaseInput, OrganizationCatalogVersionOutput>
{
    private const int MinReasonLength = 10;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;
    private readonly IAuditService _auditService;

    public ApplyOrganizationCatalogVersionUseCase(
        IApplicationDbContext context, ICurrentUser currentUser, TimeProvider time, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _time = time;
        _auditService = auditService;
    }

    public async Task<OrganizationCatalogVersionOutput> ExecuteAsync(ApplyOrganizationCatalogVersionUseCaseInput input)
    {
        var applier = new PlatformCatalogApplier(_context);
        var (organization, versions, _, applied) = await OrganizationCatalogVersionReader.LoadAsync(_context, applier, input.OrganizationId);
        var target = versions.FirstOrDefault(v => v.VersionNo == input.VersionNo)
                     ?? throw new NotFoundException($"Không tìm thấy phiên bản đã công bố v{input.VersionNo}.");
        if (!await applier.IsProvisionedAsync(organization.Id))
        {
            throw new BadRequestException("Tổ chức chưa có khóa học chuẩn nên chưa áp được phiên bản.", "organizationId", "ORGANIZATION_HAS_NO_COURSES");
        }
        if (target.VersionNo == applied)
        {
            throw new BadRequestException($"Tổ chức đang dùng v{applied}.", "versionNo", "ALREADY_ON_VERSION");
        }

        var reason = input.Reason?.Trim();
        if (target.VersionNo < applied && (reason?.Length ?? 0) < MinReasonLength)
        {
            throw new BadRequestException(
                $"Quay lại phiên bản cũ cần ghi lý do (ít nhất {MinReasonLength} ký tự).", "reason", "REASON_REQUIRED");
        }

        var changes = new List<PlatformCatalogApplyChange>();
        await _context.ExecuteInTransactionAsync(async () =>
        {
            changes = await applier.ApplyAsync(organization.Id, applied, target, _currentUser.UserId, _time.GetUtcNow());
            await _context.SaveChangesAsync();
        });

        await _auditService.LogAsync(
            "PLATFORM_CATALOG_APPLIED",
            "organizations",
            organization.Id,
            new { versionNo = applied },
            new
            {
                versionNo = target.VersionNo,
                reason = string.IsNullOrEmpty(reason) ? null : reason,
                courses = changes.Select(c => c.Code).ToList(),
            },
            $"{organization.Name} · v{applied} → v{target.VersionNo}");

        var output = await OrganizationCatalogVersionReader.ReadAsync(_context, organization.Id, target.VersionNo);
        output.Changes = changes; // what this apply changed (the plan from the new version to itself is empty)
        return output;
    }
}
