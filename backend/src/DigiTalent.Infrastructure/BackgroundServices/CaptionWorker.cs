using System.Threading.Channels;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>In-process queue of AI caption jobs (ids of platform_asset_captions rows marked PROCESSING).</summary>
public sealed class CaptionJobQueue : ICaptionJobQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });

    public void Enqueue(Guid captionId) => _channel.Writer.TryWrite(captionId);

    public ChannelReader<Guid> Reader => _channel.Reader;
}

/// <summary>
/// Runs the AI caption jobs one at a time (a video upload and transcription can take minutes; one at a time keeps
/// within the Gemini quota). Jobs left PROCESSING when the server stopped are started again at start-up. Meant for
/// a single API instance (docker-compose runs one); several instances would each resume the same jobs.
/// </summary>
public sealed class CaptionWorker : BackgroundService
{
    private readonly CaptionJobQueue _queue;
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<CaptionWorker> _logger;

    public CaptionWorker(CaptionJobQueue queue, IServiceScopeFactory scopes, ILogger<CaptionWorker> logger)
    {
        _queue = queue;
        _scopes = scopes;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // Let start-up migrations finish before reading the table.
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            await ResumePendingAsync(stoppingToken);
            await foreach (var captionId in _queue.Reader.ReadAllAsync(stoppingToken))
            {
                await RunAsync(captionId, stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Server stopping: unfinished jobs stay PROCESSING and run at the next start.
        }
    }

    private async Task ResumePendingAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            var pending = await scope.ServiceProvider.GetRequiredService<PlatformCaptionProcessor>().PendingAsync(stoppingToken);
            if (pending.Count > 0) _logger.LogInformation("Resuming {Count} caption job(s) left unfinished", pending.Count);
            foreach (var id in pending) _queue.Enqueue(id);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Could not read unfinished caption jobs");
        }
    }

    private async Task RunAsync(Guid captionId, CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            await scope.ServiceProvider.GetRequiredService<PlatformCaptionProcessor>().ProcessAsync(captionId, stoppingToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Caption job {CaptionId} crashed", captionId);
        }
    }
}
