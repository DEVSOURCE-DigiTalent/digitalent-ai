using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Organization.Research;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

/// <summary>
/// Who may ask the AI for content help: DigiTalent staff editing the catalog (no organization), or whoever may edit the
/// company's courses (<see cref="EnterpriseResearch.AccessAsync"/>: the owner of a company without R&amp;D, the R&amp;D accounts
/// of a company with R&amp;D, once a course is bought) — every call costs AI quota.
/// </summary>
public sealed class ContentAiAccess(ICurrentUser currentUser, IApplicationDbContext context)
{
    public async Task EnsureAsync()
    {
        if (currentUser.OrganizationId is not { } organizationId) return;
        var access = await EnterpriseResearch.AccessAsync(context, organizationId, currentUser.UserId);
        if (!access.CanView) throw new ForbiddenException(access.Reason!);
        if (!access.CanEdit) throw new ForbiddenException(EnterpriseResearch.ResearchInChargeMessage);
    }
}
