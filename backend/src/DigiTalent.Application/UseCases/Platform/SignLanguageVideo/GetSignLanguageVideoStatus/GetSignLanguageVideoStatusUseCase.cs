using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>Light state of a render, asked every few seconds by the builder while it runs.</summary>
public class GetSignLanguageVideoStatusUseCase : IUseCase<GetSignLanguageVideoStatusUseCaseInput, SignVideoStatusDto>
{
    private readonly IApplicationDbContext _context;
    private readonly TimeProvider _time;

    public GetSignLanguageVideoStatusUseCase(IApplicationDbContext context, TimeProvider time)
    {
        _context = context;
        _time = time;
    }

    public async Task<SignVideoStatusDto> ExecuteAsync(GetSignLanguageVideoStatusUseCaseInput input)
    {
        var track = await _context.PlatformSignLanguageTracks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == input.TrackId)
            ?? throw new NotFoundException("Không tìm thấy video ngôn ngữ ký hiệu.");
        var stale = SignVideoRules.IsStale(track, _time.GetUtcNow());
        var code = track.ErrorCode ?? (stale ? SignVideo.Errors.JobTimeout : null);
        return new SignVideoStatusDto
        {
            TrackId = track.Id,
            Status = track.Status,
            Progress = track.Progress,
            ProgressStage = track.ProgressStage,
            ProgressDetail = track.ProgressDetail,
            RenderStartedAt = track.RenderStartedAt,
            ErrorCode = code,
            ErrorMessage = track.ErrorMessage ?? SignVideoRules.ErrorMessage(code),
            Stale = stale,
            UpdatedAt = track.UpdatedAt,
        };
    }
}
