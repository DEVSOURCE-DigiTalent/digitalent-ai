using System.Threading.Channels;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.TrialProgram;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>Hàng đợi trong tiến trình cho gợi ý AI của báo cáo dùng thử (đưa vào sau khi báo cáo đã lưu).</summary>
public sealed class TrialInsightQueue : ITrialInsightQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });

    public ChannelReader<Guid> Reader => _channel.Reader;

    public void Enqueue(Guid reportId) => _channel.Writer.TryWrite(reportId);
}

/// <summary>
/// Viết gợi ý AI cho báo cáo dùng thử ngoài request (lời gọi AI có thể mất vài chục giây). Xử lý lần lượt theo hàng đợi; quét
/// lại các báo cáo còn PENDING khi khởi động và định kỳ (phòng khi tiến trình dừng giữa chừng).
/// </summary>
public sealed class TrialInsightBackgroundService : BackgroundService
{
    private static readonly TimeSpan SweepInterval = TimeSpan.FromMinutes(5);

    private readonly TrialInsightQueue _queue;
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<TrialInsightBackgroundService> _logger;

    public TrialInsightBackgroundService(TrialInsightQueue queue, IServiceScopeFactory scopes, ILogger<TrialInsightBackgroundService> logger)
    {
        _queue = queue;
        _scopes = scopes;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await SweepAsync(stoppingToken);

            using var untilSweep = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            untilSweep.CancelAfter(SweepInterval);
            try
            {
                while (true)
                {
                    var reportId = await _queue.Reader.ReadAsync(untilSweep.Token);
                    await WriteAsync(reportId, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (!stoppingToken.IsCancellationRequested)
            {
                // Hết khoảng chờ: quét lại.
            }
        }
    }

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        List<Guid> pending;
        try
        {
            using var scope = _scopes.CreateScope();
            pending = await scope.ServiceProvider.GetRequiredService<TrialInsightWriter>().PendingAsync(cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogWarning(ex, "Could not list pending trial insights.");
            return;
        }

        foreach (var reportId in pending)
        {
            await WriteAsync(reportId, cancellationToken);
        }
    }

    private async Task WriteAsync(Guid reportId, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            await scope.ServiceProvider.GetRequiredService<TrialInsightWriter>().WriteAsync(reportId, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Writing trial insights {ReportId} failed.", reportId);
        }
    }
}
