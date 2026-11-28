using System.Collections.Concurrent;
using System.Threading.Channels;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Infrastructure.SignVideoRendering;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>
/// In-process queue of sign-video renders (ids of platform_sign_language_tracks rows marked RENDERING). A track already
/// queued or running is not queued again.
/// </summary>
public sealed class SignVideoJobQueue : ISignVideoJobQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions { SingleReader = true });
    private readonly ConcurrentDictionary<Guid, byte> _pending = new();

    public void Enqueue(Guid trackId)
    {
        if (_pending.TryAdd(trackId, 0)) _channel.Writer.TryWrite(trackId);
    }

    public ChannelReader<Guid> Reader => _channel.Reader;

    public void Done(Guid trackId) => _pending.TryRemove(trackId, out _);
}

/// <summary>
/// Runs the sign-video renders, at most <see cref="SignVideoSettings.MaxConcurrentJobs"/> at a time (FFmpeg is heavy;
/// 1 by default). Renders left RENDERING when the server stopped are started again at start-up; a render longer than
/// <see cref="SignVideoSettings.JobTimeoutMinutes"/> is stopped as SIGN_JOB_TIMEOUT (it can be retried). Meant for a
/// single API instance (docker-compose runs one), like the caption worker.
/// </summary>
public sealed class SignVideoWorker : BackgroundService
{
    private readonly SignVideoJobQueue _queue;
    private readonly IServiceScopeFactory _scopes;
    private readonly SignVideoSettings _settings;
    private readonly ILogger<SignVideoWorker> _logger;

    public SignVideoWorker(SignVideoJobQueue queue, IServiceScopeFactory scopes, SignVideoSettings settings, ILogger<SignVideoWorker> logger)
    {
        _queue = queue;
        _scopes = scopes;
        _settings = settings.Sanitized();
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var running = new List<Task>();
        using var slots = new SemaphoreSlim(_settings.MaxConcurrentJobs);
        try
        {
            // Let start-up migrations finish before reading the table.
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            await ResumePendingAsync(stoppingToken);
            await foreach (var trackId in _queue.Reader.ReadAllAsync(stoppingToken))
            {
                await slots.WaitAsync(stoppingToken);
                running.RemoveAll(t => t.IsCompleted);
                running.Add(Task.Run(async () =>
                {
                    try
                    {
                        await RunAsync(trackId, stoppingToken);
                    }
                    finally
                    {
                        _queue.Done(trackId);
                        slots.Release();
                    }
                }, CancellationToken.None));
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Server stopping: unfinished renders stay RENDERING and run at the next start.
        }

        await Task.WhenAll(running);
    }

    private async Task ResumePendingAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            var pending = await scope.ServiceProvider.GetRequiredService<SignVideoProcessor>().PendingAsync(stoppingToken);
            if (pending.Count > 0) _logger.LogInformation("Resuming {Count} sign video render(s) left unfinished", pending.Count);
            foreach (var id in pending) _queue.Enqueue(id);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogError(ex, "Could not read unfinished sign video renders");
        }
    }

    private async Task RunAsync(Guid trackId, CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            await scope.ServiceProvider.GetRequiredService<SignVideoProcessor>()
                .ProcessAsync(trackId, TimeSpan.FromMinutes(_settings.JobTimeoutMinutes), stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Resumed at the next start.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sign video job {TrackId} crashed", trackId);
        }
    }
}
