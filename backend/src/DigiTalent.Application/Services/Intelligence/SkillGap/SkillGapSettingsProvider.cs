using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.Services.Intelligence.SkillGap;

/// <summary>
/// Đọc tham số skill gap từ system_settings key "intelligence.skill_gap":
/// cấu hình của tổ chức → cấu hình toàn cục → mặc định (k = 1.5, ngưỡng MEDIUM = 20%).
/// Giá trị hỏng/ngoài khoảng hợp lệ → ghi log cảnh báo và dùng mặc định (không chặn nghiệp vụ).
/// </summary>
public class SkillGapSettingsProvider
{
    public const string SettingKey = "intelligence.skill_gap";

    private const decimal MinMultiplier = 1m;
    private const decimal MaxMultiplier = 10m;
    private const decimal MaxWeightThreshold = 100m;

    private readonly IApplicationDbContext _context;
    private readonly ILogger<SkillGapSettingsProvider> _logger;

    public SkillGapSettingsProvider(IApplicationDbContext context, ILogger<SkillGapSettingsProvider> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SkillGapSettings> GetAsync(Guid organizationId)
    {
        var candidates = await _context.SystemSettings
            .Where(s => s.Key == SettingKey && (s.OrganizationId == organizationId || s.OrganizationId == null))
            .Select(s => new { s.OrganizationId, s.Value })
            .ToListAsync();

        var raw = candidates.FirstOrDefault(s => s.OrganizationId != null)?.Value
                  ?? candidates.FirstOrDefault()?.Value;

        return raw == null ? SkillGapSettings.Default : Parse(raw, organizationId);
    }

    private SkillGapSettings Parse(string raw, Guid organizationId)
    {
        try
        {
            var parsed = JsonSerializer.Deserialize<SkillGapSettings>(raw, SkillGapSnapshot.JsonOptions);
            if (parsed != null && IsValid(parsed))
            {
                return parsed;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Invalid JSON in system setting {Key} for organization {OrganizationId}", SettingKey, organizationId);
            return SkillGapSettings.Default;
        }

        _logger.LogWarning("Out-of-range values in system setting {Key} for organization {OrganizationId}; using defaults", SettingKey, organizationId);
        return SkillGapSettings.Default;
    }

    private static bool IsValid(SkillGapSettings settings) =>
        settings.MandatoryMultiplier is >= MinMultiplier and <= MaxMultiplier
        && settings.MediumWeightThreshold is > 0 and <= MaxWeightThreshold;
}
