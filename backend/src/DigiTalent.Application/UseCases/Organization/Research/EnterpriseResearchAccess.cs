using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Research;

/// <summary>
/// What the caller may do with the company's course customisation.
/// <paramref name="InCharge"/> = who customises courses and decides on DigiTalent updates: RND when the company has R&amp;D
/// switched on and an active R&amp;D account, else OWNER (a small company without R&amp;D: the owner does it all).
/// <paramref name="Reason"/> = why the page is closed when <paramref name="CanView"/> is false.
/// </summary>
public sealed record ResearchAccess(bool Enabled, bool Purchased, string InCharge, int Researchers, bool CanView, bool CanEdit,
    string? Reason);

public sealed partial class EnterpriseResearch
{
    public const string ResearchOffMessage = "Doanh nghiệp chưa bật tính năng R&D.";
    public const string ResearchInChargeMessage =
        "Công ty đã có R&D: R&D sửa và áp dụng khóa học, bạn xem được nội dung.";

    /// <summary>
    /// The rule: a company without R&amp;D (switch off, or no active R&amp;D account yet) — the owner views, edits and applies;
    /// a company with R&amp;D — the R&amp;D accounts do it and the owner only views. Either way only once a course is bought.
    /// </summary>
    public static async Task<ResearchAccess> AccessAsync(IApplicationDbContext db, Guid organizationId, Guid? userId)
    {
        // Read the current role assignment, so a revocation takes effect even with an old session token.
        var roles = await (from user in db.Users.AsNoTracking()
                           join assignment in db.UserRoles.AsNoTracking() on user.Id equals assignment.UserId
                           join role in db.Roles.AsNoTracking() on assignment.RoleId equals role.Id
                           where user.Id == userId && user.OrganizationId == organizationId
                           select role.Code).ToListAsync();
        var isOwner = roles.Contains(Roles.Owner);
        var isResearch = roles.Contains(Roles.Research);
        var enabled = await IsEnabledAsync(db, organizationId);
        var purchased = await HasPurchaseAsync(db, organizationId);
        var deciders = await CourseUpdateDeciders.ForAsync(db, organizationId);
        var researchInCharge = deciders.DecidedBy == CourseUpdateDeciders.Research;

        var allowed = (isResearch && enabled) || isOwner;
        var reason = !isOwner && !isResearch ? "Bạn không có quyền sử dụng R&D của doanh nghiệp."
            : !allowed ? ResearchOffMessage
            : !purchased ? PurchaseRequiredMessage
            : null;
        var canView = reason is null;
        var canEdit = canView && ((isResearch && enabled) || (isOwner && !researchInCharge));
        return new ResearchAccess(enabled, purchased, researchInCharge ? CourseUpdateDeciders.Research : CourseUpdateDeciders.Owner,
            researchInCharge ? deciders.UserIds.Count : 0, canView, canEdit, reason);
    }

    public async Task<ResearchAccess> GetAccessAsync() =>
        await AccessAsync(context, currentUser.GetRequiredOrganizationId(), currentUser.UserId);

    /// <summary>Opens a read (<paramref name="write"/> false) or a change of the company's courses for the caller.</summary>
    private async Task<Guid> RequireAccessAsync(bool write)
    {
        var orgId = currentUser.GetRequiredOrganizationId();
        var access = await AccessAsync(context, orgId, currentUser.UserId);
        if (!access.CanView) throw new ForbiddenException(access.Reason!);
        if (write && !access.CanEdit) throw new ForbiddenException(ResearchInChargeMessage);
        return orgId;
    }
}
