using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.BackgroundServices;

/// <summary>
/// Every hour: the courses that got new content with a grace period (<see cref="CourseRelearn"/>) — reminds the employees
/// still on the old content 7 days and 1 day before, then moves them to the new content when the grace is over.
/// </summary>
public sealed class CourseGraceBackgroundService(IServiceProvider services, TimeProvider time, ILogger<CourseGraceBackgroundService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(45), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = services.CreateAsyncScope();
                var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                var handled = await CourseRelearn.ProcessGraceAsync(context, time.GetUtcNow());
                if (handled > 0) logger.LogInformation("Course grace: {Count} enrollments reminded or moved to new content.", handled);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Course grace run failed.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }
        }
    }
}
