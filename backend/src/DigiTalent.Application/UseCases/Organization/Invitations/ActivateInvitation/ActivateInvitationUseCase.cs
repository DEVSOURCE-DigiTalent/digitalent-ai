using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants;
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
        var employee = await CreateEmployeeAsync(invitation, user, fullName);

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
    private async Task<Employee?> CreateEmployeeAsync(MemberInvitation invitation, User user, string fullName)
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
            existing.UserId = user.Id;
            return existing;
        }

        var activeDepartments = _context.Departments
            .Where(d => d.OrganizationId == invitation.OrganizationId && d.Status == Statuses.MasterData.Active);

        var department = await activeDepartments.FirstOrDefaultAsync(d => d.Id == invitation.DepartmentId)
            ?? await activeDepartments.OrderBy(d => d.Code).FirstOrDefaultAsync();
        if (department == null)
        {
            // employees.department_id is NOT NULL: the Owner places the member later (UpdateMember creates the profile)
            return null;
        }

        var positionIsActive = invitation.JobPositionId.HasValue && await _context.JobPositions.AnyAsync(p =>
            p.Id == invitation.JobPositionId.Value && p.OrganizationId == invitation.OrganizationId && p.Status == Statuses.MasterData.Active);

        var employee = new Employee
        {
            OrganizationId = invitation.OrganizationId,
            UserId = user.Id,
            DepartmentId = department.Id,
            JobPositionId = positionIsActive ? invitation.JobPositionId : null,
            DirectManagerId = department.ManagerEmployeeId,
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
