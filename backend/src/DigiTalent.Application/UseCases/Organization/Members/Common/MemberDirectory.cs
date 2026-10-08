using System.Globalization;
using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Builds the member list of an organization (OW-02, OW-03, OW-13) from three sources:
///   1. employee profiles that are not ARCHIVED, with their login account if they have one;
///   2. accounts of the organization without an employee profile (e.g. an Owner created at sign-up);
///   3. PENDING invitations.
/// The list is assembled in memory: an organization holds at most a few hundred members (seat limit), and the
/// three sources cannot be paged together in SQL. Per-row metrics are only loaded for the requested page.
/// </summary>
public class MemberDirectory
{
    private static readonly StringComparer NameComparer = StringComparer.Create(CultureInfo.GetCultureInfo("vi-VN"), ignoreCase: true);

    private readonly IApplicationDbContext _context;

    public MemberDirectory(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Every member and pending invitation of the organization, without metrics, sorted for display.</summary>
    public async Task<List<MemberListItem>> ListAsync(Guid organizationId)
    {
        var lookups = await LoadLookupsAsync(organizationId);

        var employeeRows = await (
                from employee in _context.Employees
                where employee.OrganizationId == organizationId && employee.Status != Statuses.Employee.Archived
                join user in _context.Users on employee.UserId equals user.Id into accounts
                from account in accounts.DefaultIfEmpty()
                select new { Employee = employee, Account = account })
            .AsNoTracking()
            .ToListAsync();

        var accountsWithoutProfile = await _context.Users
            .AsNoTracking()
            .Where(u => u.OrganizationId == organizationId && !_context.Employees.Any(e => e.UserId == u.Id))
            .ToListAsync();

        var userIds = employeeRows.Where(r => r.Account != null).Select(r => r.Account!.Id)
            .Concat(accountsWithoutProfile.Select(u => u.Id))
            .ToList();
        var roleCodesByUser = await LoadRoleCodesAsync(userIds);

        var members = new List<MemberListItem>();
        foreach (var row in employeeRows)
        {
            members.Add(FromEmployee(row.Employee, row.Account, RolesOf(roleCodesByUser, row.Account?.Id), lookups));
        }

        foreach (var user in accountsWithoutProfile)
        {
            members.Add(FromAccount(user, RolesOf(roleCodesByUser, user.Id)));
        }

        var invitations = await (
                from invitation in _context.MemberInvitations
                where invitation.OrganizationId == organizationId && invitation.Status == Statuses.MemberInvitation.Pending
                join role in _context.Roles on invitation.RoleId equals role.Id
                select new { Invitation = invitation, RoleCode = role.Code })
            .AsNoTracking()
            .ToListAsync();
        members.AddRange(invitations.Select(i => FromInvitation(i.Invitation, i.RoleCode, lookups)));

        // Pending invitations last, then by name (Vietnamese collation)
        return members
            .OrderBy(m => m.Status == MemberStatuses.Pending)
            .ThenBy(m => m.FullName, NameComparer)
            .ToList();
    }

    /// <summary>One member or pending invitation by the id used in the list; null when not found.</summary>
    public async Task<MemberListItem?> FindAsync(Guid organizationId, Guid id)
    {
        var members = await ListAsync(organizationId);
        return members.FirstOrDefault(m => m.Id == id);
    }

    /// <summary>
    /// Fills <see cref="MemberListItem.CoveragePercent"/>, <see cref="MemberListItem.HighGapCount"/> and
    /// <see cref="MemberListItem.ActiveCourses"/> from the latest skill gap run and the open enrollments.
    /// </summary>
    public async Task AddMetricsAsync(IReadOnlyCollection<MemberListItem> members)
    {
        var employeeIds = members.Where(m => m.EmployeeId.HasValue).Select(m => m.EmployeeId!.Value).Distinct().ToList();
        if (employeeIds.Count == 0)
        {
            return;
        }

        // Few runs per employee: load the headers and keep the latest one in memory
        var runs = await _context.SkillGapRuns
            .AsNoTracking()
            .Where(r => employeeIds.Contains(r.EmployeeId))
            .Select(r => new { r.Id, r.EmployeeId, r.GeneratedAt, r.SummarySnapshot })
            .ToListAsync();
        var latestRuns = runs
            .GroupBy(r => r.EmployeeId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.GeneratedAt).ThenByDescending(r => r.Id).First());

        var latestRunIds = latestRuns.Values.Select(r => r.Id).ToList();
        var highCounts = await _context.SkillGapItems
            .Where(i => latestRunIds.Contains(i.SkillGapRunId) && i.Severity == Statuses.SkillGapSeverity.High)
            .GroupBy(i => i.SkillGapRunId)
            .Select(g => new { RunId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RunId, x => x.Count);

        var activeCourses = await _context.Enrollments
            .Where(e => employeeIds.Contains(e.EmployeeId)
                        && (e.Status == Statuses.Enrollment.InProgress || e.Status == Statuses.Enrollment.ReadyForAssessment))
            .GroupBy(e => e.EmployeeId)
            .Select(g => new { EmployeeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.EmployeeId, x => x.Count);

        foreach (var member in members.Where(m => m.EmployeeId.HasValue))
        {
            var employeeId = member.EmployeeId!.Value;
            member.ActiveCourses = activeCourses.GetValueOrDefault(employeeId);
            member.HighGapCount = 0;

            if (latestRuns.TryGetValue(employeeId, out var run))
            {
                member.CoveragePercent = ReadCoverage(run.SummarySnapshot);
                member.HighGapCount = highCounts.GetValueOrDefault(run.Id);
            }
        }
    }

    /// <summary>
    /// Seats in use = ACTIVE accounts + PENDING invitations (an invitation reserves a seat; a deactivated member frees it).
    /// </summary>
    public async Task<int> CountSeatsInUseAsync(Guid organizationId)
    {
        var activeAccounts = await _context.Users
            .CountAsync(u => u.OrganizationId == organizationId && u.Status != Statuses.User.Inactive);
        var pendingInvitations = await _context.MemberInvitations
            .CountAsync(i => i.OrganizationId == organizationId && i.Status == Statuses.MemberInvitation.Pending);
        return activeAccounts + pendingInvitations;
    }

    /// <summary>Seat limit of the organization's plan; null = unlimited or no plan.</summary>
    public Task<int?> GetSeatLimitAsync(Guid organizationId) =>
        _context.Subscriptions
            .Where(s => s.OrganizationId == organizationId)
            .Select(s => s.SeatLimit)
            .FirstOrDefaultAsync();

    /// <summary>Active accounts holding the Owner role — the organization must always keep one.</summary>
    public Task<int> CountActiveOwnersAsync(Guid organizationId) =>
        (from userRole in _context.UserRoles
         join role in _context.Roles on userRole.RoleId equals role.Id
         join user in _context.Users on userRole.UserId equals user.Id
         where role.Code == Roles.Owner
               && user.OrganizationId == organizationId
               && user.Status != Statuses.User.Inactive
         select user.Id).Distinct().CountAsync();

    private async Task<Lookups> LoadLookupsAsync(Guid organizationId)
    {
        var departments = await _context.Departments
            .Where(d => d.OrganizationId == organizationId)
            .ToDictionaryAsync(d => d.Id, d => d.Name);
        var positions = await _context.JobPositions
            .Where(p => p.OrganizationId == organizationId)
            .ToDictionaryAsync(p => p.Id, p => new PositionInfo(p.Name, p.JobGrade));
        return new Lookups(departments, positions, await JobGradeNames.LoadAsync(_context, organizationId));
    }

    private async Task<Dictionary<Guid, List<string>>> LoadRoleCodesAsync(List<Guid> userIds)
    {
        var rows = await (
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                where userIds.Contains(userRole.UserId)
                select new { userRole.UserId, role.Code })
            .ToListAsync();
        return rows.GroupBy(r => r.UserId).ToDictionary(g => g.Key, g => g.Select(r => r.Code).ToList());
    }

    private static List<string> RolesOf(Dictionary<Guid, List<string>> roleCodesByUser, Guid? userId) =>
        userId.HasValue && roleCodesByUser.TryGetValue(userId.Value, out var codes) ? codes : new List<string>();

    private static MemberListItem FromEmployee(Employee employee, User? account, List<string> roleCodes, Lookups lookups)
    {
        var position = employee.JobPositionId.HasValue ? lookups.Positions.GetValueOrDefault(employee.JobPositionId.Value) : null;
        var inactive = account?.Status == Statuses.User.Inactive || employee.Status == Statuses.Employee.Inactive;

        return new MemberListItem
        {
            Id = account?.Id ?? employee.Id,
            Kind = MemberKinds.Member,
            UserId = account?.Id,
            FullName = employee.FullName,
            Email = account?.Email ?? employee.WorkEmail ?? string.Empty,
            RoleCodes = roleCodes,
            // A profile without an account has no access yet but is still an employee of the organization
            Roles = account == null ? new List<string> { MemberRoles.Employee } : MemberRoles.FromRoleCodes(roleCodes),
            Status = inactive ? MemberStatuses.Inactive : MemberStatuses.Active,
            EmployeeId = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            DepartmentId = employee.DepartmentId,
            DepartmentName = lookups.Departments.GetValueOrDefault(employee.DepartmentId),
            JobPositionId = employee.JobPositionId,
            PositionName = position?.Name,
            JobGrade = position?.JobGrade,
            JobGradeName = position?.JobGrade == null ? null : lookups.GradeNames.GetValueOrDefault(position.JobGrade),
            JoinedAt = employee.JoinedAt.HasValue
                ? new DateTimeOffset(employee.JoinedAt.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
                : account?.CreatedAt,
            LastActiveAt = account?.LastLoginAt,
            DeactivatedReason = inactive ? account?.DeactivatedReason : null,
        };
    }

    private static MemberListItem FromAccount(User user, List<string> roleCodes)
    {
        var inactive = user.Status == Statuses.User.Inactive;
        return new MemberListItem
        {
            Id = user.Id,
            Kind = MemberKinds.Member,
            UserId = user.Id,
            FullName = user.DisplayName,
            Email = user.Email,
            RoleCodes = roleCodes,
            Roles = MemberRoles.FromRoleCodes(roleCodes),
            Status = inactive ? MemberStatuses.Inactive : MemberStatuses.Active,
            JoinedAt = user.CreatedAt,
            LastActiveAt = user.LastLoginAt,
            DeactivatedReason = inactive ? user.DeactivatedReason : null,
        };
    }

    private static MemberListItem FromInvitation(MemberInvitation invitation, string roleCode, Lookups lookups)
    {
        var position = invitation.JobPositionId.HasValue ? lookups.Positions.GetValueOrDefault(invitation.JobPositionId.Value) : null;
        return new MemberListItem
        {
            Id = invitation.Id,
            Kind = MemberKinds.Invitation,
            FullName = invitation.FullName,
            Email = invitation.Email,
            RoleCodes = new List<string> { roleCode },
            Roles = MemberRoles.FromRoleCodes(new[] { roleCode }),
            Status = MemberStatuses.Pending,
            EmployeeCode = invitation.EmployeeCode,
            DepartmentId = invitation.DepartmentId,
            DepartmentName = invitation.DepartmentId.HasValue ? lookups.Departments.GetValueOrDefault(invitation.DepartmentId.Value) : null,
            JobPositionId = invitation.JobPositionId,
            PositionName = position?.Name,
            JobGrade = position?.JobGrade,
            JobGradeName = position?.JobGrade == null ? null : lookups.GradeNames.GetValueOrDefault(position.JobGrade),
            InvitedAt = invitation.InvitedAt,
        };
    }

    private static decimal? ReadCoverage(string? summarySnapshot)
    {
        if (string.IsNullOrWhiteSpace(summarySnapshot))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<SkillGapSnapshot>(summarySnapshot, SkillGapSnapshot.JsonOptions)?.CoveragePercent;
        }
        catch (JsonException)
        {
            return null; // a broken snapshot only hides the metric, the list still loads
        }
    }

    private sealed record PositionInfo(string Name, string? JobGrade);

    private sealed record Lookups(
        Dictionary<Guid, string> Departments,
        Dictionary<Guid, PositionInfo> Positions,
        Dictionary<string, string> GradeNames);
}
