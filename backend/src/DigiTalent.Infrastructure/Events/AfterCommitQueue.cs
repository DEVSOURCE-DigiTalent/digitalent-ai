using DigiTalent.Application.Common.Events;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Events;

/// <summary>
/// Tác vụ chờ đến khi transaction commit (scoped theo request). AppDbContext gọi RunAsync sau commit
/// và Clear khi lưu thất bại. Lỗi của từng tác vụ chỉ được ghi log.
/// </summary>
public class AfterCommitQueue : IAfterCommitQueue
{
    private readonly List<(string Description, Func<CancellationToken, Task> Action)> _actions = new();
    private readonly ILogger<AfterCommitQueue> _logger;

    public AfterCommitQueue(ILogger<AfterCommitQueue> logger)
    {
        _logger = logger;
    }

    public void Enqueue(string description, Func<CancellationToken, Task> action) => _actions.Add((description, action));

    public void Clear() => _actions.Clear();

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var pending = _actions.ToList();
        _actions.Clear();

        foreach (var (description, action) in pending)
        {
            try
            {
                await action(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "After-commit action failed: {Description}", description);
            }
        }
    }
}
