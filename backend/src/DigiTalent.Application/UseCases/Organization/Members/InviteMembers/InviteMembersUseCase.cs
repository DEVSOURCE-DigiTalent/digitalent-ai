using System.Net.Mail;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Invites people to the caller's organization (OW-02). Each valid row becomes a PENDING invitation that reserves
/// a seat; invalid rows are returned in <see cref="InviteMembersUseCaseOutput.Rejected"/> with a reason.
/// The account is created later, when the invitee activates the link (ActivateInvitation).
/// </summary>
public class InviteMembersUseCase : IUseCase<InviteMembersUseCaseInput, InviteMembersUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionService _permissionService;
    private readonly IInvitationSender _invitationSender;
    private readonly IAuditService _auditService;
    private readonly MemberDirectory _directory;

    public InviteMembersUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPermissionService permissionService,
        IInvitationSender invitationSender,
        IAuditService auditService,
        MemberDirectory directory)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionService = permissionService;
        _invitationSender = invitationSender;
        _auditService = auditService;
        _directory = directory;
    }

    public async Task<InviteMembersUseCaseOutput> ExecuteAsync(InviteMembersUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var now = DateTimeOffset.UtcNow;
        var output = new InviteMembersUseCaseOutput();

        // 1. Reference data used to check every row
        var organizationName = await _context.Organizations
            .Where(o => o.Id == organizationId)
            .Select(o => o.Name)
            .FirstOrDefaultAsync() ?? string.Empty;
        var roleIds = await _context.Roles.ToDictionaryAsync(r => r.Code, r => r.Id);
        var departments = await _context.Departments
            .Where(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active)
            .ToDictionaryAsync(d => d.Id, d => d.Name);
        var positions = await _context.JobPositions
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active)
            .ToDictionaryAsync(p => p.Id, p => p.Name);
        var canGrantRoles = await _permissionService.HasAnyAsync(_currentUser.Roles, new[] { Permissions.UserRole.RoleAssignBusiness });

        var emails = input.Rows.Select(r => NormalizeEmail(r.Email)).ToList();
        var takenEmails = (await _context.Users
                .Where(u => emails.Contains(u.Email))
                .Select(u => u.Email)
                .ToListAsync())
            .Concat(await _context.MemberInvitations
                .Where(i => i.OrganizationId == organizationId
                            && i.Status == Statuses.MemberInvitation.Pending
                            && emails.Contains(i.Email))
                .Select(i => i.Email)
                .ToListAsync())
            .ToHashSet();
        var takenCodes = (await _context.Employees
                .Where(e => e.OrganizationId == organizationId)
                .Select(e => e.EmployeeCode)
                .ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var seatLimit = await _directory.GetSeatLimitAsync(organizationId);
        var seatsUsed = await _directory.CountSeatsInUseAsync(organizationId);

        // 2. Check each row; accepted rows become invitations
        var accepted = new List<(MemberInvitation Invitation, string Token, string Role)>();
        foreach (var row in input.Rows)
        {
            var email = NormalizeEmail(row.Email);
            var fullName = row.FullName?.Trim() ?? string.Empty;
            var employeeCode = string.IsNullOrWhiteSpace(row.EmployeeCode) ? null : row.EmployeeCode.Trim().ToUpperInvariant();
            var roleCode = MemberRoles.ToRoleCode(row.Role);

            var reason = Reject(email, fullName, employeeCode, roleCode, row, canGrantRoles, takenEmails, takenCodes, departments, positions);
            if (reason == null && seatLimit.HasValue && seatsUsed >= seatLimit.Value)
            {
                reason = "Đã hết quyền sử dụng của gói.";
            }

            if (reason != null)
            {
                output.Rejected.Add(new RejectedInvitation { Email = email, Reason = reason });
                continue;
            }

            var token = InvitationTokens.NewToken();
            var invitation = new MemberInvitation
            {
                OrganizationId = organizationId,
                Email = email,
                FullName = fullName,
                EmployeeCode = employeeCode,
                RoleId = roleIds[roleCode!],
                DepartmentId = row.DepartmentId,
                JobPositionId = row.JobPositionId,
                TokenHash = InvitationTokens.Hash(token),
                Status = Statuses.MemberInvitation.Pending,
                InvitedByUserId = _currentUser.UserId,
                InvitedAt = now,
                ExpiresAt = now.Add(InvitationTokens.Lifetime),
            };
            _context.MemberInvitations.Add(invitation);
            accepted.Add((invitation, token, MemberRoles.FromRoleCode(roleCode!)!));

            takenEmails.Add(email);
            if (employeeCode != null)
            {
                takenCodes.Add(employeeCode);
            }

            seatsUsed++;
        }

        if (accepted.Count == 0)
        {
            return output;
        }

        // 3. Save all invitations at once, then deliver the links and log (outside the unit of work)
        await _context.SaveChangesAsync();

        foreach (var (invitation, token, role) in accepted)
        {
            var link = await _invitationSender.SendAsync(new InvitationMessage(invitation.Email, invitation.FullName, organizationName, token));
            output.Created.Add(new InvitationSummary
            {
                Id = invitation.Id,
                Email = invitation.Email,
                FullName = invitation.FullName,
                Role = role,
                EmployeeCode = invitation.EmployeeCode,
                DepartmentName = invitation.DepartmentId.HasValue ? departments[invitation.DepartmentId.Value] : null,
                PositionName = invitation.JobPositionId.HasValue ? positions[invitation.JobPositionId.Value] : null,
                ExpiresAt = invitation.ExpiresAt,
                Token = link == null ? null : token,
                DebugLink = link,
            });

            await _auditService.LogAsync(
                "MEMBER_INVITED",
                "member_invitations",
                invitation.Id,
                newValues: new { invitation.Email, role },
                entityLabel: invitation.FullName);
        }

        return output;
    }

    /// <summary>Reason (Vietnamese UI text) why a row cannot be invited; null when it is valid.</summary>
    private static string? Reject(
        string email,
        string fullName,
        string? employeeCode,
        string? roleCode,
        InviteMemberRow row,
        bool canGrantRoles,
        HashSet<string> takenEmails,
        HashSet<string> takenCodes,
        Dictionary<Guid, string> departments,
        Dictionary<Guid, string> positions)
    {
        if (!IsValidEmail(email))
        {
            return "Email không hợp lệ.";
        }

        if (fullName.Length == 0 || fullName.Length > 200)
        {
            return "Thiếu họ tên hoặc họ tên quá dài.";
        }

        if (roleCode == null)
        {
            return "Vai trò không hợp lệ.";
        }

        // Plain employees can be invited with user.create alone; other roles need role.assign_business
        if (roleCode != Roles.Employee && !canGrantRoles)
        {
            return "Bạn không được cấp vai trò này.";
        }

        if (takenEmails.Contains(email))
        {
            return "Email đã có tài khoản hoặc đã được mời.";
        }

        if (employeeCode != null && (employeeCode.Length > 50 || takenCodes.Contains(employeeCode)))
        {
            return "Mã nhân viên không hợp lệ hoặc đã tồn tại.";
        }

        if (row.DepartmentId.HasValue && !departments.ContainsKey(row.DepartmentId.Value))
        {
            return "Phòng ban không hợp lệ.";
        }

        if (row.JobPositionId.HasValue && !positions.ContainsKey(row.JobPositionId.Value))
        {
            return "Vị trí công việc không hợp lệ.";
        }

        return null;
    }

    private static string NormalizeEmail(string? email) => email?.Trim().ToLowerInvariant() ?? string.Empty;

    private static bool IsValidEmail(string email) =>
        email.Length is > 0 and <= 255
        && MailAddress.TryCreate(email, out var address)
        && address.Address == email;
}
