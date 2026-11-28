using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// "Hủy bản nháp": never published → the draft (map and rendered previews) is removed, as if nothing was made;
/// published → the draft goes back to what learners see (settings, sentences, reviews, video). Learners are never
/// affected and the lesson video, its captions and the rendered files stay.
/// </summary>
public class DiscardSignLanguageVideoDraftUseCase : IUseCase<DiscardSignLanguageVideoDraftUseCaseInput, SignLanguageVideoDto>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly IApplicationDbContext _context;
    private readonly SignLanguageVideoReader _reader;
    private readonly TimeProvider _time;

    public DiscardSignLanguageVideoDraftUseCase(IApplicationDbContext context, SignLanguageVideoReader reader, TimeProvider time)
    {
        _context = context;
        _reader = reader;
        _time = time;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(DiscardSignLanguageVideoDraftUseCaseInput input)
    {
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        SignVideoStore.EnsureNotRendering(track, _time.GetUtcNow());
        var assetId = track.SourceAssetId;
        var signLanguage = track.SignLanguage;
        if (track.Status == TrackStatus.Published) return await _reader.ReadAsync(assetId, signLanguage);

        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var snapshot = track.PublishedOutputAssetId == null || track.PublishedSnapshot == null
            ? null
            : JsonSerializer.Deserialize<SignVideoSnapshot>(track.PublishedSnapshot, Json);
        if (snapshot == null)
        {
            // Never published: a draft no learner saw is removed (its sentences first, they reference the track).
            _context.PlatformSignLanguageSegments.RemoveRange(states.Select(s => s.Row));
            _context.PlatformSignLanguageTracks.Remove(track);
            await _context.SaveChangesAsync();
            return await _reader.ReadAsync(assetId, signLanguage);
        }

        track.CaptionSource = snapshot.CaptionSource;
        track.CaptionFingerprint = snapshot.CaptionFingerprint;
        track.RenderMode = snapshot.RenderMode;
        track.Renderer = snapshot.Renderer;
        track.Region = snapshot.Region;
        track.Variant = snapshot.Variant;
        track.Settings = snapshot.Settings;
        track.OutputAssetId = track.PublishedOutputAssetId;
        track.RenderedFingerprint = snapshot.RenderedFingerprint;
        track.OutputDurationMs = snapshot.OutputDurationMs;
        track.OutputWidth = snapshot.OutputWidth;
        track.OutputHeight = snapshot.OutputHeight;
        track.RenderedAt = snapshot.RenderedAt;
        track.Status = TrackStatus.Published;
        track.Progress = 100;
        track.ErrorCode = null;
        track.ProgressStage = null;
        track.ProgressDetail = null;
        track.ErrorMessage = null;

        var byIndex = states.ToDictionary(s => s.Row.SegmentIndex, s => s.Row);
        foreach (var saved in snapshot.Segments)
        {
            if (!byIndex.TryGetValue(saved.Index, out var row))
            {
                row = new PlatformSignLanguageSegment { TrackId = track.Id, SegmentIndex = saved.Index };
                _context.PlatformSignLanguageSegments.Add(row);
            }

            row.CaptionText = saved.CaptionText;
            row.StartMs = saved.StartMs;
            row.EndMs = saved.EndMs;
            row.ReviewStatus = saved.ReviewStatus;
            row.ReviewNote = saved.ReviewNote;
            row.ReviewedByUserId = saved.ReviewedByUserId;
            row.ReviewedAt = saved.ReviewedAt;
            SignVideoRules.Store(new SignSegmentState(row, saved.Items));
        }

        var kept = snapshot.Segments.Select(s => s.Index).ToHashSet();
        _context.PlatformSignLanguageSegments.RemoveRange(states.Where(s => !kept.Contains(s.Row.SegmentIndex)).Select(s => s.Row));
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(assetId, signLanguage);
    }
}
