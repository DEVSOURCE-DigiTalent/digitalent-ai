using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>
/// Suspends or restores an organization. While suspended its members cannot sign in or refresh a session.
/// </summary>
public class ChangePlatformOrganizationStatusUseCase : IUseCase<ChangePlatformOrganizationStatusUseCaseInput, PlatformOrganizationDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public ChangePlatformOrganizationStatusUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformOrganizationDetailOutput> ExecuteAsync(ChangePlatformOrganizationStatusUseCaseInput input)
    {
        var organization = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == input.OrganizationId)
            ?? throw new NotFoundException($"Organization '{input.OrganizationId}' not found.");

        var target = input.Suspend ? Statuses.Organization.Suspended : Statuses.Simple.Active;
        if (input.Suspend && organization.Status == Statuses.Organization.Suspended)
            throw new ConflictException("The organization is already suspended.");
        if (!input.Suspend && organization.Status != Statuses.Organization.Suspended)
            throw new ConflictException("The organization is not suspended.");

        var oldStatus = organization.Status;
        organization.Status = target;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            input.Suspend ? "PLATFORM_ORGANIZATION_SUSPENDED" : "PLATFORM_ORGANIZATION_RESTORED",
            "organizations",
            organization.Id,
            new { status = oldStatus },
            new { status = target, reason = input.Reason.Trim() },
            organization.Name);

        return await PlatformOrganizationReader.ReadDetailAsync(_context, organization.Id);
    }
}
