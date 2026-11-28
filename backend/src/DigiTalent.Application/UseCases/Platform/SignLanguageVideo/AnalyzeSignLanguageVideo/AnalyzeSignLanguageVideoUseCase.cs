using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// "Xem bản đồ ký hiệu" / "Tạo video ký hiệu" (step 3): splits the captions into sentences and matches each one to the
/// dictionary. Runs inside the request (dictionary lookups only, no AI). A sentence whose text did not change keeps
/// the admin's choices and its review; its missing signs are looked up again (a sign may have been added since).
/// Captions are only read, never changed. The video is rendered later ("render").
/// </summary>
public class AnalyzeSignLanguageVideoUseCase : IUseCase<AnalyzeSignLanguageVideoUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ISignGlossMatcher _matcher;
    private readonly IFileStorageService _storage;
    private readonly IDirectFileStorageService? _directStorage;
    private readonly SignLanguageVideoReader _reader;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;

    public AnalyzeSignLanguageVideoUseCase(
        IApplicationDbContext context,
        ISignGlossMatcher matcher,
        IFileStorageService storage,
        SignLanguageVideoReader reader,
        ICurrentUser currentUser,
        TimeProvider time,
        IDirectFileStorageService? directStorage = null)
    {
        _context = context;
        _matcher = matcher;
        _storage = storage;
        _directStorage = directStorage;
        _reader = reader;
        _currentUser = currentUser;
        _time = time;
    }

    private sealed record Previous(string Text, List<SignSequenceItem> Items, string ReviewStatus, string? ReviewNote, Guid? ReviewedBy, DateTimeOffset? ReviewedAt);

    public async Task<SignLanguageVideoDto> ExecuteAsync(AnalyzeSignLanguageVideoUseCaseInput input)
    {
        var asset = await SignVideoStore.LessonVideoAsync(_context, input.AssetId);
        var now = _time.GetUtcNow();
        var track = await SignVideoStore.FindByAssetAsync(_context, asset.Id, input.SignLanguage);
        if (track != null) SignVideoStore.EnsureNotRendering(track, now);

        var cues = await SignVideoStore.CaptionCuesAsync(_context, asset.Id, input.CaptionSource, now);
        if (!await SignVideoStore.IsStoredAsync(_storage, _directStorage, asset.StorageKey))
        {
            throw new BadRequestException("Không tìm thấy tệp video gốc trong kho lưu trữ. Tải lại video cho khối này.", "assetId", SignVideo.Errors.VideoUnreadable);
        }

        var dictionary = SignDictionaryIndex.Build(await SignDictionaryLoader.InUseAsync(_context, input.SignLanguage));
        var preferences = new SignMatchPreferences(input.SignLanguage, input.Region, string.IsNullOrWhiteSpace(input.Variant) ? null : input.Variant.Trim());

        var rows = track == null ? new List<SignSegmentState>() : await SignVideoStore.SegmentsAsync(_context, track.Id);
        if (track == null)
        {
            track = new PlatformSignLanguageTrack
            {
                SourceAssetId = asset.Id,
                Language = PlatformCatalog.Captions.Vietnamese,
                SignLanguage = input.SignLanguage,
                CreatedByUserId = _currentUser.UserId,
                Settings = "{}",
            };
            _context.PlatformSignLanguageTracks.Add(track);
        }

        track.Region = preferences.Region;
        track.Variant = preferences.Variant;
        track.CaptionSource = input.CaptionSource;
        track.CaptionFingerprint = SignVideoRules.CaptionFingerprint(cues);
        track.RenderMode = input.RenderMode;
        track.Renderer = input.Renderer;

        // Snapshot the old sentences before their rows are reused for the new ones.
        var pool = rows
            .Select(s => new Previous(s.Row.CaptionText, SignVideoRules.Parse(s.Row.Sequence), s.Row.ReviewStatus, s.Row.ReviewNote, s.Row.ReviewedByUserId, s.Row.ReviewedAt))
            .GroupBy(p => SignTextNormalizer.Key(p.Text))
            .ToDictionary(g => g.Key, g => new Queue<Previous>(g));
        var byIndex = rows.ToDictionary(s => s.Row.SegmentIndex, s => s.Row);

        var states = new List<SignSegmentState>(cues.Count);
        for (var i = 0; i < cues.Count; i++)
        {
            var cue = cues[i];
            if (!byIndex.TryGetValue(i, out var row))
            {
                row = new PlatformSignLanguageSegment { TrackId = track.Id, SegmentIndex = i };
                _context.PlatformSignLanguageSegments.Add(row);
            }

            row.CaptionText = cue.Text.Length > SignVideo.MaxSourceTextLength ? cue.Text[..SignVideo.MaxSourceTextLength] : cue.Text;
            row.StartMs = cue.StartMs;
            row.EndMs = cue.EndMs;

            List<SignSequenceItem> items;
            if (pool.TryGetValue(SignTextNormalizer.Key(cue.Text), out var queue) && queue.Count > 0 && Touched(queue.Peek()))
            {
                // The reviewer worked on this sentence: keep its signs and order, look up again what the matcher chose.
                var previous = queue.Dequeue();
                items = previous.Items;
                var changed = Refresh(items, dictionary, preferences);
                row.ReviewStatus = changed ? SignVideo.Review.Pending : previous.ReviewStatus;
                row.ReviewNote = previous.ReviewNote;
                row.ReviewedByUserId = changed ? null : previous.ReviewedBy;
                row.ReviewedAt = changed ? null : previous.ReviewedAt;
            }
            else
            {
                // New or untouched sentence: matched again from the start (new signs, better rules apply).
                if (pool.TryGetValue(SignTextNormalizer.Key(cue.Text), out var untouched) && untouched.Count > 0) untouched.Dequeue();
                items = _matcher.MatchSentence(cue.Text, dictionary, preferences).Select(SignVideoRules.Item).ToList();
                row.ReviewStatus = SignVideo.Review.Pending;
                row.ReviewNote = null;
                row.ReviewedByUserId = null;
                row.ReviewedAt = null;
            }

            states.Add(new SignSegmentState(row, items));
        }

        foreach (var extra in rows.Where(s => s.Row.SegmentIndex >= cues.Count)) _context.PlatformSignLanguageSegments.Remove(extra.Row);

        SignVideoRules.EstimateTimings(states, dictionary.ById);
        var problems = SignVideoRules.RenderProblems(states, dictionary.ById, track.Renderer);
        track.Status = SignVideoRules.SettleStatus(track, problems.Count, SignVideoRules.RenderFingerprint(track, states, dictionary.ById));
        track.Progress = (short)(track.Status is TrackStatus.Ready or TrackStatus.Published ? 100 : 0);
        track.ErrorCode = null;
        track.ProgressStage = null;
        track.ProgressDetail = null;
        track.ErrorMessage = null;
        await _context.SaveChangesAsync();

        return await _reader.ReadAsync(asset.Id, input.SignLanguage);
    }

    /// <summary>The reviewer changed something in the sentence (a sign chosen, skipped, timed, noted, or a review).</summary>
    private static bool Touched(Previous previous) =>
        previous.ReviewStatus != SignVideo.Review.Pending
        || previous.ReviewNote != null
        || previous.Items.Any(i => i.IsManualOverride || i.Skipped || i.DurationMs != null || i.Note != null);

    /// <summary>
    /// Looks up again every sign the matcher chose (the dictionary or the region may have changed); the admin's own
    /// choices are kept. True when a sign changed.
    /// </summary>
    private bool Refresh(List<SignSequenceItem> items, SignDictionaryIndex dictionary, SignMatchPreferences preferences)
    {
        var changed = false;
        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            if (item.IsManualOverride) continue;

            var match = SignVideoRules.Item(_matcher.MatchPhrase(item.SourceText, dictionary, preferences));
            // Same sign as before: keep the item as it is (its match type may differ once read alone).
            if (match.GlossId != null && match.GlossId == item.GlossId) continue;
            match.Skipped = item.Skipped;
            match.DurationMs = item.DurationMs;
            match.Note = item.Note;
            if (match.GlossId != item.GlossId || match.MatchType != item.MatchType) changed = true;
            items[i] = match;
        }

        return changed;
    }
}
