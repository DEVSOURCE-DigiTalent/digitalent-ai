using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Activates an invitation (public page /activate/:token): creates the account with the chosen password, grants
/// the invited role, creates the employee profile placed as invited, and marks the invitation ACCEPTED — all in
/// one save. The invitee then signs in normally.
/// </summary>
public class ActivateInvitationUseCase : IUseCase<ActivateInvitationUseCaseInput, ActivateInvitationUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ActivateInvitationUseCase(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<ActivateInvitationUseCaseOutput> ExecuteAsync(ActivateInvitationUseCaseInput input)
    {
        ActivateInvitationUseCaseOutput? result = null;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            result = await ExecuteCoreAsync(input);
        });
        return result!;
    }

    private async Task<ActivateInvitationUseCaseOutput> ExecuteCoreAsync(ActivateInvitationUseCaseInput input)
    {
        var now = DateTimeOffset.UtcNow;

        // 1. The token must match an open invitation (same 404 for every failure, see GetInvitationUseCase)
        var tokenHash = InvitationTokens.Hash(input.Token);
        var invitation = await _context.MemberInvitations.FirstOrDefaultAsync(i => i.TokenHash == tokenHash);
        if (invitation == null || !invitation.IsOpenAt(now))
        {
            throw new NotFoundException(GetInvitationUseCase.InvalidLinkMessage);
        }

        // 2. Rules that need the invitation
        if (string.Equals(input.Password.Trim(), invitation.Email, StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException("The password must not be the e-mail address.", "password", "PASSWORD_SAME_AS_EMAIL");
        }

        if (await _context.Users.AnyAsync(u => u.Email == invitation.Email))
        {
            throw new ConflictException("An account with this e-mail already exists.");
        }

        // 3. Account + role
        var fullName = string.IsNullOrWhiteSpace(input.FullName) ? invitation.FullName : input.FullName.Trim();
        var user = new User
        {
            OrganizationId = invitation.OrganizationId,
            Email = invitation.Email,
            PasswordHash = _passwordHasher.Hash(input.Password),
            DisplayName = fullName,
            Status = Statuses.User.Active,
            EmailVerifiedAt = now,
        };
        _context.Users.Add(user);
        _context.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = invitation.RoleId,
            AssignedByUserId = invitation.InvitedByUserId,
            AssignedAt = now,
        });

        // 4. Employee profile, placed as invited (falls back to the first active department)
        var roleCode = await _context.Roles.Where(r => r.Id == invitation.RoleId).Select(r => r.Code).SingleAsync();
        var employee = await CreateEmployeeAsync(invitation, user, fullName, roleCode);

        var isManager = roleCode == Roles.Manager;
        if (isManager && employee != null)
        {
            var department = await _context.Departments.SingleAsync(d => d.Id == employee.DepartmentId && d.OrganizationId == invitation.OrganizationId);
            if (department.ManagerEmployeeId.HasValue && department.ManagerEmployeeId != employee.Id)
                throw new ConflictException("Phòng ban đã có trưởng phòng. Hãy nhờ doanh nghiệp kiểm tra lại lời mời.");
            department.ManagerEmployeeId = employee.Id;
            employee.DirectManagerId = null;
            var colleagues = await _context.Employees.Where(e => e.DepartmentId == department.Id
                && e.Id != employee.Id && e.Status != Statuses.Employee.Archived).ToListAsync();
            foreach (var colleague in colleagues)
                colleague.DirectManagerId = employee.Id;

            var employeeRoleId = await _context.Roles.Where(r => r.Code == Roles.Employee).Select(r => (Guid?)r.Id).SingleOrDefaultAsync();
            if (employeeRoleId.HasValue)
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id, RoleId = employeeRoleId.Value,
                    AssignedByUserId = invitation.InvitedByUserId, AssignedAt = now,
                });
        }

        // 5. Close the invitation and log the activation in the organization's audit trail
        invitation.Status = Statuses.MemberInvitation.Accepted;
        invitation.AcceptedUserId = user.Id;
        invitation.AcceptedAt = now;

        // The caller is anonymous, so IAuditService (which reads the current user) cannot be used here
        _context.AuditLogs.Add(new AuditLog
        {
            OrganizationId = invitation.OrganizationId,
            ActorUserId = user.Id,
            Action = "INVITATION_ACCEPTED",
            EntityType = "users",
            EntityId = user.Id,
            EntityLabel = fullName,
        });

        await _context.SaveChangesAsync();

        return new ActivateInvitationUseCaseOutput
        {
            Email = user.Email,
            UserId = user.Id,
            EmployeeId = employee?.Id,
        };
    }

    /// <returns>The linked or new profile, or null when the organization has no active department yet.</returns>
    private async Task<Employee?> CreateEmployeeAsync(MemberInvitation invitation, User user, string fullName, string roleCode)
    {
        // HR may already have created a profile without account for this person (employees API): link it
        // instead of creating a duplicate (work e-mail is unique per organization)
        var existing = await _context.Employees.FirstOrDefaultAsync(e =>
            e.OrganizationId == invitation.OrganizationId
            && e.UserId == null
            && e.Status != Statuses.Employee.Archived
            && e.WorkEmail != null
            && e.WorkEmail.ToLower() == invitation.Email);
        if (existing != null)
        {
            if (invitation.DepartmentId.HasValue && existing.DepartmentId != invitation.DepartmentId.Value)
                throw new ConflictException("Hồ sơ nhân viên đang ở phòng ban khác lời mời. Hãy nhờ doanh nghiệp kiểm tra lại.");
            if (invitation.JobPositionId.HasValue && existing.JobPositionId != invitation.JobPositionId.Value)
                throw new ConflictException("Vị trí trên hồ sơ nhân viên khác lời mời. Hãy nhờ doanh nghiệp kiểm tra lại.");
        }

        var activeDepartments = _context.Departments
            .Where(d => d.OrganizationId == invitation.OrganizationId && d.Status == Statuses.MasterData.Active);

        var department = invitation.DepartmentId.HasValue
            ? await activeDepartments.FirstOrDefaultAsync(d => d.Id == invitation.DepartmentId.Value)
            : existing != null
                ? await activeDepartments.FirstOrDefaultAsync(d => d.Id == existing.DepartmentId)
                : await activeDepartments.OrderBy(d => d.Code).FirstOrDefaultAsync();
        if ((invitation.DepartmentId.HasValue || existing != null) && department == null)
            throw new ConflictException("Phòng ban trong lời mời không còn hoạt động. Hãy nhờ doanh nghiệp gửi lại lời mời.");
        if (department == null)
        {
            // employees.department_id is NOT NULL: the Owner places the member later (UpdateMember creates the profile)
            return null;
        }

        if (invitation.JobPositionId.HasValue && !await _context.JobPositions.AnyAsync(p =>
            p.Id == invitation.JobPositionId.Value && p.OrganizationId == invitation.OrganizationId
            && p.Status == Statuses.MasterData.Active))
            throw new ConflictException("Vị trí trong lời mời đã ngừng sử dụng. Hãy nhờ doanh nghiệp kiểm tra lại lời mời.");

        var directManagerId = roleCode == Roles.Manager
            ? null
            : await DepartmentRules.ResolveDirectManagerAsync(_context, department.Id, null);
        if (roleCode == Roles.Employee && invitation.DepartmentId.HasValue && !directManagerId.HasValue)
            throw new ConflictException("Trưởng phòng cần kích hoạt tài khoản trước. Bạn có thể dùng lại liên kết này sau.");

        if (existing != null)
        {
            existing.UserId = user.Id;
            existing.DirectManagerId = directManagerId == existing.Id ? null : directManagerId;
            return existing;
        }

        var employee = new Employee
        {
            OrganizationId = invitation.OrganizationId,
            UserId = user.Id,
            DepartmentId = department.Id,
            JobPositionId = invitation.JobPositionId,
            DirectManagerId = directManagerId,
            EmployeeCode = await EmployeeCodeGenerator.NextAsync(_context, invitation.OrganizationId, invitation.EmployeeCode),
            FullName = fullName,
            WorkEmail = invitation.Email,
            Status = Statuses.Employee.Active,
            JoinedAt = DateOnly.FromDateTime(DateTime.UtcNow),
        };
        _context.Employees.Add(employee);
        return employee;
    }
}
