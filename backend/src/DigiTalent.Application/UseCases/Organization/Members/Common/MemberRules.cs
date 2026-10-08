using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Domain.Constants.Authorization;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Business rules shared by the member write use cases (update, deactivate, reactivate).
/// </summary>
public static class MemberRules
{
    /// <summary>Loads a member that can be changed: exists, is not an invitation and is not a platform administrator.</summary>
    public static async Task<MemberListItem> FindManageableAsync(MemberDirectory directory, Guid organizationId, Guid id)
    {
        var member = await directory.FindAsync(organizationId, id)
            ?? throw new NotFoundException($"Member '{id}' not found.");

        if (member.Kind == MemberKinds.Invitation)
        {
            throw new ConflictException("The invitation has not been activated yet. Resend or revoke it instead.");
        }

        if (member.RoleCodes.Contains(Roles.SystemAdmin))
        {
            throw new ForbiddenException("Platform administrator accounts cannot be changed from the organization.");
        }

        return member;
    }

    /// <summary>
    /// Blocks an action that would leave the organization without an active Owner (HR_MANAGER):
    /// demoting or deactivating the last one.
    /// </summary>
    public static async Task EnsureAnotherOwnerRemainsAsync(MemberDirectory directory, Guid organizationId, MemberListItem member)
    {
        var isActiveOwner = member.RoleCodes.Contains(Roles.HrManager) && member.Status == MemberStatuses.Active;
        if (isActiveOwner && await directory.CountActiveOwnersAsync(organizationId) <= 1)
        {
            throw new ConflictException("The organization must keep at least one active Owner.");
        }
    }
}
