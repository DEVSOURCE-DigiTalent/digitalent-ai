using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>
/// Counts of the dictionary's tabs (PA-18) in one grouped query: in use, no video, video without motion, ready to publish,
/// published, archived. Takes the list's text and kind filters.
/// </summary>
public class GetSignGlossSummaryUseCase : IUseCase<GetSignGlossSummaryUseCaseInput, SignGlossSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetSignGlossSummaryUseCase(IApplicationDbContext context) => _context = context;

    public async Task<SignGlossSummaryDto> ExecuteAsync(GetSignGlossSummaryUseCaseInput input)
    {
        var query = _context.SignGlosses.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(input.Kind)) query = query.Where(g => g.Kind == input.Kind);
        var search = SignGlossRules.Normalize(input.Search);
        if (search.Length > 0) query = query.Where(g => g.Normalized.Contains(search));

        var groups = await query
            .GroupBy(g => new { g.Status, HasVideo = g.VideoAssetId != null, HasMotion = g.MotionData != null })
            .Select(group => new { group.Key.Status, group.Key.HasVideo, group.Key.HasMotion, Count = group.Count() })
            .ToListAsync();

        var inUse = groups.Where(g => g.Status != GlossStatus.Archived).ToList();
        return new SignGlossSummaryDto
        {
            Total = inUse.Sum(g => g.Count),
            NoVideo = inUse.Where(g => !g.HasVideo).Sum(g => g.Count),
            NeedsMotion = inUse.Where(g => g.HasVideo && !g.HasMotion).Sum(g => g.Count),
            Ready = groups.Where(g => g.Status == GlossStatus.Draft && g.HasMotion).Sum(g => g.Count),
            Published = groups.Where(g => g.Status == GlossStatus.Published).Sum(g => g.Count),
            Archived = groups.Where(g => g.Status == GlossStatus.Archived).Sum(g => g.Count),
        };
    }
}
