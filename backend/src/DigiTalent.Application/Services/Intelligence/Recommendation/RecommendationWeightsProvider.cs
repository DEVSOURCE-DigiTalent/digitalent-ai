using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.Services.Intelligence.Recommendation;

/// <summary>
/// Đọc trọng số xếp hạng gợi ý từ scoring_configs (loại RECOMMENDATION_WEIGHTS, bản active của tổ chức).
/// Chưa có cấu hình → DEFAULT. Cấu hình hỏng (thiếu/thừa component, trọng số âm, tổng ≠ 100) → log error + DEFAULT (spec §5.6 R7).
/// </summary>
public class RecommendationWeightsProvider
{
    private const decimal RequiredTotalWeight = 100m;

    private static readonly string[] RequiredComponents =
    {
        RecommendationComponents.GapPriorityCoverage,
        RecommendationComponents.MandatoryCoverage,
        RecommendationComponents.EntryLevelFit,
    };

    private readonly IApplicationDbContext _context;
    private readonly ILogger<RecommendationWeightsProvider> _logger;

    public RecommendationWeightsProvider(IApplicationDbContext context, ILogger<RecommendationWeightsProvider> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RecommendationWeights> GetAsync(Guid organizationId)
    {
        // 1 truy vấn: bản active mới nhất kèm các item
        var config = await _context.ScoringConfigs
            .AsNoTracking()
            .Where(c => c.OrganizationId == organizationId
                        && c.ConfigType == Statuses.ScoringConfigType.RecommendationWeights
                        && c.IsActive)
            .OrderByDescending(c => c.Version)
            .Select(c => new
            {
                c.Version,
                Items = _context.ScoringConfigItems
                    .Where(i => i.ScoringConfigId == c.Id)
                    .Select(i => new { i.ComponentCode, i.Weight })
                    .ToList(),
            })
            .FirstOrDefaultAsync();
        if (config == null)
        {
            return RecommendationWeights.Default;
        }

        var hasDuplicateComponent = config.Items.GroupBy(i => i.ComponentCode).Any(g => g.Count() > 1);
        var weights = config.Items
            .GroupBy(i => i.ComponentCode)
            .ToDictionary(g => g.Key, g => g.First().Weight);

        if (hasDuplicateComponent || !IsValid(weights))
        {
            _logger.LogError(
                "Invalid {ConfigType} v{Version} for organization {OrganizationId} (components: {Components}); using defaults",
                Statuses.ScoringConfigType.RecommendationWeights, config.Version, organizationId,
                string.Join(", ", config.Items.Select(i => $"{i.ComponentCode}={i.Weight}")));
            return RecommendationWeights.Default;
        }

        return new RecommendationWeights(
            weights[RecommendationComponents.GapPriorityCoverage],
            weights[RecommendationComponents.MandatoryCoverage],
            weights[RecommendationComponents.EntryLevelFit],
            config.Version.ToString());
    }

    private static bool IsValid(IReadOnlyDictionary<string, decimal> weights) =>
        weights.Count == RequiredComponents.Length
        && RequiredComponents.All(weights.ContainsKey)
        && weights.Values.All(w => w >= 0)
        && weights.Values.Sum() == RequiredTotalWeight;
}
