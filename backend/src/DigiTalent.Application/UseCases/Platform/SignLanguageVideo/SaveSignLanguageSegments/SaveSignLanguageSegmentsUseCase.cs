using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// "Lưu bản nháp" of the sign map: the admin changed signs (another variant, a sign picked by hand, words joined or
/// split, order, length, skipped) or reviewed sentences. A sign picked by hand is kept as a manual choice; a sign
/// without a choice is looked up again. Changing the signs of an approved sentence sends it back to review, and the
/// rendered video becomes outdated (it must be rendered again before publishing). Learners are not affected.
/// </summary>
public partial class SaveSignLanguageSegmentsUseCase : IUseCase<SaveSignLanguageSegmentsUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ISignGlossMatcher _matcher;
    private readonly SignLanguageVideoReader _reader;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;

    public SaveSignLanguageSegmentsUseCase(
        IApplicationDbContext context,
        ISignGlossMatcher matcher,
        SignLanguageVideoReader reader,
        ICurrentUser currentUser,
        TimeProvider time)
    {
        _context = context;
        _matcher = matcher;
        _reader = reader;
        _currentUser = currentUser;
        _time = time;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(SaveSignLanguageSegmentsUseCaseInput input)
    {
        var now = _time.GetUtcNow();
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        SignVideoStore.EnsureNotRendering(track, now);
        var states = await SignVideoStore.SegmentsAsync(_context, track.Id);
        var dictionary = SignDictionaryIndex.Build(await SignDictionaryLoader.InUseAsync(_context, track.SignLanguage));
        var preferences = new SignMatchPreferences(track.SignLanguage, track.Region, track.Variant);
        var entries = await Entries(states, dictionary);
        var fingerprintBefore = SignVideoRules.RenderFingerprint(track, states, entries);

        foreach (var change in input.Segments)
        {
            var segment = states.FirstOrDefault(s => s.Row.SegmentIndex == change.Index)
                ?? throw Invalid($"Câu số {change.Index + 1} không có trong bản đồ ký hiệu. Tải lại trang.");
            var label = $"Câu số {change.Index + 1}";
            var signsBefore = Signature(segment);

            if (change.Items != null)
            {
                var items = new List<SignSequenceItem>(change.Items.Count);
                for (var i = 0; i < change.Items.Count; i++) items.Add(Item(change.Items[i], $"{label}, ký hiệu {i + 1}", dictionary, preferences));
                segment.Items.Clear();
                segment.Items.AddRange(items);
            }

            if (change.ReviewNote != null)
            {
                var note = change.ReviewNote.Trim();
                segment.Row.ReviewNote = note.Length == 0 ? null : note;
            }

            if (change.ReviewStatus != null)
            {
                if (change.ReviewStatus == SignVideo.Review.Approved)
                {
                    var unresolved = segment.Items.FirstOrDefault(i => !i.Skipped && i.GlossId == null);
                    if (unresolved != null)
                    {
                        throw Invalid($"{label} còn “{unresolved.SourceText}” chưa có ký hiệu nên chưa duyệt được. Chọn ký hiệu hoặc bỏ qua từ này.");
                    }
                }

                Review(segment, change.ReviewStatus, now);
            }
            else if (Signature(segment) != signsBefore && segment.Row.ReviewStatus == SignVideo.Review.Approved)
            {
                // The signs changed after the approval: they need to be checked again.
                Review(segment, SignVideo.Review.Pending, now);
            }
        }

        entries = await Entries(states, dictionary);
        var fingerprint = SignVideoRules.RenderFingerprint(track, states, entries);
        if (fingerprint != fingerprintBefore)
        {
            SignVideoRules.EstimateTimings(states, entries);
        }
        else
        {
            foreach (var segment in states) SignVideoRules.Store(segment);
        }

        if (fingerprint != fingerprintBefore || track.Status != TrackStatus.Failed)
        {
            var problems = SignVideoRules.RenderProblems(states, entries, track.Renderer);
            track.Status = SignVideoRules.SettleStatus(track, problems.Count, fingerprint);
            track.Progress = (short)(track.Status is TrackStatus.Ready or TrackStatus.Published ? 100 : 0);
            track.ErrorCode = null;
            track.ProgressStage = null;
            track.ProgressDetail = null;
            track.ErrorMessage = null;
        }

        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
    }

    private SignSequenceItem Item(SignItemInput input, string label, SignDictionaryIndex dictionary, SignMatchPreferences preferences)
    {
        var text = Spaces().Replace((input.SourceText ?? string.Empty).Normalize(System.Text.NormalizationForm.FormC), " ").Trim();
        if (text.Length == 0) throw Invalid($"{label}: chưa có chữ.");
        if (text.Length > SignVideo.MaxSourceTextLength) throw Invalid($"{label}: dài quá {SignVideo.MaxSourceTextLength} ký tự.");
        if (input.DurationMs is { } duration && (duration < SignVideo.MinItemDurationMs || duration > SignVideo.MaxItemDurationMs))
        {
            throw Invalid($"{label}: thời lượng phải từ {SignVideo.MinItemDurationMs / 1000.0:0.#} đến {SignVideo.MaxItemDurationMs / 1000} giây.");
        }

        var note = input.Note?.Trim();
        if (note is { Length: > SignVideo.MaxNoteLength }) throw Invalid($"{label}: ghi chú tối đa {SignVideo.MaxNoteLength} ký tự.");

        var auto = _matcher.MatchPhrase(text, dictionary, preferences);
        SignSequenceItem item;
        if (input.GlossId is { } glossId && auto.Entry?.Id != glossId)
        {
            if (!dictionary.ById.TryGetValue(glossId, out var entry))
            {
                throw new BadRequestException($"{label}: ký hiệu đã chọn không còn trong từ điển. Chọn ký hiệu khác.", "segments", SignVideo.Errors.GlossNotFound);
            }

            item = new SignSequenceItem
            {
                SourceText = text,
                NormalizedText = SignTextNormalizer.Key(text),
                GlossId = entry.Id,
                Gloss = entry.Gloss,
                AssetId = entry.VideoAssetId,
                MatchType = SignVideo.Match.Manual,
                Confidence = 1,
                IsManualOverride = true,
                CandidateIds = auto.Candidates.Count > 1 ? auto.Candidates.Select(c => c.Id).ToList() : null,
            };
        }
        else
        {
            item = SignVideoRules.Item(auto);
        }

        item.Skipped = input.Skipped;
        item.DurationMs = input.DurationMs;
        item.Note = string.IsNullOrEmpty(note) ? null : note;
        return item;
    }

    private void Review(SignSegmentState segment, string status, DateTimeOffset now)
    {
        segment.Row.ReviewStatus = status;
        segment.Row.ReviewedByUserId = status == SignVideo.Review.Pending ? null : _currentUser.UserId;
        segment.Row.ReviewedAt = status == SignVideo.Review.Pending ? null : now;
    }

    /// <summary>The signs as they matter for a review (which signs, in which order, which are skipped).</summary>
    private static string Signature(SignSegmentState segment) =>
        string.Join(';', segment.Items.Select(i => $"{i.SourceText}/{i.GlossId}/{i.Skipped}"));

    /// <summary>Dictionary entries of the signs in use plus the archived signs still referenced (reported as ARCHIVED).</summary>
    private async Task<Dictionary<Guid, SignDictionaryEntry>> Entries(IEnumerable<SignSegmentState> states, SignDictionaryIndex dictionary)
    {
        var entries = new Dictionary<Guid, SignDictionaryEntry>(dictionary.ById);
        var unknown = states.SelectMany(s => s.Items).Where(i => i.GlossId is { } id && !entries.ContainsKey(id)).Select(i => i.GlossId!.Value).ToList();
        foreach (var (id, entry) in await SignDictionaryLoader.ByIdsAsync(_context, unknown)) entries[id] = entry;
        return entries;
    }

    private static BadRequestException Invalid(string message) => new(message, "segments", SignVideo.Errors.InvalidSegments);

    [GeneratedRegex(@"\s+")]
    private static partial Regex Spaces();
}
