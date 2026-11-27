using System.Collections.Concurrent;
using System.Threading.Channels;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.BehaviorReports;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>Hàng đợi trong bộ nhớ của các báo cáo hành vi chờ AI phân tích; một báo cáo chỉ nằm trong hàng một lần.</summary>
public sealed class BehaviorAnalysisQueue : IBehaviorAnalysisQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });
    private readonly ConcurrentDictionary<Guid, byte> _queued = new();

    public void Enqueue(Guid reportId)
    {
        if (_queued.TryAdd(reportId, 0))
        {
            _channel.Writer.TryWrite(reportId);
        }
    }

    public async ValueTask<Guid> DequeueAsync(CancellationToken cancellationToken)
    {
        var reportId = await _channel.Reader.ReadAsync(cancellationToken);
        _queued.TryRemove(reportId, out _);
        return reportId;
    }
}

/// <summary>
/// Phân tích hành vi ở nền (canonical v3.10): lấy từng báo cáo khỏi hàng đợi và gọi <see cref="ProctoringBehaviorAnalyzer"/>
/// trong một scope riêng (lần lượt, để không dồn nhiều lời gọi AI cùng lúc). Định kỳ quét các báo cáo còn PENDING — máy
/// chủ khởi động lại giữa chừng, AI lỗi tạm thời cần thử lại — và đưa lại vào hàng.
/// </summary>
public sealed class BehaviorAnalysisBackgroundService : BackgroundService
{
    /// <summary>Báo cáo PENDING không đổi trong khoảng này được coi là bị bỏ dở và đưa lại vào hàng.</summary>
    public static readonly TimeSpan StaleAfter = TimeSpan.FromMinutes(2);
    private static readonly TimeSpan FirstSweepDelay = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan SweepEvery = TimeSpan.FromMinutes(10);
    private const int SweepBatch = 50;

    private readonly IServiceProvider _services;
    private readonly BehaviorAnalysisQueue _queue;
    private readonly TimeProvider _clock;
    private readonly ILogger<BehaviorAnalysisBackgroundService> _logger;

    public BehaviorAnalysisBackgroundService(
        IServiceProvider services,
        BehaviorAnalysisQueue queue,
        TimeProvider clock,
        ILogger<BehaviorAnalysisBackgroundService> logger)
    {
        _services = services;
        _queue = queue;
        _clock = clock;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var sweeping = SweepLoopAsync(stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            Guid reportId;
            try
            {
                reportId = await _queue.DequeueAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            try
            {
                using var scope = _services.CreateScope();
                var analyzer = scope.ServiceProvider.GetRequiredService<ProctoringBehaviorAnalyzer>();
                await analyzer.AnalyzeAsync(reportId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Behavior analysis of report {ReportId} failed.", reportId);
            }
        }

        await sweeping;
    }

    private async Task SweepLoopAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(FirstSweepDelay, stoppingToken);
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SweepAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogWarning(ex, "Sweep of pending behavior reports failed.");
                }

                await Task.Delay(SweepEvery, stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Máy chủ dừng.
        }
    }

    private async Task SweepAsync(CancellationToken stoppingToken)
    {
        using var scope = _services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var before = _clock.GetUtcNow() - StaleAfter;
        var pending = await context.ProctoringBehaviorReports.AsNoTracking()
            .Where(r => r.Status == Statuses.BehaviorReport.Pending && r.UpdatedAt < before)
            .OrderBy(r => r.UpdatedAt)
            .Select(r => r.Id)
            .Take(SweepBatch)
            .ToListAsync(stoppingToken);
        foreach (var reportId in pending)
        {
            _queue.Enqueue(reportId);
        }
    }
}
