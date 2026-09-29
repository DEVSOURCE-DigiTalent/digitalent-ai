using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.Services.Intelligence.SkillGap;

/// <summary>
/// Tự tính lại skill gap (generated_by = SYSTEM) khi cấp độ năng lực được xác nhận, khi kích hoạt bộ tiêu chuẩn mới
/// hoặc khi nhân viên đổi vị trí (spec §6.2). Chạy trong transaction của use case phát event;
/// thông báo được lưu vào notifications và push SignalR sau commit (§6.4 E9).
/// </summary>
public class SkillGapRecalculationHandler :
    IDomainEventHandler<EmployeeCompetencyLevelConfirmed>,
    IDomainEventHandler<PositionRequirementSetActivated>,
    IDomainEventHandler<EmployeeJobPositionChanged>
{
    public const string NotificationType = "SKILL_GAP_UPDATED";
    public const int MaxEmployeesPerActivation = 500;

    private readonly IApplicationDbContext _context;
    private readonly SkillGapRunService _runService;
    private readonly IAfterCommitQueue _afterCommit;
    private readonly INotificationSender _notificationSender;
    private readonly ILogger<SkillGapRecalculationHandler> _logger;

    public SkillGapRecalculationHandler(
        IApplicationDbContext context,
        SkillGapRunService runService,
        IAfterCommitQueue afterCommit,
        INotificationSender notificationSender,
        ILogger<SkillGapRecalculationHandler> logger)
    {
        _context = context;
        _runService = runService;
        _afterCommit = afterCommit;
        _notificationSender = notificationSender;
        _logger = logger;
    }

    public Task HandleAsync(IReadOnlyList<EmployeeCompetencyLevelConfirmed> events, CancellationToken cancellationToken) =>
        RecalculateAsync(events.Select(e => e.EmployeeId));

    public Task HandleAsync(IReadOnlyList<EmployeeJobPositionChanged> events, CancellationToken cancellationToken) =>
        RecalculateAsync(events.Select(e => e.EmployeeId));

    public async Task HandleAsync(IReadOnlyList<PositionRequirementSetActivated> events, CancellationToken cancellationToken)
    {
        var employeeIds = new List<Guid>();
        foreach (var positionId in events.Select(e => e.JobPositionId).Distinct())
        {
            var ids = await _context.Employees
                .AsNoTracking()
                .Where(e => e.JobPositionId == positionId && e.Status == Statuses.Employee.Active)
                .Select(e => e.Id)
                .Take(MaxEmployeesPerActivation + 1)
                .ToListAsync(cancellationToken);

            if (ids.Count > MaxEmployeesPerActivation)
            {
                _logger.LogWarning(
                    "Skipped automatic skill gap recalculation for job position {JobPositionId}: more than {Max} active employees; use calculate-batch",
                    positionId, MaxEmployeesPerActivation);
                continue;
            }

            employeeIds.AddRange(ids);
        }

        await RecalculateAsync(employeeIds);
    }

    private async Task RecalculateAsync(IEnumerable<Guid> employeeIds)
    {
        var ids = employeeIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return;
        }

        var employees = await _context.Employees
            .AsNoTracking()
            .Where(e => ids.Contains(e.Id) && e.Status == Statuses.Employee.Active)
            .ToListAsync();

        foreach (var organization in employees.GroupBy(e => e.OrganizationId))
        {
            var outcomes = await _runService.StageRunsAsync(organization.ToList(), organization.Key, Statuses.SkillGapGeneratedBy.System);
            foreach (var outcome in outcomes)
            {
                if (outcome.Run == null)
                {
                    _logger.LogDebug("Skill gap not recalculated for employee {EmployeeId}: {Reason}", outcome.Employee.Id, outcome.SkipReason);
                    continue;
                }

                Notify(outcome.Employee, outcome.Run);
            }
        }
    }

    private void Notify(Employee employee, SkillGapRun run)
    {
        if (employee.UserId is not { } userId)
        {
            return;
        }

        const string title = "Skill gap updated";
        var message = run.GapCount == 0
            ? "Your competencies now meet your position standard."
            : $"Your skill gap analysis was updated: {run.GapCount} competency gap(s) remaining.";

        _context.Notifications.Add(new Notification
        {
            RecipientUserId = userId,
            Type = NotificationType,
            Title = title,
            Message = message,
            RelatedEntityType = "skill_gap_runs",
            RelatedEntityId = run.Id,
        });

        var payload = new { runId = run.Id, gapCount = run.GapCount };
        _afterCommit.Enqueue(
            $"push {NotificationType} to user {userId}",
            ct => _notificationSender.SendNotificationToUserAsync(userId, title, message, NotificationType, payload, ct));
    }
}
