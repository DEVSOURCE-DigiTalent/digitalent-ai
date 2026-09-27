using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng scoring_config_items. Từng trọng số trong bộ cấu hình.
/// </summary>
public class ScoringConfigItem : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ScoringConfigId { get; set; }
    public string ComponentCode { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
