using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>The motions the avatar needs (only signs that have one); unknown ids are left out.</summary>
public class GetSignGlossMotionsUseCase : IUseCase<GetSignGlossMotionsUseCaseInput, List<SignGlossMotionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSignGlossMotionsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SignGlossMotionDto>> ExecuteAsync(GetSignGlossMotionsUseCaseInput input)
    {
        var ids = input.Ids.Distinct().ToList();
        if (ids.Count > SignLanguage.MaxMotionsPerRequest)
        {
            throw new BadRequestException($"Tối đa {SignLanguage.MaxMotionsPerRequest} ký hiệu mỗi lần.", "ids", "TOO_MANY_SIGNS");
        }

        if (ids.Count == 0) return new();
        var query = _context.SignGlosses.AsNoTracking().Where(g => ids.Contains(g.Id) && g.MotionData != null && g.Status != GlossStatus.Archived);
        if (input.PublishedOnly) query = query.Where(g => g.Status == GlossStatus.Published);
        return await query
            .Select(g => new SignGlossMotionDto
            {
                Id = g.Id, Gloss = g.Gloss, Kind = g.Kind, Layout = g.MotionLayout!.Value, Fps = g.MotionFps!.Value,
                Frames = g.MotionFrames!.Value, Mirrored = g.Mirrored, Data = g.MotionData!,
            })
            .ToListAsync();
    }
}
