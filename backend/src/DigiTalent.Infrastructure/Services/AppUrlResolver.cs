using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.Services;

/// <summary>
/// Tự động xác định frontend URL linh động theo môi trường thực tế (localhost cổng bất kỳ hoặc hosting/domain server).
/// </summary>
public class AppUrlResolver : IAppUrlResolver
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AppUrlResolver> _logger;

    public AppUrlResolver(
        IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration,
        ILogger<AppUrlResolver> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
        _logger = logger;
    }

    public string GetFrontendBaseUrl()
    {
        // 1. Kiểm tra Origin hoặc Referer từ HTTP request nếu request phát sinh từ trình duyệt của người dùng
        var context = _httpContextAccessor?.HttpContext;
        if (context != null)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            if (IsValidHttpUrl(origin))
            {
                return origin.Trim().TrimEnd('/');
            }

            var referer = context.Request.Headers["Referer"].ToString();
            if (!string.IsNullOrWhiteSpace(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var refererUri))
            {
                var refererBase = refererUri.GetLeftPart(UriPartial.Authority);
                if (IsValidHttpUrl(refererBase))
                {
                    return refererBase.Trim().TrimEnd('/');
                }
            }

            // Kiểm tra X-Forwarded-Host nếu chạy sau reverse proxy (Nginx / Cloudflare / Docker)
            var forwardedHost = context.Request.Headers["X-Forwarded-Host"].ToString();
            if (!string.IsNullOrWhiteSpace(forwardedHost))
            {
                var proto = context.Request.Headers["X-Forwarded-Proto"].ToString();
                if (string.IsNullOrWhiteSpace(proto))
                    proto = context.Request.Scheme;

                var candidate = $"{proto}://{forwardedHost.Split(',')[0].Trim()}";
                if (IsValidHttpUrl(candidate))
                {
                    return candidate.TrimEnd('/');
                }
            }
        }

        // 2. Kiểm tra biến môi trường hệ thống (dành cho background services hoặc khi triển khai production)
        var envUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
                  ?? Environment.GetEnvironmentVariable("APP_URL")
                  ?? Environment.GetEnvironmentVariable("PUBLIC_APP_URL")
                  ?? Environment.GetEnvironmentVariable("WEBSITE_URL");

        if (IsValidHttpUrl(envUrl))
        {
            return envUrl!.Trim().TrimEnd('/');
        }

        // 3. Đọc từ file cấu hình appsettings.json
        var configUrl = _configuration["Invitations:FrontendBaseUrl"]
                     ?? _configuration["EnterpriseTrial:PublicAppUrl"]
                     ?? _configuration["IndividualCommerce:Security:PublicAppUrl"]
                     ?? _configuration["AppUrl"]
                     ?? _configuration["FrontendBaseUrl"];

        if (IsValidHttpUrl(configUrl))
        {
            return configUrl!.Trim().TrimEnd('/');
        }

        // 4. Mặc định fallback chạy local
        return "http://localhost:5173";
    }

    private static bool IsValidHttpUrl(string? url)
    {
        return !string.IsNullOrWhiteSpace(url)
            && Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
