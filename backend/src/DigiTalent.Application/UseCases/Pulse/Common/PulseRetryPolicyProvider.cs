using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Chính sách nộp lại bài cuối khóa (§10.2): chờ sau lần 1 chưa đạt, rồi có hạn cho lần nộp cuối.</summary>
public sealed record PulseRetryPolicy(int CooldownHours, int DeadlineDays)
{
    public static readonly PulseRetryPolicy Default = new(48, 7);

    public bool IsValid => CooldownHours is >= 1 and <= 720 && DeadlineDays is >= 1 and <= 90;
}

/// <summary>
/// Đọc chính sách từ system_settings key "pulse.final_retry_policy" ({"cooldownHours":48,"deadlineDays":7}):
/// cấu hình của tổ chức → cấu hình toàn cục → mặc định 48 giờ / 7 ngày. Giá trị hỏng → cảnh báo và dùng mặc định.
/// Chủ doanh nghiệp chỉnh ở màn khung năng lực; quản lý chấm lần 1 sẽ chụp cửa sổ vào bài nộp.
/// </summary>
public class PulseRetryPolicyProvider
{
    public const string SettingKey = "pulse.final_retry_policy";

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IApplicationDbContext _context;
    private readonly ILogger<PulseRetryPolicyProvider> _logger;

    public PulseRetryPolicyProvider(IApplicationDbContext context, ILogger<PulseRetryPolicyProvider> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PulseRetryPolicy> GetAsync(Guid organizationId)
    {
        var candidates = await _context.SystemSettings
            .AsNoTracking()
            .Where(s => s.Key == SettingKey && (s.OrganizationId == organizationId || s.OrganizationId == null))
            .Select(s => new { s.OrganizationId, s.Value })
            .ToListAsync();

        var raw = candidates.FirstOrDefault(s => s.OrganizationId != null)?.Value
                  ?? candidates.FirstOrDefault()?.Value;
        if (raw == null)
        {
            return PulseRetryPolicy.Default;
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<PulseRetryPolicy>(raw, JsonOptions);
            if (parsed is { IsValid: true })
            {
                return parsed;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Invalid JSON in system setting {Key} for organization {OrganizationId}", SettingKey, organizationId);
            return PulseRetryPolicy.Default;
        }

        _logger.LogWarning("Out-of-range values in system setting {Key} for organization {OrganizationId}; using defaults", SettingKey, organizationId);
        return PulseRetryPolicy.Default;
    }
}
