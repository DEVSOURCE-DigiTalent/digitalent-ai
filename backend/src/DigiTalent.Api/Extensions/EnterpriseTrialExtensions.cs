using System.Threading.RateLimiting;
using DigiTalent.Application.Trial;
using DigiTalent.Infrastructure.Trial;
using Microsoft.AspNetCore.RateLimiting;

namespace DigiTalent.Api.Extensions;

public static class EnterpriseTrialExtensions
{
    public static IServiceCollection AddEnterpriseTrial(this IServiceCollection services, IConfiguration config, IHostEnvironment environment)
    {
        var devEnv = environment.IsDevelopment() || config.GetValue<bool>("EnterpriseTrial:DevelopmentEnvironment");
        var options = (config.GetSection("EnterpriseTrial").Get<TrialOptions>() ?? new()) with { DevelopmentEnvironment = devEnv };
        options.Validate();
        services.AddSingleton(options);
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ITrialCatalog, DevelopmentTrialCatalog>();
        if (options.DevelopmentEnvironment && options.EnableDevelopmentCapture)
        {
            services.AddSingleton<ITrialEmailSender, DevelopmentCaptureTrialEmailSender>();
        }
        else
        {
            var smtpHost = config["IndividualCommerce:Smtp:Host"] ?? config["EnterpriseTrial:Smtp:Host"];
            var smtpUser = config["IndividualCommerce:Smtp:UserName"] ?? config["EnterpriseTrial:Smtp:UserName"];
            if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser))
                services.AddSingleton<ITrialEmailSender, SmtpTrialEmailSender>();
            else
                services.AddSingleton<ITrialEmailSender, UnavailableTrialEmailSender>();
        }
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
