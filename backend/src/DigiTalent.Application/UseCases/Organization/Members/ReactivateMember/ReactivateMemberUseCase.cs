using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Gives a deactivated member access again (OW-03 "Kích hoạt lại"). Needs a free seat when the member has an account.
/// </summary>
public class ReactivateMemberUseCase : IUseCase<ReactivateMemberUseCaseInput, ReactivateMemberUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly MemberDirectory _directory;

    public ReactivateMemberUseCase(
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

    public async Task<ReactivateMemberUseCaseOutput> ExecuteAsync(ReactivateMemberUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var member = await MemberRules.FindManageableAsync(_directory, organizationId, input.Id);

        if (member.Status != MemberStatuses.Inactive)
        {
            throw new ConflictException("The member is already active.");
        }

        if (member.UserId.HasValue)
        {
            // An account takes a seat again
            var seatLimit = await _directory.GetSeatLimitAsync(organizationId);
            if (seatLimit.HasValue && await _directory.CountSeatsInUseAsync(organizationId) >= seatLimit.Value)
            {
                throw new ConflictException("No seats left on the plan. Upgrade the plan or free a seat first.");
            }

            var user = await _context.Users.FirstAsync(u => u.Id == member.UserId.Value);
            user.Status = Statuses.User.Active;
            user.DeactivatedReason = null;
            user.FailedLoginCount = 0;
            user.LockedUntil = null;
        }

        if (member.EmployeeId.HasValue)
        {
            var employee = await _context.Employees.FirstAsync(e => e.Id == member.EmployeeId.Value);
            if (employee.Status == Statuses.Employee.Inactive)
            {
                employee.Status = Statuses.Employee.Active;
            }
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "MEMBER_REACTIVATED",
            member.UserId.HasValue ? "users" : "employees",
            member.UserId ?? member.EmployeeId,
            entityLabel: member.FullName);

        var updated = await _directory.FindAsync(organizationId, member.Id)
            ?? throw new NotFoundException($"Member '{member.Id}' not found.");
        return updated.CopyTo<ReactivateMemberUseCaseOutput>();
    }
}
