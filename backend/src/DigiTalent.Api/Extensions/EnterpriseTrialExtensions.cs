using System.Threading.RateLimiting;
using DigiTalent.Application.Trial;
using DigiTalent.Infrastructure.Trial;
using Microsoft.AspNetCore.RateLimiting;

namespace DigiTalent.Api.Extensions;

public static class EnterpriseTrialExtensions
{
    public static IServiceCollection AddEnterpriseTrial(this IServiceCollection services, IConfiguration config, IHostEnvironment environment)
    {
        var options = (config.GetSection("EnterpriseTrial").Get<TrialOptions>() ?? new()) with { DevelopmentEnvironment = environment.IsDevelopment() };
        options.Validate();
        services.AddSingleton(options);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ITrialCatalog, DevelopmentTrialCatalog>();
        if (options.DevelopmentEnvironment && options.EnableDevelopmentCapture)
            services.AddSingleton<ITrialEmailSender, DevelopmentCaptureTrialEmailSender>();
        else services.AddSingleton<ITrialEmailSender, UnavailableTrialEmailSender>();
        services.AddScoped<TrialService>();
        services.AddRateLimiter(limits =>
        {
            limits.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            limits.AddPolicy("enterprise-trial", context => RateLimitPartition.GetFixedWindowLimiter(
                context.User.FindFirst("sub")?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
        });
        return services;
    }
}
