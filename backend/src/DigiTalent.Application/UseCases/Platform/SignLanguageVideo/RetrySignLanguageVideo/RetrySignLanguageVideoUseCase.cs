using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>"Thử lại" (202): renders again a track whose last render failed or was lost (RENDERING for too long).</summary>
public class RetrySignLanguageVideoUseCase : IUseCase<RetrySignLanguageVideoUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly SignVideoRenderStarter _starter;
    private readonly SignLanguageVideoReader _reader;
    private readonly TimeProvider _time;

    public RetrySignLanguageVideoUseCase(IApplicationDbContext context, SignVideoRenderStarter starter, SignLanguageVideoReader reader, TimeProvider time)
    {
        _context = context;
        _starter = starter;
        _reader = reader;
        _time = time;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(RetrySignLanguageVideoUseCaseInput input)
    {
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        var lost = SignVideoRules.IsStale(track, _time.GetUtcNow());
        if (track.Status == TrackStatus.Rendering && !lost)
        {
            throw new ConflictException(SignVideoRules.ErrorMessage(SignVideo.Errors.JobAlreadyRunning)!, "trackId", SignVideo.Errors.JobAlreadyRunning);
        }

        if (track.Status != TrackStatus.Failed && !lost)
        {
            throw new ConflictException("Chỉ thử lại khi lần dựng trước bị lỗi hoặc bị treo. Dùng “Tạo lại video” để dựng lại.");
        }

        await _starter.StartAsync(track, force: true);
        return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
    }
}
