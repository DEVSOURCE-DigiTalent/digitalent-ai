using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Changes a member's roles and/or placement (OW-03 "Đổi vai trò", "Đổi phòng ban / vị trí"; OW-13).
///   - Roles: only OWNER / MANAGER / EMPLOYEE are granted or revoked; PLATFORM_ADMIN is
///     never touched. Requires role.assign_business and keeps at least one active Owner.
///   - Placement: department and position of the employee profile. A member without a profile (e.g. an Owner
///     created at sign-up) gets one when a department is given.
/// </summary>
public class UpdateMemberUseCase : IUseCase<UpdateMemberUseCaseInput, UpdateMemberUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionService _permissionService;
    private readonly IAuditService _auditService;
    private readonly MemberDirectory _directory;

    public UpdateMemberUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPermissionService permissionService,
        IAuditService auditService,
        MemberDirectory directory)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionService = permissionService;
        _auditService = auditService;
        _directory = directory;
    }

    public async Task<UpdateMemberUseCaseOutput> ExecuteAsync(UpdateMemberUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var member = await MemberRules.FindManageableAsync(_directory, organizationId, input.Id);

        // 1. Apply the requested changes to the tracked entities (nothing is saved yet)
        List<string>? newRoleCodes = null;
        if (input.Roles != null)
        {
            newRoleCodes = await ChangeRolesAsync(organizationId, member, input.Roles);
        }

        var placementChanged = false;
        if (input.DepartmentId.HasValue || input.JobPositionId != null)
        {
            placementChanged = await ChangePlacementAsync(organizationId, member, input.DepartmentId, input.JobPositionId);
        }

        // 2. One save for the whole update, then the audit entries
        await _context.SaveChangesAsync();

        if (newRoleCodes != null)
        {
            await _auditService.LogAsync(
                "ROLE_CHANGED",
                "users",
                member.UserId,
                new { roles = member.Roles },
                new { roles = MemberRoles.FromRoleCodes(newRoleCodes) },
                member.FullName);
        }

        if (placementChanged)
        {
            await _auditService.LogAsync(
                "MEMBER_PLACEMENT_CHANGED",
                "employees",
                member.EmployeeId ?? member.UserId,
                new { member.DepartmentId, member.JobPositionId },
                new { input.DepartmentId, input.JobPositionId },
                member.FullName);
        }

        // 3. Return the refreshed row
        var updated = await _directory.FindAsync(organizationId, member.Id)
            ?? throw new NotFoundException($"Member '{member.Id}' not found.");
        await _directory.AddMetricsAsync(new[] { updated });
        return updated.CopyTo<UpdateMemberUseCaseOutput>();
    }

    /// <returns>The system role codes the account holds after the change.</returns>
    private async Task<List<string>> ChangeRolesAsync(Guid organizationId, MemberListItem member, List<string> roles)
    {
        var canGrantRoles = await _permissionService.HasAnyAsync(_currentUser.Roles, new[] { Permissions.UserRole.RoleAssignBusiness });
        if (!canGrantRoles)
        {
            throw new ForbiddenException("You are not allowed to assign roles.");
        }

        if (!member.UserId.HasValue)
        {
            throw new BadRequestException("This employee has no account yet, so roles cannot be assigned.", "roles", "NO_ACCOUNT");
        }

        var desired = roles.Select(role => MemberRoles.ToRoleCode(role)!).Distinct().ToList();

        // Removing Owner from the last active Owner (including oneself) would lock everybody out of administration
        if (!desired.Contains(Roles.Owner))
        {
            await MemberRules.EnsureAnotherOwnerRemainsAsync(_directory, organizationId, member);
        }

        var userId = member.UserId.Value;
        var roleIds = await _context.Roles
            .Where(r => MemberRoles.ManagedRoleCodes.Contains(r.Code))
            .ToDictionaryAsync(r => r.Code, r => r.Id);
        var current = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { UserRole = ur, r.Code })
            .ToListAsync();

        // Revoke managed roles that are no longer wanted
        foreach (var row in current.Where(r => MemberRoles.ManagedRoleCodes.Contains(r.Code) && !desired.Contains(r.Code)))
        {
            _context.UserRoles.Remove(row.UserRole);
        }

        // Grant the missing ones
        var now = DateTimeOffset.UtcNow;
        foreach (var code in desired.Where(code => current.All(r => r.Code != code)))
        {
            _context.UserRoles.Add(new UserRole
            {
                UserId = userId,
                RoleId = roleIds[code],
                AssignedByUserId = _currentUser.UserId,
                AssignedAt = now,
            });
        }

        return current.Select(r => r.Code)
            .Where(code => !MemberRoles.ManagedRoleCodes.Contains(code))
            .Concat(desired)
            .ToList();
    }

    /// <returns>True when the department or position actually changed.</returns>
    private async Task<bool> ChangePlacementAsync(Guid organizationId, MemberListItem member, Guid? departmentId, string? jobPositionIdText)
    {
        if (departmentId.HasValue)
        {
            var departmentIsActive = await _context.Departments.AnyAsync(d =>
                d.Id == departmentId.Value && d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active);
            if (!departmentIsActive)
            {
                throw new BadRequestException("Department does not exist or is not active.", "departmentId", "INVALID_DEPARTMENT");
            }
        }

        // "" clears the position, a GUID assigns it, null leaves it as is (validator guarantees the format)
        Guid? jobPositionId = string.IsNullOrEmpty(jobPositionIdText) ? null : Guid.Parse(jobPositionIdText);
        if (jobPositionId.HasValue)
        {
            var positionIsActive = await _context.JobPositions.AnyAsync(p =>
                p.Id == jobPositionId.Value && p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active);
            if (!positionIsActive)
            {
                throw new BadRequestException("Job position does not exist or is not active.", "jobPositionId", "INVALID_JOB_POSITION");
            }
        }

        var employee = member.EmployeeId.HasValue
            ? await _context.Employees.FirstAsync(e => e.Id == member.EmployeeId.Value)
            : await CreateProfileAsync(organizationId, member, departmentId);

        var changed = false;
        if (departmentId.HasValue && employee.DepartmentId != departmentId.Value)
        {
            employee.DepartmentId = departmentId.Value;
            changed = true;
        }

        if (jobPositionIdText != null && employee.JobPositionId != jobPositionId)
        {
            employee.JobPositionId = jobPositionId;
            changed = true;
        }

        return changed || !member.EmployeeId.HasValue;
    }

    /// <summary>First placement of an account without an employee profile: a department is required (employees.department_id NOT NULL).</summary>
    private async Task<Employee> CreateProfileAsync(Guid organizationId, MemberListItem member, Guid? departmentId)
    {
        if (!departmentId.HasValue)
        {
            throw new BadRequestException(
                "This member has no employee profile yet. Choose a department to create it.", "departmentId", "NO_EMPLOYEE_PROFILE");
        }

        var employee = new Employee
        {
            OrganizationId = organizationId,
            UserId = member.UserId,
            DepartmentId = departmentId.Value,
            EmployeeCode = await EmployeeCodeGenerator.NextAsync(_context, organizationId),
            FullName = member.FullName,
            WorkEmail = member.Email,
            Status = Statuses.Employee.Active,
            JoinedAt = DateOnly.FromDateTime(DateTime.UtcNow),
        };
        _context.Employees.Add(employee);
        return employee;
    }
}
