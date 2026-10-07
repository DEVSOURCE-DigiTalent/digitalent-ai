using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Member detail (OW-03): profile, roles, placement, metrics, direct manager and history (latest audit entries
/// targeting the member's account, employee profile or invitation).
/// </summary>
public class GetMemberByIdUseCase : IUseCase<GetMemberByIdUseCaseInput, GetMemberByIdUseCaseOutput>
{
    private const int HistoryLimit = 20;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly MemberDirectory _directory;

    public GetMemberByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser, MemberDirectory directory)
    {
        _context = context;
        _currentUser = currentUser;
        _directory = directory;
    }

    public async Task<GetMemberByIdUseCaseOutput> ExecuteAsync(GetMemberByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var member = await _directory.FindAsync(organizationId, input.Id)
            ?? throw new NotFoundException($"Member '{input.Id}' not found.");
        await _directory.AddMetricsAsync(new[] { member });

        var output = member.CopyTo<GetMemberByIdUseCaseOutput>();

        if (member.EmployeeId.HasValue)
        {
            var manager = await (
                    from employee in _context.Employees
                    where employee.Id == member.EmployeeId.Value
                    join directManager in _context.Employees on employee.DirectManagerId equals directManager.Id
                    select new { directManager.Id, directManager.FullName })
                .FirstOrDefaultAsync();
            output.DirectManagerId = manager?.Id;
            output.DirectManagerName = manager?.FullName;
        }

        output.History = await LoadHistoryAsync(organizationId, member);
        return output;
    }

    private async Task<List<MemberHistoryEntry>> LoadHistoryAsync(Guid organizationId, MemberListItem member)
    {
        var targetIds = new[] { member.Id, member.UserId, member.EmployeeId }
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        var rows = await (
                from log in _context.AuditLogs
                where log.OrganizationId == organizationId && log.EntityId != null && targetIds.Contains(log.EntityId.Value)
                join user in _context.Users on log.ActorUserId equals user.Id into actors
                from actor in actors.DefaultIfEmpty()
                orderby log.CreatedAt descending, log.Id descending
                select new { log.Id, log.CreatedAt, ActorName = actor.DisplayName, log.Action, log.EntityType, log.EntityLabel })
            .Take(HistoryLimit)
            .ToListAsync();

        return rows.Select(r => new MemberHistoryEntry
        {
            Id = r.Id,
            At = r.CreatedAt,
            ActorName = r.ActorName,
            Action = r.Action,
            TargetType = r.EntityType,
            TargetLabel = r.EntityLabel ?? member.FullName,
        }).ToList();
    }
}
