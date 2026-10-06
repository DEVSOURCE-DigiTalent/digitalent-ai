using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.OrganizationOverview;

/// <summary>
/// Organization overview (OW-01): members, seats and plan, running training batches, task submissions awaiting
/// review, setup progress and recent activity. Read-only.
/// </summary>
public class GetOrganizationOverviewUseCase : IUseCase<GetOrganizationOverviewUseCaseInput, GetOrganizationOverviewUseCaseOutput>
{
    private const int RecentActivityLimit = 5;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetOrganizationOverviewUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetOrganizationOverviewUseCaseOutput> ExecuteAsync(GetOrganizationOverviewUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var organization = await _context.Organizations
            .Where(o => o.Id == organizationId)
            .Select(o => new { o.Name, o.SetupCompletedAt })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Organization not found.");

        var subscription = await _context.OrganizationSubscriptions
            .Where(s => s.OrganizationId == organizationId)
            .Select(s => new { s.PlanCode, s.PlanName, s.Status, s.RenewsAt, s.SeatLimit })
            .FirstOrDefaultAsync();

        var members = await CountMembersAsync(organizationId);

        return new GetOrganizationOverviewUseCaseOutput
        {
            Name = organization.Name,
            Members = members,
            Seats = new SeatUsage
            {
                Used = await _context.Users.CountAsync(u => u.OrganizationId == organizationId && u.Status == Statuses.User.Active),
                Limit = subscription?.SeatLimit,
            },
            Plan = subscription == null
                ? null
                : new PlanSummary { Code = subscription.PlanCode, Name = subscription.PlanName, Status = subscription.Status, RenewsAt = subscription.RenewsAt },
            PendingReviews = await CountPendingReviewsAsync(organizationId),
            RunningBatches = await _context.TrainingBatches
                .CountAsync(b => b.OrganizationId == organizationId && b.Status == Statuses.TrainingBatch.Running),
            Setup = await BuildSetupAsync(organizationId, members),
            SetupCompleted = organization.SetupCompletedAt != null,
            RecentActivity = await GetRecentActivityAsync(organizationId),
        };
    }

    private async Task<MemberCounts> CountMembersAsync(Guid organizationId)
    {
        var rows = await (
                from employee in _context.Employees
                where employee.OrganizationId == organizationId && employee.Status != Statuses.Employee.Archived
                join user in _context.Users on employee.UserId equals user.Id into accounts
                from account in accounts.DefaultIfEmpty()
                select new
                {
                    employee.Status,
                    NeverLoggedIn = account != null && account.LastLoginAt == null,
                })
            .ToListAsync();

        var active = rows.Where(r => r.Status == Statuses.Employee.Active).ToList();
        return new MemberCounts
        {
            Active = active.Count(r => !r.NeverLoggedIn),
            Pending = active.Count(r => r.NeverLoggedIn),
            Inactive = rows.Count(r => r.Status == Statuses.Employee.Inactive),
        };
    }

    private async Task<List<SetupItem>> BuildSetupAsync(Guid organizationId, MemberCounts members)
    {
        var departments = await _context.Departments
            .CountAsync(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active);

        var activePositions = _context.JobPositions
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active);
        var positions = await activePositions.CountAsync();
        var withRequirements = await activePositions.CountAsync(p => _context.PositionRequirementSets
            .Any(s => s.JobPositionId == p.Id && s.Status == Statuses.PositionRequirementSet.Active));

        return new List<SetupItem>
        {
            new() { Key = "departments", Label = "Phòng ban", Done = departments > 0, Detail = $"{departments} phòng ban", Path = "/enterprise/departments" },
            new() { Key = "positions", Label = "Vị trí công việc", Done = positions > 0, Detail = $"{positions} vị trí", Path = "/enterprise/positions" },
            new()
            {
                Key = "requirements",
                Label = "Yêu cầu năng lực theo vị trí",
                Done = positions > 0 && withRequirements == positions,
                Detail = $"{withRequirements}/{positions} vị trí đã có yêu cầu đang áp dụng",
                Path = "/enterprise/positions/requirements",
            },
            new()
            {
                Key = "members",
                Label = "Thành viên",
                Done = members.Active + members.Pending > 1,
                Detail = $"{members.Active} đang hoạt động, {members.Pending} chờ kích hoạt",
                Path = "/enterprise/members",
            },
        };
    }

    private Task<int> CountPendingReviewsAsync(Guid organizationId) =>
        (from submission in _context.TaskSubmissions
         join assignment in _context.TaskAssignments on submission.TaskAssignmentId equals assignment.Id
         join employee in _context.Employees on assignment.EmployeeId equals employee.Id
         where employee.OrganizationId == organizationId
               && (submission.Status == Statuses.TaskSubmission.Submitted || submission.Status == Statuses.TaskSubmission.UnderReview)
               && !_context.TaskEvaluations.Any(e => e.TaskSubmissionId == submission.Id)
         select submission.Id).CountAsync();

    private async Task<List<RecentActivityItem>> GetRecentActivityAsync(Guid organizationId)
    {
        var rows = await (
                from log in _context.AuditLogs
                where log.OrganizationId == organizationId
                join user in _context.Users on log.ActorUserId equals user.Id into actors
                from actor in actors.DefaultIfEmpty()
                orderby log.CreatedAt descending, log.Id descending
                select new { log.Id, log.CreatedAt, ActorName = actor.DisplayName, log.Action, log.EntityType, log.EntityLabel })
            .Take(RecentActivityLimit)
            .ToListAsync();

        return rows.Select(r => new RecentActivityItem
        {
            Id = r.Id,
            At = r.CreatedAt,
            ActorName = r.ActorName,
            Action = r.Action,
            TargetType = r.EntityType,
            TargetLabel = r.EntityLabel ?? r.EntityType,
        }).ToList();
    }
}
