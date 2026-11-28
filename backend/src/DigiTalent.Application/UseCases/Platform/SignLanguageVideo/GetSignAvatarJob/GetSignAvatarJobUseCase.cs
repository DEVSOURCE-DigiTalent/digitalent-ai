using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// First step of "Tạo video ký hiệu" with the 3D avatar: checks that the map can be rendered (every sign has a motion
/// whose rights are recorded, FFmpeg is there for the composition) and tells the admin's browser what to render — the
/// frame grid of the lesson video (one avatar frame per lesson frame, so the composition never repeats or drops a
/// frame), the tile, the sentences with every word (their speaking time) and the signs. Changes nothing.
/// </summary>
public class GetSignAvatarJobUseCase : IUseCase<GetSignAvatarJobUseCaseInput, SignAvatarJobDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IEnumerable<ISignVideoRenderer> _renderers;
    private readonly IFileStorageService _storage;
    private readonly TimeProvider _time;
    private readonly ISignAvatarTrackStore? _tracks;
    private readonly IDirectFileStorageService? _directStorage;

    public GetSignAvatarJobUseCase(
        IApplicationDbContext context,
        IEnumerable<ISignVideoRenderer> renderers,
        IFileStorageService storage,
        TimeProvider time,
        ISignAvatarTrackStore? tracks = null,
        IDirectFileStorageService? directStorage = null)
    {
        _context = context;
        _renderers = renderers;
        _storage = storage;
        _time = time;
        _tracks = tracks;
        _directStorage = directStorage;
    }

    public async Task<SignAvatarJobDto> ExecuteAsync(GetSignAvatarJobUseCaseInput input)
    {
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        if (track.Renderer != SignVideo.Renderer.Avatar)
        {
            throw new BadRequestException("Bản đồ này dùng video người thật. Chọn “Nhân vật 3D” trong cài đặt để dựng nhân vật.", "renderer", SignVideo.Errors.NotAvatar);
        }

        SignVideoStore.EnsureNotRendering(track, _time.GetUtcNow());
        await SignVideoStore.EnsureRendererAsync(_renderers, SignVideo.Renderer.Avatar);
        if (_tracks == null)
        {
            throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured)!, "renderer", SignVideo.Errors.RendererNotConfigured);
        }

        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var entries = await SignDictionaryLoader.ByIdsAsync(_context, states.SelectMany(s => s.Items).Where(i => i.GlossId != null).Select(i => i.GlossId!.Value));
        var problem = SignVideoRules.RenderProblems(states, entries, track.Renderer).FirstOrDefault();
        if (problem != null) throw new BadRequestException(problem.Message, "segments", problem.Code);

        var source = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.SourceAssetId)
            ?? throw new NotFoundException("Không tìm thấy video gốc.");
        if (!await SignVideoStore.IsStoredAsync(_storage, _directStorage, source.StorageKey))
        {
            throw new BadRequestException("Không tìm thấy tệp video gốc trong kho lưu trữ. Tải lại video cho khối này.", "assetId", SignVideo.Errors.VideoUnreadable);
        }

        SignAvatarTrackSpec spec;
        try
        {
            spec = await _tracks.SpecAsync(new SignRenderMedia(source.Id, source.StorageKey, source.ContentType), track.RenderMode);
        }
        catch (SignRenderException ex)
        {
            throw new BadRequestException(ex.Message, "assetId", ex.Code);
        }

        var job = new SignAvatarJobDto
        {
            TrackId = track.Id,
            Fingerprint = SignVideoRules.RenderFingerprint(track, states, entries),
            FrameRate = spec.FrameRate,
            Fps = spec.Fps,
            FrameCount = spec.FrameCount,
            DurationMs = spec.DurationMs,
            Width = spec.Width,
            Height = spec.Height,
            Background = spec.Background,
            Transparent = spec.Transparent,
            Side = spec.Side,
            MaxSpeedup = SignVideo.MaxSpeedup,
        };

        foreach (var segment in states.OrderBy(s => s.Row.SegmentIndex))
        {
            if (!segment.Signed.Any(i => i.GlossId != null)) continue;
            job.Segments.Add(new SignAvatarJobSegmentDto
            {
                Index = segment.Row.SegmentIndex,
                StartMs = segment.Row.StartMs,
                EndMs = segment.Row.EndMs,
                Items = segment.Items.Select((item, index) => new SignAvatarJobItemDto
                {
                    ItemIndex = index,
                    SourceText = item.SourceText,
                    GlossId = item.Skipped ? null : item.GlossId,
                    DurationMs = item.Skipped ? null : item.DurationMs,
                }).ToList(),
            });
        }

        job.Signs = job.Segments.SelectMany(s => s.Items)
            .Where(i => i.GlossId != null)
            .Select(i => i.GlossId!.Value)
            .Distinct()
            .Select(id => entries[id])
            .Select(e => new SignAvatarJobSignDto { GlossId = e.Id, Gloss = e.Gloss, Mirrored = e.Mirrored })
            .ToList();
        return job;
    }
}
