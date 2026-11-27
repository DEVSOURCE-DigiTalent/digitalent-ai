using System.Net.Mail;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
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
        var accepted = new List<(MemberInvitation Invitation, string Token, string Role)>();
        var departments = new Dictionary<Guid, string>();
        var positions = new Dictionary<Guid, string>();

        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var roleIds = await _context.Roles.ToDictionaryAsync(r => r.Code, r => r.Id);
            var researchEnabled = input.Rows.Any(row => MemberRoles.ToRoleCode(row.Role) == Roles.Research)
                && await Research.EnterpriseResearch.IsEnabledAsync(_context, organizationId);
            var allDepartments = await _context.Departments
                .Where(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active)
                .ToListAsync();
            departments = allDepartments.ToDictionary(d => d.Id, d => d.Name);

            var allPositions = await _context.JobPositions
                .Where(p => p.OrganizationId == organizationId)
                .ToListAsync();
            positions = allPositions.ToDictionary(p => p.Id, p => p.Name);
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
            var managerRoleId = roleIds.TryGetValue(Roles.Manager, out var managerId) ? managerId : Guid.Empty;
            var reservedDepartments = (await _context.MemberInvitations
                    .Where(i => i.OrganizationId == organizationId && i.RoleId == managerRoleId
                        && i.DepartmentId.HasValue && i.Status == Statuses.MemberInvitation.Pending && i.ExpiresAt > now)
                    .Select(i => i.DepartmentId!.Value).ToListAsync()).ToHashSet();
            var staffedDepartments = allDepartments.Where(d => d.ManagerEmployeeId.HasValue).Select(d => d.Id).ToHashSet();
            foreach (var row in input.Rows.OrderByDescending(r => MemberRoles.ToRoleCode(r.Role) == Roles.Manager))
            {
                var email = NormalizeEmail(row.Email);
                var fullName = row.FullName?.Trim() ?? string.Empty;
                var employeeCode = string.IsNullOrWhiteSpace(row.EmployeeCode) ? null : row.EmployeeCode.Trim().ToUpperInvariant();
                var roleCode = MemberRoles.ToRoleCode(row.Role);

                var department = row.DepartmentId.HasValue
                    ? allDepartments.FirstOrDefault(d => d.Id == row.DepartmentId.Value)
                    : allDepartments.FirstOrDefault(d =>
                        d.Name.Equals(row.DepartmentName?.Trim(), StringComparison.OrdinalIgnoreCase) ||
                        d.Code.Equals(row.DepartmentName?.Trim(), StringComparison.OrdinalIgnoreCase));
                var reason = RejectIdentity(email, fullName, employeeCode, roleCode, canGrantRoles, takenEmails, takenCodes);
                if (reason == null && roleCode == Roles.Research && (!researchEnabled || !roleIds.ContainsKey(Roles.Research)))
                    reason = "Bật tính năng R&D trong cài đặt doanh nghiệp trước khi mời.";
                if (reason == null)
                {
                    reason = row.DepartmentId.HasValue && department == null ? "Phòng ban không hợp lệ."
                        : (roleCode == Roles.Employee || roleCode == Roles.Manager) && department == null &&
                            (roleCode != Roles.Manager || string.IsNullOrWhiteSpace(row.DepartmentName) || row.DepartmentName.Trim().Length > 150)
                            ? "Phòng ban cần có trưởng phòng trước khi thêm nhân viên."
                        : roleCode == Roles.Manager && department != null &&
                            (staffedDepartments.Contains(department.Id) || reservedDepartments.Contains(department.Id))
                            ? "Phòng ban đã có trưởng phòng hoặc lời mời trưởng phòng."
                        : roleCode == Roles.Employee && department != null && !staffedDepartments.Contains(department.Id) &&
                            !reservedDepartments.Contains(department.Id)
                            ? "Phòng ban cần có trưởng phòng trước khi thêm nhân viên."
                        : null;
                }
                if (reason == null && seatLimit.HasValue && seatsUsed >= seatLimit.Value)
                {
                    reason = "Đã hết quyền sử dụng của gói.";
                }

                if (reason != null)
                {
                    output.Rejected.Add(new RejectedInvitation { Email = email, Reason = reason });
                    continue;
                }

                var newDepartment = department == null && roleCode == Roles.Manager;
                if (newDepartment)
                {
                    department = new Department
                    {
                        OrganizationId = organizationId, Code = $"PB-{Guid.NewGuid():N}"[..15],
                        Name = row.DepartmentName!.Trim(), Status = Statuses.MasterData.Active,
                    };
                }

                // A position is one of the 5 standard ones, shared by every department (StandardPositions).
                var positionName = row.JobPositionName?.Trim() ?? string.Empty;
                JobPosition? position = null;
                if (row.JobPositionId.HasValue)
                {
                    position = allPositions.Find(p => p.Id == row.JobPositionId.Value);
                    if (position is not { Status: Statuses.MasterData.Active })
                    {
                        output.Rejected.Add(new RejectedInvitation { Email = email, Reason = "Vị trí công việc không còn hoạt động." });
                        continue;
                    }
                }
                else if (positionName.Length > 0)
                {
                    var (resolved, error) = StandardPositions.Resolve(_context, organizationId, allPositions, positionName);
                    if (resolved == null)
                    {
                        output.Rejected.Add(new RejectedInvitation { Email = email, Reason = error! });
                        continue;
                    }
                    position = resolved;
                    positions[position.Id] = position.Name;
                }

                if (position == null && (roleCode == Roles.Employee || roleCode == Roles.Manager))
                {
                    output.Rejected.Add(new RejectedInvitation { Email = email, Reason = StandardPositions.NotStandard });
                    continue;
                }

                if (newDepartment)
                {
                    _context.Departments.Add(department!);
                    allDepartments.Add(department!);
                    departments[department!.Id] = department.Name;
                }

                row.JobPositionId = position?.Id;
                row.DepartmentId = department?.Id;
                if (roleCode == Roles.Manager && department != null)
                    reservedDepartments.Add(department.Id);

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

            if (accepted.Count > 0) await _context.SaveChangesAsync();
        });

        if (accepted.Count == 0) return output;

        var trial = await _context.TrialWorkspaces.FirstOrDefaultAsync(t => t.OrganizationId == organizationId);
        var assessmentNote = trial?.TestDeadline is { } deadline
            ? $"Bài đánh giá năng lực số của đội ngũ cần hoàn thành trước {deadline:HH:mm dd/MM/yyyy}."
            : "Sau khi kích hoạt tài khoản, bạn hãy đăng nhập để làm bài test đánh giá năng lực số ban đầu.";
        var emailNote = string.IsNullOrWhiteSpace(input.EmailNote)
            ? assessmentNote
            : input.EmailNote.Contains("đánh giá") ? input.EmailNote : $"{input.EmailNote}\n\n{assessmentNote}";

        var failedManagerDepartments = new HashSet<Guid>();
        foreach (var (invitation, token, role) in accepted)
        {
            if (role == MemberRoles.Employee && invitation.DepartmentId is { } departmentId && failedManagerDepartments.Contains(departmentId))
            {
                invitation.Status = Statuses.MemberInvitation.Revoked;
                await _context.SaveChangesAsync();
                output.Rejected.Add(new RejectedInvitation { Email = invitation.Email, Reason = "Chưa gửi được lời mời trưởng phòng của phòng ban này." });
                continue;
            }

            string? link;
            try
            {
                link = await _invitationSender.SendAsync(new InvitationMessage(invitation.Email, invitation.FullName, organizationName, token, emailNote));
            }
            catch
            {
                if (role == MemberRoles.Manager && invitation.DepartmentId is { } managerDepartmentId)
                    failedManagerDepartments.Add(managerDepartmentId);
                // A failed email must not leave a reserved seat or a misleading "sent" invitation.
                invitation.Status = Statuses.MemberInvitation.Revoked;
                await _context.SaveChangesAsync();
                output.Rejected.Add(new RejectedInvitation { Email = invitation.Email, Reason = "Không gửi được email mời. Kiểm tra cấu hình email và thử lại." });
                continue;
            }
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
    private static string? RejectIdentity(
        string email,
        string fullName,
        string? employeeCode,
        string? roleCode,
        bool canGrantRoles,
        HashSet<string> takenEmails,
        HashSet<string> takenCodes)
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

        return null;
    }

    private static string NormalizeEmail(string? email) => email?.Trim().ToLowerInvariant() ?? string.Empty;

    private static bool IsValidEmail(string email) =>
        email.Length is > 0 and <= 255
        && MailAddress.TryCreate(email, out var address)
        && address.Address == email;
}
