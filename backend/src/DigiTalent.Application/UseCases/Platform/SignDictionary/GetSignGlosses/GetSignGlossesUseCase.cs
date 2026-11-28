using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>The sign-language dictionary, letters and digits first, then words in alphabetical order.</summary>
public class GetSignGlossesUseCase : IUseCase<GetSignGlossesUseCaseInput, PagedList<SignGlossDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner? _urls;

    public GetSignGlossesUseCase(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<PagedList<SignGlossDto>> ExecuteAsync(GetSignGlossesUseCaseInput input)
    {
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);
        var query = _context.SignGlosses.AsNoTracking();
        query = string.IsNullOrWhiteSpace(input.Status)
            ? query.Where(g => g.Status != GlossStatus.Archived)
            : query.Where(g => g.Status == input.Status);
        if (!string.IsNullOrWhiteSpace(input.Kind)) query = query.Where(g => g.Kind == input.Kind);
        if (input.WithoutMotion == true) query = query.Where(g => g.MotionData == null);
        query = input.Stage switch
        {
            SignLanguage.Stage.NoVideo => query.Where(g => g.VideoAssetId == null),
            SignLanguage.Stage.NeedsMotion => query.Where(g => g.VideoAssetId != null && g.MotionData == null),
            SignLanguage.Stage.Ready => query.Where(g => g.MotionData != null && g.Status == GlossStatus.Draft),
            _ => query,
        };
        var search = SignGlossRules.Normalize(input.Search);
        if (search.Length > 0) query = query.Where(g => g.Normalized.Contains(search));

        var total = await query.CountAsync();
        // The regional variants of a word share its text: region, variant and id keep their order the same on every
        // page, otherwise PostgreSQL may return a variant on two pages and skip another.
        var page = await query
            .OrderBy(g => g.Kind == "WORD" ? 1 : 0)
            .ThenBy(g => g.Kind)
            .ThenBy(g => g.Normalized)
            .ThenBy(g => g.Region)
            .ThenBy(g => g.Variant)
            .ThenBy(g => g.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        var videoIds = page.Where(g => g.VideoAssetId != null).Select(g => g.VideoAssetId!.Value).Distinct().ToList();
        var videos = await _context.PlatformAssets.AsNoTracking().Where(a => videoIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id);

        return new PagedList<SignGlossDto>
        {
            Items = page.Select(g => SignGlossRules.Dto(g, g.VideoAssetId is { } id ? videos.GetValueOrDefault(id) : null, _urls)).ToList(),
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalItems = total,
        };
    }
}
