using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-14 — Nhiệm vụ của tôi: nhiệm vụ thực tế được giao cho chính mình (trừ nhiệm vụ đã hủy).</summary>
public class GetMyTasksUseCase : IUseCase<GetMyTasksUseCaseInput, GetMyTasksUseCaseOutput>
{
    private readonly MyEmployeeContext _me;
    private readonly MyTaskReader _taskReader;

    public GetMyTasksUseCase(MyEmployeeContext me, MyTaskReader taskReader)
    {
        _me = me;
        _taskReader = taskReader;
    }

    public async Task<GetMyTasksUseCaseOutput> ExecuteAsync(GetMyTasksUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        var items = (await _taskReader.LoadAsync(employee.Id))
            .Select(task => MyTaskCardDto.Map<MyTaskCardDto>(task, now))
            // Việc cần làm trước (quá hạn / hạn gần nhất), việc đã xong xuống cuối
            .OrderBy(t => t.CanSubmit ? 0 : t.Status == Statuses.TaskAssignment.Submitted ? 1 : 2)
            .ThenBy(t => t.DueAt ?? DateTimeOffset.MaxValue)
            .ThenByDescending(t => t.AssignedAt)
            .ToList();

        return new GetMyTasksUseCaseOutput
        {
            Items = items,
            Summary = new MyTaskSummaryDto
            {
                Total = items.Count,
                ToDo = items.Count(t => t.CanSubmit),
                PendingReview = items.Count(t => t.Status == Statuses.TaskAssignment.Submitted),
                NeedsRevision = items.Count(t => t.Status == Statuses.TaskAssignment.NeedsRevision),
                Passed = items.Count(t => t.Status == Statuses.TaskAssignment.Passed),
                Failed = items.Count(t => t.Status == Statuses.TaskAssignment.Failed),
                Overdue = items.Count(t => t.IsOverdue),
            },
        };
    }
}
