using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Organization.Research;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// Who decides on a course version DigiTalent published: the company's R&amp;D when it has one (the R&amp;D feature is
/// on and an active account holds the RND role), otherwise the owner (every active user whose role holds
/// <see cref="Permissions.Learning.ReviewCourseUpdate"/>). The other side can still read the update.
/// </summary>
public static class CourseUpdateDeciders
{
    public const string Research = "RND";
    public const string Owner = "OWNER";

    public sealed record Result(string DecidedBy, IReadOnlyList<Guid> UserIds)
    {
        public bool Includes(Guid? userId) => userId is { } id && UserIds.Contains(id);
    }

    public static async Task<Result> ForAsync(IApplicationDbContext context, Guid organizationId)
    {
        if (await EnterpriseResearch.IsEnabledAsync(context, organizationId))
        {
            var research = await (
                    from user in context.Users.AsNoTracking()
                    join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                    join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                    where user.OrganizationId == organizationId && user.Status == Statuses.User.Active && role.Code == Roles.Research
                    select user.Id)
                .Distinct()
                .ToListAsync();
            if (research.Count > 0)
            {
                return new Result(Research, research);
            }
        }

        var owners = await (
                from user in context.Users.AsNoTracking()
                join userRole in context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join rolePermission in context.RolePermissions.AsNoTracking() on userRole.RoleId equals rolePermission.RoleId
                join permission in context.Permissions.AsNoTracking() on rolePermission.PermissionId equals permission.Id
                where user.OrganizationId == organizationId && user.Status == Statuses.User.Active
                      && role.Code != Roles.Research && permission.Code == Permissions.Learning.ReviewCourseUpdate
                select user.Id)
            .Distinct()
            .ToListAsync();
        return new Result(Owner, owners);
    }

    /// <summary>Refuses a decision from someone who may only read the update (the owner while R&amp;D is in charge).</summary>
    public static async Task EnsureCanDecideAsync(IApplicationDbContext context, Guid organizationId, Guid? userId)
    {
        var deciders = await ForAsync(context, organizationId);
        if (deciders.Includes(userId))
        {
            return;
        }

        throw new ForbiddenException(deciders.DecidedBy == Research
            ? "Doanh nghiệp đã có R&D: R&D xem và quyết định bản cập nhật khóa học."
            : "Chỉ chủ doanh nghiệp quyết định bản cập nhật khóa học khi doanh nghiệp chưa bật R&D.");
    }
}
