using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// Second step of "Tạo video ký hiệu" with the 3D avatar (202): receives the avatar track the admin's browser rendered,
/// checks it was made for the current sign map (409 SIGN_AVATAR_TRACK_OUTDATED otherwise) on the lesson video's frame
/// grid (frame rate and frame count, 400 SIGN_AVATAR_TRACK_INVALID otherwise), stores it and queues the composition —
/// the track becomes a video only once the server has composed and checked a real file.
/// </summary>
public class UploadSignAvatarTrackUseCase : IUseCase<UploadSignAvatarTrackUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly SignVideoRenderStarter _starter;
    private readonly SignLanguageVideoReader _reader;
    private readonly TimeProvider _time;
    private readonly ISignAvatarTrackStore? _tracks;

    public UploadSignAvatarTrackUseCase(
        IApplicationDbContext context,
        SignVideoRenderStarter starter,
        SignLanguageVideoReader reader,
        TimeProvider time,
        ISignAvatarTrackStore? tracks = null)
    {
        _context = context;
        _starter = starter;
        _reader = reader;
        _time = time;
        _tracks = tracks;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(UploadSignAvatarTrackUseCaseInput input)
    {
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        if (track.Renderer != SignVideo.Renderer.Avatar)
        {
            throw new BadRequestException("Bản đồ này dùng video người thật. Chọn “Nhân vật 3D” trong cài đặt để dựng nhân vật.", "renderer", SignVideo.Errors.NotAvatar);
        }

        SignVideoStore.EnsureNotRendering(track, _time.GetUtcNow());
        if (_tracks == null)
        {
            throw new BadRequestException(SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured)!, "renderer", SignVideo.Errors.RendererNotConfigured);
        }

        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var entries = await SignDictionaryLoader.ByIdsAsync(_context, states.SelectMany(s => s.Items).Where(i => i.GlossId != null).Select(i => i.GlossId!.Value));
        var problem = SignVideoRules.RenderProblems(states, entries, track.Renderer).FirstOrDefault();
        if (problem != null) throw new BadRequestException(problem.Message, "segments", problem.Code);
        if (input.Fingerprint != SignVideoRules.RenderFingerprint(track, states, entries))
        {
            throw new ConflictException(SignVideoRules.ErrorMessage(SignVideo.Errors.AvatarTrackOutdated)!, "fingerprint", SignVideo.Errors.AvatarTrackOutdated);
        }

        var source = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == track.SourceAssetId)
            ?? throw new NotFoundException("Không tìm thấy video gốc.");
        SignAvatarTrackSpec spec;
        try
        {
            spec = await _tracks.SpecAsync(new SignRenderMedia(source.Id, source.StorageKey, source.ContentType), track.RenderMode);
        }
        catch (SignRenderException ex)
        {
            throw new BadRequestException(ex.Message, "assetId", ex.Code);
        }

        // A page opened before the transparent overlay existed still renders on a background: render again from a fresh page.
        if (input.Transparent != spec.Transparent)
        {
            throw Invalid(spec.Transparent
                ? "Track nhân vật phải có nền trong suốt để đặt ở góc video bài giảng. Tải lại trang rồi bấm “Tạo video ký hiệu”."
                : "Cách hiển thị này dùng nhân vật trên nền màu, không phải nền trong suốt. Tải lại trang rồi bấm “Tạo video ký hiệu”.");
        }

        if (input.FrameRate != spec.FrameRate)
        {
            throw Invalid($"Track nhân vật phải có {spec.FrameRate} khung hình/giây như video bài giảng (nhận được {input.FrameRate}).");
        }

        if (Math.Abs(input.FrameCount - spec.FrameCount) > SignVideo.AvatarTrack.FrameTolerance)
        {
            throw Invalid($"Track nhân vật phải có {spec.FrameCount} khung hình như video bài giảng (nhận được {input.FrameCount}).");
        }

        var placements = Placements(input.Placements, states, spec.DurationMs);
        try
        {
            await _tracks.SaveAsync(track.Id, input.Content, new SignAvatarTrackInfo(
                input.Fingerprint, input.Format, input.FrameRate, input.FrameCount, input.SizeBytes, placements, _time.GetUtcNow(), spec.Transparent));
        }
        catch (SignRenderException ex)
        {
            throw new BadRequestException(ex.Message, "file", ex.Code);
        }

        await _starter.StartAsync(track, force: true);
        return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
    }

    /// <summary>Each placement names a sign of the map that is shown, once, inside the video, without overlapping the next.</summary>
    private static List<SignPlacement> Placements(IEnumerable<SignAvatarPlacementInput> input, IReadOnlyList<SignSegmentState> states, int durationMs)
    {
        var byIndex = states.ToDictionary(s => s.Row.SegmentIndex);
        var result = new List<SignPlacement>();
        var seen = new HashSet<(int, int)>();
        foreach (var p in input.OrderBy(p => p.StartMs))
        {
            if (!byIndex.TryGetValue(p.SegmentIndex, out var segment) || segment.Skipped || p.ItemIndex >= segment.Items.Count
                || segment.Items[p.ItemIndex] is { Skipped: true } or { GlossId: null })
            {
                throw Invalid($"Vị trí ký hiệu không khớp bản đồ (câu số {p.SegmentIndex + 1}, từ thứ {p.ItemIndex + 1}). Dựng lại nhân vật.");
            }

            if (!seen.Add((p.SegmentIndex, p.ItemIndex)) || (result.Count > 0 && p.StartMs < result[^1].EndMs) || p.StartMs > durationMs)
            {
                throw Invalid("Các ký hiệu trong track nhân vật bị trùng hoặc chồng lên nhau. Dựng lại nhân vật.");
            }

            result.Add(new SignPlacement(p.SegmentIndex, p.ItemIndex, p.StartMs, Math.Min(p.EndMs, durationMs), p.Speed, p.SourceMs, 0, false));
        }

        return result;
    }

    private static BadRequestException Invalid(string message) => new(message, "file", SignVideo.Errors.AvatarTrackInvalid);
}
