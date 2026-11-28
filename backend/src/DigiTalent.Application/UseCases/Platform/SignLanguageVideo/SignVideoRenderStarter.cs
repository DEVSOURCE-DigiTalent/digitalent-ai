using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// Puts a track in RENDERING and hands it to the background worker ("Tạo video ký hiệu", "Tạo lại video", "Thử lại").
/// Idempotent: a render already running (not lost) is returned as it is, never queued twice; a current output is not
/// rendered again unless <c>force</c>. Every sign is checked first so the job does not start only to fail.
/// </summary>
public sealed class SignVideoRenderStarter
{
    private readonly IApplicationDbContext _context;
    private readonly IEnumerable<ISignVideoRenderer> _renderers;
    private readonly IFileStorageService _storage;
    private readonly IDirectFileStorageService? _directStorage;
    private readonly ISignVideoJobQueue _queue;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;
    private readonly ISignAvatarTrackStore? _avatarTracks;

    public SignVideoRenderStarter(
        IApplicationDbContext context,
        IEnumerable<ISignVideoRenderer> renderers,
        IFileStorageService storage,
        ISignVideoJobQueue queue,
        ICurrentUser currentUser,
        TimeProvider time,
        IDirectFileStorageService? directStorage = null,
        ISignAvatarTrackStore? avatarTracks = null)
    {
        _avatarTracks = avatarTracks;
        _context = context;
        _renderers = renderers;
        _storage = storage;
        _directStorage = directStorage;
        _queue = queue;
        _currentUser = currentUser;
        _time = time;
    }

    public async Task StartAsync(PlatformSignLanguageTrack track, bool force)
    {
        var now = _time.GetUtcNow();
        if (track.Status == TrackStatus.Rendering && !SignVideoRules.IsStale(track, now)) return;

        await SignVideoStore.EnsureRendererAsync(_renderers, track.Renderer);
        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var entries = await SignDictionaryLoader.ByIdsAsync(_context, states.SelectMany(s => s.Items).Where(i => i.GlossId != null).Select(i => i.GlossId!.Value));
        var problem = SignVideoRules.RenderProblems(states, entries, track.Renderer).FirstOrDefault();
        if (problem != null) throw new BadRequestException(problem.Message, "segments", problem.Code);

        var fingerprint = SignVideoRules.RenderFingerprint(track, states, entries);
        if (!force && track.OutputAssetId != null && track.RenderedFingerprint == fingerprint && track.Status is TrackStatus.Ready or TrackStatus.Published)
        {
            return;
        }

        // The avatar is rendered by the admin's browser: the server composes only a track made for this very sign map.
        if (track.Renderer == SignVideo.Renderer.Avatar)
        {
            var uploaded = _avatarTracks == null ? null : await _avatarTracks.FindAsync(track.Id);
            if (uploaded == null)
            {
                throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.AvatarTrackMissing)!, "trackId", SignVideo.Errors.AvatarTrackMissing);
            }

            if (uploaded.Fingerprint != fingerprint)
            {
                throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.AvatarTrackOutdated)!, "trackId", SignVideo.Errors.AvatarTrackOutdated);
            }
        }

        var source = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.SourceAssetId)
            ?? throw new NotFoundException("Không tìm thấy video gốc.");
        if (!await SignVideoStore.IsStoredAsync(_storage, _directStorage, source.StorageKey))
        {
            throw new BadRequestException("Không tìm thấy tệp video gốc trong kho lưu trữ. Tải lại video cho khối này.", "assetId", SignVideo.Errors.VideoUnreadable);
        }

        track.Status = TrackStatus.Rendering;
        track.Progress = 0;
        track.ProgressStage = SignVideo.Stage.Queued;
        track.ProgressDetail = "Đang chờ đến lượt dựng (mỗi lần một video)";
        track.ErrorCode = null;
        track.ErrorMessage = null;
        track.RenderStartedAt = now;
        track.RenderAttempts++;
        track.RequestedByUserId = _currentUser.UserId;
        // A lost render restarted changes few columns: touch UpdatedAt so it no longer looks lost.
        track.UpdatedAt = now;
        await _context.SaveChangesAsync();
        _queue.Enqueue(track.Id);
    }
}
