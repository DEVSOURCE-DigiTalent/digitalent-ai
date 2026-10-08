using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Offboards a member (OW-03 "Vô hiệu hóa"): the account becomes INACTIVE — every request with its token is
/// rejected immediately (IPermissionService.IsAccountUsableAsync) — and the employee profile INACTIVE.
/// Learning history, evidence and certificates are kept; the seat is released.
/// </summary>
public class DeactivateMemberUseCase : IUseCase<DeactivateMemberUseCaseInput, DeactivateMemberUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly MemberDirectory _directory;

    public DeactivateMemberUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IAuditService auditService,
        MemberDirectory directory)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _directory = directory;
    }

    public async Task<DeactivateMemberUseCaseOutput> ExecuteAsync(DeactivateMemberUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var member = await MemberRules.FindManageableAsync(_directory, organizationId, input.Id);

        // 1. Business rules
        if (member.UserId.HasValue && member.UserId == _currentUser.UserId)
        {
            throw new ConflictException("You cannot deactivate your own account.");
        }

        if (member.Status == MemberStatuses.Inactive)
        {
            throw new ConflictException("The member is already deactivated.");
        }

        await MemberRules.EnsureAnotherOwnerRemainsAsync(_directory, organizationId, member);

        // 2. Account and employee profile become INACTIVE
        var reason = input.Reason.Trim();
        if (member.UserId.HasValue)
        {
            var user = await _context.Users.FirstAsync(u => u.Id == member.UserId.Value);
            user.Status = Statuses.User.Inactive;
            user.DeactivatedReason = reason;
        }

        if (member.EmployeeId.HasValue)
        {
            var employee = await _context.Employees.FirstAsync(e => e.Id == member.EmployeeId.Value);
            if (employee.Status == Statuses.Employee.Active)
            {
                employee.Status = Statuses.Employee.Inactive;
            }
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "MEMBER_DEACTIVATED",
            member.UserId.HasValue ? "users" : "employees",
            member.UserId ?? member.EmployeeId,
            newValues: new { reason },
            entityLabel: member.FullName);

        var updated = await _directory.FindAsync(organizationId, member.Id)
            ?? throw new NotFoundException($"Member '{member.Id}' not found.");
        return updated.CopyTo<DeactivateMemberUseCaseOutput>();
    }
}
