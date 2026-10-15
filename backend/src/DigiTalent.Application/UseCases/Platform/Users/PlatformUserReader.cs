using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

public static class PlatformUserReader
{
    public const string LearnerRole = "LEARNER";

    private static readonly string[] RoleRank = { Roles.PlatformAdmin, Roles.Owner, Roles.Manager, Roles.Employee };

    /// <summary>
    /// Accounts matching the list filters, as a query (filtered, sorted and paged in the database). Role filters on
    /// the highest persisted role, like <see cref="PlatformUserItem.Role"/>; LEARNER = no persisted role.
    /// </summary>
    public static IQueryable<User> Query(IApplicationDbContext context, GetPlatformUsersUseCaseInput input, DateTimeOffset now)
    {
        var users = context.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            users = users.Where(u =>
                u.Email.ToLower().Contains(search)
                || u.DisplayName.ToLower().Contains(search)
                || context.Organizations.Any(o => o.Id == u.OrganizationId && o.Name.ToLower().Contains(search)));
        }
        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpperInvariant();
            users = users.Where(u => u.Status == status);
        }
        if (input.OrganizationId.HasValue) users = users.Where(u => u.OrganizationId == input.OrganizationId);

        if (!string.IsNullOrWhiteSpace(input.Role))
        {
            var role = input.Role.Trim().ToUpperInvariant();
            var rank = Array.IndexOf(RoleRank, role);
            if (role == LearnerRole)
            {
                users = users.Where(u => !context.UserRoles.Any(ur => ur.UserId == u.Id));
            }
            else if (rank < 0)
            {
                users = users.Where(_ => false);
            }
            else
            {
                var higher = RoleRank.Take(rank).ToArray();
                users = users.Where(u =>
                    context.UserRoles.Any(ur => ur.UserId == u.Id && ur.Role.Code == role)
                    && !context.UserRoles.Any(ur => ur.UserId == u.Id && higher.Contains(ur.Role.Code)));
            }
        }

        if (!string.IsNullOrWhiteSpace(input.Trial))
        {
            // Trial follow-up: the trial that ends first comes first
            users = PlatformUserTrials.Filter(context, users, input.Trial.Trim().ToUpperInvariant(), now);
            return users
                .OrderBy(u => context.UserSubscriptions.Where(s => s.UserId == u.Id).Min(s => s.TrialEndsAt))
                .ThenBy(u => u.Email);
        }

        // Accounts of an organization grouped by organization name, personal accounts last
        return users
            .OrderBy(u => context.Organizations.Where(o => o.Id == u.OrganizationId).Select(o => o.Name).FirstOrDefault() ?? "~")
            .ThenBy(u => u.Email);
    }

    /// <summary>The given accounts with role, organization and placement, in the order of <paramref name="userIds"/>.</summary>
    public static async Task<List<PlatformUserItem>> ReadAsync(IApplicationDbContext context, IReadOnlyCollection<Guid> userIds, DateTimeOffset? now = null)
    {
        var at = now ?? DateTimeOffset.UtcNow;
        var subscriptions = (await context.UserSubscriptions.AsNoTracking().Where(s => userIds.Contains(s.UserId)).ToListAsync())
            .GroupBy(s => s.UserId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(s => s.CreatedAt).First());
        var rows = await (
            from user in context.Users.AsNoTracking()
            join organization in context.Organizations on user.OrganizationId equals organization.Id into organizations
            from organization in organizations.DefaultIfEmpty()
            where userIds.Contains(user.Id)
            select new
            {
                user.Id,
                user.Email,
                user.DisplayName,
                user.OrganizationId,
                OrganizationName = organization == null ? null : organization.Name,
                user.Status,
                user.LockedUntil,
                user.LastLoginAt,
                user.CreatedAt,
            }).ToListAsync();

        var roles = await (
            from userRole in context.UserRoles.AsNoTracking()
            join role in context.Roles on userRole.RoleId equals role.Id
            where userIds.Contains(userRole.UserId)
            select new { userRole.UserId, role.Code }).ToListAsync();
        var employees = await (
            from employee in context.Employees.AsNoTracking()
            join department in context.Departments on employee.DepartmentId equals department.Id
            join position in context.JobPositions on employee.JobPositionId equals position.Id into positions
            from position in positions.DefaultIfEmpty()
            where employee.UserId != null && userIds.Contains(employee.UserId.Value)
            select new { UserId = employee.UserId!.Value, DepartmentName = department.Name, PositionName = position == null ? null : position.Name })
            .ToListAsync();

        var order = userIds.Select((id, index) => (id, index)).ToDictionary(x => x.id, x => x.index);
        return rows.OrderBy(r => order[r.Id]).Select(r =>
        {
            var codes = roles.Where(x => x.UserId == r.Id).Select(x => x.Code).Distinct().ToList();
            var employee = employees.FirstOrDefault(e => e.UserId == r.Id);
            var subscription = subscriptions.GetValueOrDefault(r.Id);
            var trialEnded = subscription != null && PlatformUserTrials.IsEnded(subscription, at);
            var trialState = subscription == null ? null
                : PlatformUserTrials.IsActive(subscription, at) ? PlatformUserTrials.Active
                : trialEnded ? PlatformUserTrials.Ended
                : null;
            return new PlatformUserItem
            {
                Id = r.Id,
                Email = r.Email,
                DisplayName = r.DisplayName,
                Role = RoleRank.FirstOrDefault(codes.Contains) ?? LearnerRole,
                Roles = codes,
                OrganizationId = r.OrganizationId,
                OrganizationName = r.OrganizationName,
                DepartmentName = employee?.DepartmentName,
                PositionName = employee?.PositionName,
                Status = r.Status,
                IsManuallyLocked = r.Status == Statuses.User.Locked && r.LockedUntil == null,
                LockedUntil = r.LockedUntil,
                LastLoginAt = r.LastLoginAt,
                CreatedAt = r.CreatedAt,
                PlanCode = subscription == null ? null : trialEnded ? PlatformUserTrials.FreePlan : subscription.PlanCode,
                TrialState = trialState,
                TrialStartedAt = subscription?.TrialStartedAt,
                TrialEndsAt = subscription?.TrialEndsAt,
            };
        }).ToList();
    }
}
