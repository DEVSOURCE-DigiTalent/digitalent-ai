using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>A sentence of a track with its signs read from the jsonb column.</summary>
public sealed record SignSegmentState(PlatformSignLanguageSegment Row, List<SignSequenceItem> Items)
{
    public bool Skipped => Row.ReviewStatus == SignVideo.Review.Skipped;

    /// <summary>Signs to show (the sentence and the sign are not skipped).</summary>
    public IEnumerable<SignSequenceItem> Signed => Skipped ? Enumerable.Empty<SignSequenceItem>() : Items.Where(i => !i.Skipped);
}

/// <summary>A problem that stops the render or the publication: machine code + Vietnamese message.</summary>
public sealed record SignVideoProblem(string Code, string Message);

/// <summary>
/// Rules of the sign-language video (schema v3.13): what each sign needs, the state of the draft, what blocks a
/// render or a publication, the jsonb columns and the builder DTO. Messages are Vietnamese and never show a path.
/// </summary>
public static class SignVideoRules
{
    public const string Ok = "OK";
    public const string MissingSign = "MISSING";
    public const string AmbiguousSign = "AMBIGUOUS";
    public const string NoVideo = "NO_VIDEO";
    public const string NoMotion = "NO_MOTION";
    public const string NoLicense = "NO_LICENSE";
    public const string ArchivedSign = "ARCHIVED";
    public const string SkippedSign = "SKIPPED";

    public const string ReviewWarning =
        "Bản đồ ký hiệu được tạo tự động. Vui lòng nhờ người biết ngôn ngữ ký hiệu kiểm tra trước khi xuất bản.";

    private static readonly string[] PlayableTypes = { "video/mp4", "video/webm" };

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // ----- jsonb ---------------------------------------------------------------------------------

    public static string Serialize(IEnumerable<SignSequenceItem> items) => JsonSerializer.Serialize(items, Json);

    public static List<SignSequenceItem> Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new();
        try
        {
            return JsonSerializer.Deserialize<List<SignSequenceItem>>(json, Json) ?? new();
        }
        catch (JsonException)
        {
            return new();
        }
    }

    public static SignSegmentState State(PlatformSignLanguageSegment row) => new(row, Parse(row.Sequence));

    /// <summary>A matcher result as a stored item.</summary>
    public static SignSequenceItem Item(SignMatch match) => new()
    {
        SourceText = match.SourceText,
        NormalizedText = match.NormalizedText,
        GlossId = match.Entry?.Id,
        Gloss = match.Entry?.Gloss,
        AssetId = match.Entry?.VideoAssetId,
        MatchType = match.MatchType,
        Confidence = Math.Round(match.Confidence, 3),
        IsMissing = match.Entry == null,
        Hint = match.Hint,
        // Several signs fit, or the only one must be confirmed: keep them so the reviewer can choose.
        CandidateIds = match.Candidates.Count > 1 || (match.Entry == null && match.Candidates.Count > 0) ? match.Candidates.Select(c => c.Id).ToList() : null,
    };

    /// <summary>Writes the items back with the words still missing and the confidence of the sentence.</summary>
    public static void Store(SignSegmentState segment)
    {
        var counted = segment.Items.Where(i => !i.Skipped).ToList();
        segment.Row.Sequence = Serialize(segment.Items);
        segment.Row.Missing = JsonSerializer.Serialize(counted.Where(i => i.GlossId == null).Select(i => i.SourceText).ToList(), Json);
        segment.Row.Confidence = counted.Count == 0 ? 1m : Math.Clamp(Math.Round((decimal)counted.Average(i => i.Confidence), 3), 0m, 1m);
    }

    // ----- What a sign needs -------------------------------------------------------------------

    /// <summary>OK, or why this sign cannot be rendered by <paramref name="renderer"/>.</summary>
    public static string Availability(SignSequenceItem item, SignDictionaryEntry? entry, string renderer)
    {
        if (item.Skipped) return SkippedSign;
        if (item.GlossId == null) return item.MatchType == SignVideo.Match.Ambiguous ? AmbiguousSign : MissingSign;
        if (entry == null || entry.IsArchived) return ArchivedSign;
        // The motion was taken from a person's video: the avatar may use it only within the rights of that video.
        if (renderer == SignVideo.Renderer.Avatar) return !entry.HasMotion ? NoMotion : entry.Licensed ? Ok : NoLicense;
        if (!entry.HasVideo) return NoVideo;
        return entry.Licensed ? Ok : NoLicense;
    }

    public static string CodeOf(string availability) => availability switch
    {
        NoVideo => SignVideo.Errors.MediaMissing,
        NoMotion => SignVideo.Errors.MotionMissing,
        NoLicense => SignVideo.Errors.LicenseMissing,
        _ => SignVideo.Errors.GlossNotFound,
    };

    /// <summary>"Không thể tạo video ký hiệu vì câu số 3 chưa có ký hiệu cho “marketing”." and the like.</summary>
    public static string? Problem(int segmentIndex, SignSequenceItem item, string availability, SignDictionaryEntry? entry,
        IReadOnlyDictionary<Guid, SignDictionaryEntry>? entries = null)
    {
        var offered = item.CandidateIds is { Count: > 0 } ids && entries != null ? entries.GetValueOrDefault(ids[0]) : null;
        var n = segmentIndex + 1;
        var name = entry?.Gloss ?? item.Gloss ?? item.SourceText;
        return availability switch
        {
            MissingSign => $"Không thể tạo video ký hiệu vì câu số {n} chưa có ký hiệu cho “{item.SourceText}”.",
            AmbiguousSign when item.Hint == SignGlossMatcher.SenseCheckHint =>
                $"Câu số {n}: “{item.SourceText}” chỉ khớp ký hiệu “{offered?.Gloss ?? item.SourceText}” dành cho một nghĩa riêng; xác nhận đúng nghĩa (chọn ký hiệu đó) hoặc bỏ qua từ này.",
            AmbiguousSign => $"Câu số {n}: “{item.SourceText}” có {item.CandidateIds?.Count ?? 2} ký hiệu ngang nhau, hãy chọn một.",
            ArchivedSign => $"Câu số {n}: ký hiệu “{name}” đã bị xóa khỏi từ điển, hãy chọn ký hiệu khác.",
            NoVideo => $"Câu số {n}: đã có từ “{name}” trong từ điển nhưng chưa có video ký hiệu.",
            NoMotion => $"Câu số {n}: đã có từ “{name}” trong từ điển nhưng chưa có chuyển động cho nhân vật 3D.",
            NoLicense => $"Câu số {n}: video của “{name}” chưa ghi đủ nguồn, giấy phép hoặc chưa xác nhận được phép dùng.",
            _ => null,
        };
    }

    public const string SenseReason = "Chỉ khớp một ký hiệu dành cho nghĩa riêng, cần xác nhận";

    public static string Reason(string availability) => availability switch
    {
        MissingSign => "Chưa có trong từ điển",
        AmbiguousSign => "Có nhiều ký hiệu ngang nhau, cần chọn một",
        ArchivedSign => "Ký hiệu đã bị xóa khỏi từ điển",
        NoVideo => "Đã có từ trong từ điển nhưng chưa có video",
        NoMotion => "Đã có từ trong từ điển nhưng chưa có chuyển động",
        NoLicense => "Video chưa ghi nguồn, giấy phép hoặc chưa xác nhận được phép dùng",
        _ => string.Empty,
    };

    /// <summary>Everything that stops a render, in sentence order.</summary>
    public static List<SignVideoProblem> RenderProblems(IReadOnlyList<SignSegmentState> segments, IReadOnlyDictionary<Guid, SignDictionaryEntry> entries, string renderer)
    {
        var problems = new List<SignVideoProblem>();
        foreach (var segment in segments.OrderBy(s => s.Row.SegmentIndex))
        {
            foreach (var item in segment.Signed)
            {
                var entry = item.GlossId is { } id ? entries.GetValueOrDefault(id) : null;
                var availability = Availability(item, entry, renderer);
                if (availability == Ok) continue;
                problems.Add(new SignVideoProblem(CodeOf(availability), Problem(segment.Row.SegmentIndex, item, availability, entry, entries)!));
            }
        }

        if (problems.Count == 0 && !segments.Any(s => s.Signed.Any()))
        {
            problems.Add(new SignVideoProblem(SignVideo.Errors.GlossNotFound, "Chưa có câu nào có ký hiệu để dựng video."));
        }

        if (renderer == SignVideo.Renderer.Clip && SignerProblem(segments, entries) is { } mixed) problems.Add(mixed);
        return problems;
    }

    /// <summary>
    /// One video, one character: the clips joined must all show the same person (recorded signer name). Signs from
    /// several people — or from a video whose signer is not recorded, when more than one video is used — make the
    /// character change from sign to sign, which learners find confusing. The 3D avatar is always one character.
    /// </summary>
    public static SignVideoProblem? SignerProblem(IReadOnlyList<SignSegmentState> segments, IReadOnlyDictionary<Guid, SignDictionaryEntry> entries)
    {
        var used = segments.Where(s => !s.Skipped)
            .SelectMany(s => s.Signed)
            .Select(i => i.GlossId is { } id ? entries.GetValueOrDefault(id) : null)
            .Where(e => e is { HasVideo: true })
            .Select(e => e!)
            .DistinctBy(e => e.VideoAssetId)
            .ToList();
        if (used.Count <= 1) return null;
        var signers = used.Select(e => e.Signer?.ToLowerInvariant()).Distinct().ToList();
        if (signers.Count == 1 && signers[0] != null) return null;

        var unknown = used.Where(e => e.Signer == null).Select(e => $"“{e.Gloss}”").Take(3).ToList();
        var names = used.Where(e => e.Signer != null).Select(e => e.Signer!).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var detail = names.Count > 1
            ? $"các ký hiệu do {names.Count} người khác nhau ra dấu ({string.Join(", ", names.Take(3))}{(names.Count > 3 ? ", …" : string.Empty)})"
            : $"chưa ghi người ra dấu của {string.Join(", ", unknown)}{(used.Count(e => e.Signer == null) > 3 ? ", …" : string.Empty)}";
        return new SignVideoProblem(SignVideo.Errors.SignerMixed,
            $"Một video ký hiệu chỉ được có một nhân vật từ đầu đến cuối, nhưng {detail}. Chọn “Nhân vật 3D” trong cài đặt (một nhân vật cho cả video), hoặc chỉ dùng ký hiệu của cùng một người và ghi tên người ra dấu trong Từ điển ký hiệu.");
    }

    // ----- State of the draft ------------------------------------------------------------------

    /// <summary>Status after an analysis or an edit: missing signs, else rendered and current, else to render.</summary>
    public static string SettleStatus(PlatformSignLanguageTrack track, int problems, string fingerprint)
    {
        if (problems > 0) return TrackStatus.MissingGlosses;
        if (track.OutputAssetId != null && track.RenderedFingerprint == fingerprint)
        {
            return track.PublishedOutputAssetId == track.OutputAssetId ? TrackStatus.Published : TrackStatus.Ready;
        }

        return TrackStatus.ReadyToRender;
    }

    /// <summary>A render still RENDERING with no progress for <see cref="SignVideo.StaleAfter"/> was lost.</summary>
    public static bool IsStale(PlatformSignLanguageTrack track, DateTimeOffset now) =>
        track.Status == TrackStatus.Rendering && now - track.UpdatedAt > SignVideo.StaleAfter;

    public static string CaptionFingerprint(IEnumerable<CaptionCueDto> cues) => Hash(PlatformCaptionRules.Serialize(cues));

    /// <summary>What the render depends on: mode, renderer, settings, sentences, signs and the clips of those signs.</summary>
    public static string RenderFingerprint(PlatformSignLanguageTrack track, IReadOnlyList<SignSegmentState> segments, IReadOnlyDictionary<Guid, SignDictionaryEntry> entries)
    {
        var text = new StringBuilder();
        text.Append(track.Renderer).Append('|').Append(track.RenderMode).Append('|').Append(track.Settings).Append('|');
        foreach (var segment in segments.OrderBy(s => s.Row.SegmentIndex))
        {
            text.Append(segment.Row.SegmentIndex).Append(':').Append(segment.Row.StartMs).Append('-').Append(segment.Row.EndMs)
                .Append(segment.Skipped ? "S" : string.Empty).Append('[');
            foreach (var item in segment.Signed)
            {
                var entry = item.GlossId is { } id ? entries.GetValueOrDefault(id) : null;
                text.Append(item.GlossId).Append('/').Append(item.DurationMs).Append('/').Append(entry?.VideoAssetId)
                    .Append('/').Append(entry?.TrimStartMs).Append('-').Append(entry?.TrimEndMs).Append('/').Append(entry?.Mirrored == true ? 'm' : '-');
                // The avatar plays the motion: a motion taken again changes the video (the clip renderer does not read it).
                if (track.Renderer == SignVideo.Renderer.Avatar) text.Append('/').Append(entry?.MotionFps).Append('x').Append(entry?.MotionFrames);
                text.Append(';');
            }

            text.Append(']');
        }

        return Hash(text.ToString());
    }

    /// <summary>Natural length of a sign: its clip when known, else an estimate.</summary>
    public static (int Ms, bool Measured) NaturalLength(SignDictionaryEntry? entry) =>
        entry?.ClipDurationMs is > 0 ? (entry.ClipDurationMs.Value, true) : (SignVideo.EstimatedSignMs, false);

    /// <summary>The planner input: signs to show per sentence (skipped sentences and signs, and signs without a gloss, left out).</summary>
    public static List<SignPlanSegment> PlanInput(IReadOnlyList<SignSegmentState> segments, Func<SignSequenceItem, int> natural) =>
        segments.OrderBy(s => s.Row.SegmentIndex)
            .Select(s => new SignPlanSegment(
                s.Row.SegmentIndex,
                s.Row.StartMs,
                s.Row.EndMs,
                s.Skipped
                    ? Array.Empty<SignPlanItem>()
                    : s.Items.Select((item, index) => (item, index))
                        .Where(x => !x.item.Skipped && x.item.GlossId != null)
                        .Select(x => new SignPlanItem(x.index, natural(x.item), x.item.DurationMs))
                        .ToList()))
            .ToList();

    /// <summary>Writes the estimated place of every sign (clip lengths known from earlier renders, else ~1 s each).</summary>
    public static IReadOnlyList<string> EstimateTimings(IReadOnlyList<SignSegmentState> segments, IReadOnlyDictionary<Guid, SignDictionaryEntry> entries)
    {
        var timeline = SignTimelinePlanner.Plan(PlanInput(segments, item => NaturalLength(item.GlossId is { } id ? entries.GetValueOrDefault(id) : null).Ms));
        ApplyTimeline(segments, timeline.Placements, measured: false);
        return timeline.Warnings;
    }

    public static void ApplyTimeline(IReadOnlyList<SignSegmentState> segments, IReadOnlyList<SignPlacement> placements, bool measured)
    {
        var byKey = placements.ToDictionary(p => (p.SegmentIndex, p.ItemIndex));
        foreach (var segment in segments)
        {
            for (var i = 0; i < segment.Items.Count; i++)
            {
                var item = segment.Items[i];
                if (byKey.TryGetValue((segment.Row.SegmentIndex, i), out var placement))
                {
                    item.StartMs = placement.StartMs;
                    item.EndMs = placement.EndMs;
                    item.TimingMeasured = measured;
                }
                else
                {
                    item.StartMs = null;
                    item.EndMs = null;
                    item.TimingMeasured = false;
                }
            }

            Store(segment);
        }
    }

    // ----- Publication -------------------------------------------------------------------------

    /// <summary>What stops "Xuất bản video ký hiệu" (the storage check is done by the use case).</summary>
    public static List<SignVideoProblem> PublishProblems(
        PlatformSignLanguageTrack track,
        IReadOnlyList<SignSegmentState> segments,
        IReadOnlyDictionary<Guid, SignDictionaryEntry> entries,
        PlatformAsset? output,
        DateTimeOffset now)
    {
        var problems = new List<SignVideoProblem>();
        if (track.Status == TrackStatus.Rendering && !IsStale(track, now))
        {
            problems.Add(new(SignVideo.Errors.JobAlreadyRunning, "Đang dựng video ký hiệu. Chờ xong rồi xuất bản."));
            return problems;
        }

        if (track.Status == TrackStatus.Failed)
        {
            problems.Add(new(track.ErrorCode ?? SignVideo.Errors.RenderFailed, "Lần dựng gần nhất bị lỗi. Bấm Thử lại trước khi xuất bản."));
        }

        problems.AddRange(RenderProblems(segments, entries, track.Renderer));
        if (track.OutputAssetId == null || output == null)
        {
            problems.Add(new(SignVideo.Errors.NotRendered, "Chưa dựng video ký hiệu. Bấm “Tạo video ký hiệu” trước khi xuất bản."));
        }
        else
        {
            if (track.RenderedFingerprint != RenderFingerprint(track, segments, entries))
            {
                problems.Add(new(SignVideo.Errors.NotRendered, "Bản đồ ký hiệu đã thay đổi sau lần dựng. Dựng lại video trước khi xuất bản."));
            }

            if (!PlayableTypes.Contains(output.ContentType) || output.SizeBytes <= 0
                || track.OutputDurationMs is not > 0 || track.OutputWidth is not > 0 || track.OutputHeight is not > 0)
            {
                problems.Add(new(SignVideo.Errors.OutputInvalid, "Video ký hiệu đã dựng không hợp lệ (định dạng, dung lượng hoặc thông tin video). Dựng lại video."));
            }
        }

        var unreviewed = segments.Count(NeedsReview);
        if (unreviewed > 0)
        {
            problems.Add(new(SignVideo.Errors.ReviewPending,
                $"Còn {unreviewed} câu chưa được duyệt. Nhờ người biết ngôn ngữ ký hiệu duyệt từng câu (hoặc bỏ qua câu) trước khi xuất bản."));
        }

        return problems;
    }

    /// <summary>A sentence with something to sign that nobody approved or skipped yet.</summary>
    public static bool NeedsReview(SignSegmentState segment) =>
        segment.Row.ReviewStatus == SignVideo.Review.Pending && segment.Items.Any(i => !i.Skipped);

    // ----- Messages ----------------------------------------------------------------------------

    public static string? ErrorMessage(string? code) => code switch
    {
        null => null,
        SignVideo.Errors.CaptionNotFound => "Hãy tạo lời thoại của video (bước 1) trước khi tạo video ngôn ngữ ký hiệu.",
        SignVideo.Errors.CaptionNotPublished => "Lời thoại của video chưa có câu nào. Tạo hoặc nhập lời thoại ở bước 1 rồi phân tích lại.",
        SignVideo.Errors.GlossNotFound => "Còn câu chưa có ký hiệu. Mở bản đồ ký hiệu để bổ sung.",
        SignVideo.Errors.MediaMissing => "Từ điển hiện chưa có video hoặc chuyển động cho các ký hiệu này. Vui lòng bổ sung dữ liệu trong Từ điển ký hiệu.",
        SignVideo.Errors.MotionMissing => "Có ký hiệu chưa có chuyển động cho nhân vật 3D.",
        SignVideo.Errors.SignerMixed => "Một video ký hiệu chỉ được có một nhân vật. Chọn “Nhân vật 3D” hoặc chỉ dùng ký hiệu của cùng một người ra dấu.",
        SignVideo.Errors.AvatarTrackMissing => "Chưa dựng nhân vật 3D cho bản đồ ký hiệu hiện tại. Bấm “Tạo video ký hiệu” để dựng nhân vật trong trình duyệt.",
        SignVideo.Errors.AvatarTrackOutdated => "Bản đồ ký hiệu hoặc cài đặt vừa thay đổi trong lúc dựng nhân vật 3D. Dựng lại nhân vật.",
        SignVideo.Errors.AvatarTrackInvalid => "Track nhân vật 3D tải lên không đúng (định dạng, số khung hình hoặc dung lượng). Dựng lại nhân vật.",
        SignVideo.Errors.LicenseMissing => "Có video ký hiệu chưa ghi nguồn, giấy phép hoặc chưa xác nhận được phép dùng.",
        SignVideo.Errors.RendererNotConfigured => "Máy chủ chưa cấu hình bộ dựng video ký hiệu.",
        SignVideo.Errors.VideoUnreadable => "Không đọc được video gốc hoặc video của một ký hiệu.",
        SignVideo.Errors.RenderFailed => "Dựng video ký hiệu chưa thành công. Bấm Thử lại; nếu vẫn lỗi, báo quản trị hệ thống.",
        SignVideo.Errors.StorageUploadFailed => "Không lưu được video ký hiệu vào kho lưu trữ. Thử lại sau ít phút.",
        SignVideo.Errors.OutputInvalid => "Video ký hiệu tạo ra không hợp lệ (rỗng hoặc không đọc được). Bấm Thử lại.",
        SignVideo.Errors.NotRendered => "Chưa dựng video ký hiệu.",
        SignVideo.Errors.ReviewPending => "Còn câu chưa được duyệt.",
        SignVideo.Errors.JobAlreadyRunning => "Đang dựng video ký hiệu cho video này. Chờ xong rồi sửa.",
        SignVideo.Errors.JobTimeout => "Dựng video quá lâu nên đã dừng. Bấm Thử lại; video rất dài nên chia thành nhiều phần.",
        SignVideo.Errors.PermissionDenied => "Bạn không có quyền chỉnh sửa nội dung khóa học.",
        _ => "Tạo video ngôn ngữ ký hiệu chưa thành công. Bấm Thử lại.",
    };

    // ----- DTO ---------------------------------------------------------------------------------

    public static SignCandidateDto Candidate(SignDictionaryEntry entry) => new()
    {
        Id = entry.Id,
        Gloss = entry.Gloss,
        Kind = entry.Kind,
        Status = entry.Status,
        Region = entry.Region,
        Variant = entry.Variant,
        IsPreferred = entry.IsPreferred,
        Priority = entry.Priority,
        HasVideo = entry.HasVideo,
        HasMotion = entry.HasMotion,
        Licensed = entry.Licensed,
    };

    public static SignVideoOutputDto? Output(PlatformAsset? asset, string renderMode, DateTimeOffset? at, int? durationMs, int? width, int? height, IPlatformAssetUrlSigner? urls) =>
        asset == null
            ? null
            : new SignVideoOutputDto
            {
                AssetId = asset.Id,
                Url = urls?.ContentPath(asset.Id) ?? string.Empty,
                FileName = asset.FileName,
                ContentType = asset.ContentType,
                SizeBytes = asset.SizeBytes,
                DurationMs = durationMs,
                Width = width,
                Height = height,
                RenderMode = renderMode,
                At = at,
            };

    public static SignLanguageVideoDto Dto(SignVideoView view)
    {
        var dto = new SignLanguageVideoDto { AssetId = view.AssetId, Prerequisites = view.Prerequisites };
        var track = view.Track;
        if (track == null)
        {
            if (!view.Prerequisites.HasCaptions) dto.RenderBlockers.Add(ErrorMessage(SignVideo.Errors.CaptionNotFound)!);
            if (view.Prerequisites.UsableSigns == 0) dto.RenderBlockers.Add(ErrorMessage(SignVideo.Errors.MediaMissing)!);
            if (!view.Prerequisites.RendererAvailable) dto.RenderBlockers.Add(view.Prerequisites.RendererMessage ?? ErrorMessage(SignVideo.Errors.RendererNotConfigured)!);
            return dto;
        }

        var renderer = track.Renderer;
        var stale = IsStale(track, view.Now);
        dto.TrackId = track.Id;
        dto.Status = track.Status;
        dto.Progress = track.Progress;
        dto.ProgressStage = track.ProgressStage;
        dto.ProgressDetail = track.ProgressDetail;
        dto.RenderStartedAt = track.RenderStartedAt;
        dto.ErrorCode = track.ErrorCode ?? (stale ? SignVideo.Errors.JobTimeout : null);
        dto.ErrorMessage = track.ErrorMessage ?? ErrorMessage(dto.ErrorCode);
        dto.Stale = stale;
        dto.UpdatedAt = track.UpdatedAt;
        dto.Settings = new SignVideoSettingsDto
        {
            CaptionSource = track.CaptionSource,
            RenderMode = track.RenderMode,
            Renderer = track.Renderer,
            SignLanguage = track.SignLanguage,
            Region = track.Region,
            Variant = track.Variant,
        };
        dto.CaptionsChanged = view.CurrentCaptionFingerprint != null && view.CurrentCaptionFingerprint != track.CaptionFingerprint;
        var fingerprint = RenderFingerprint(track, view.Segments, view.Entries);
        dto.OutputOutdated = track.OutputAssetId != null && track.Status != TrackStatus.Rendering && track.RenderedFingerprint != fingerprint;
        dto.Output = Output(view.OutputAsset, track.RenderMode, track.RenderedAt, track.OutputDurationMs, track.OutputWidth, track.OutputHeight, view.Urls);
        dto.Published = Output(view.PublishedAsset, track.PublishedRenderMode ?? track.RenderMode, track.PublishedAt, null, null, null, view.Urls);
        dto.HasUnpublishedChanges = track.Status != TrackStatus.Published;

        var missing = new Dictionary<(string Text, string Availability), SignMissingWordDto>();
        double confidenceSum = 0;
        var confidenceCount = 0;
        foreach (var segment in view.Segments.OrderBy(s => s.Row.SegmentIndex))
        {
            var row = segment.Row;
            var segmentDto = new SignSegmentDto
            {
                Index = row.SegmentIndex,
                StartMs = row.StartMs,
                EndMs = row.EndMs,
                CaptionText = row.CaptionText,
                ReviewStatus = row.ReviewStatus,
                ReviewNote = row.ReviewNote,
                ReviewedAt = row.ReviewedAt,
                ReviewedBy = row.ReviewedByUserId is { } reviewer ? view.Reviewers.GetValueOrDefault(reviewer) : null,
                Confidence = (double)row.Confidence,
                NonSpeech = segment.Items.Count == 0,
            };
            dto.Summary.Segments++;
            if (segment.Skipped) dto.Summary.SkippedSegments++;
            if (NeedsReview(segment)) dto.Summary.UnreviewedSegments++;

            var blocked = false;
            for (var i = 0; i < segment.Items.Count; i++)
            {
                var item = segment.Items[i];
                var entry = item.GlossId is { } id ? view.Entries.GetValueOrDefault(id) : null;
                var availability = segment.Skipped && !item.Skipped ? SkippedSign : Availability(item, entry, renderer);
                var problem = Problem(row.SegmentIndex, item, availability, entry, view.Entries);
                segmentDto.Items.Add(new SignItemDto
                {
                    SourceText = item.SourceText,
                    NormalizedText = item.NormalizedText,
                    GlossId = item.GlossId,
                    Gloss = entry?.Gloss ?? item.Gloss,
                    GlossKind = entry?.Kind,
                    GlossStatus = entry?.Status,
                    Region = entry?.Region,
                    Variant = entry?.Variant,
                    MatchedAssetId = item.AssetId,
                    MatchType = item.MatchType,
                    Confidence = item.Confidence,
                    IsManualOverride = item.IsManualOverride,
                    IsMissing = item.GlossId == null,
                    Skipped = item.Skipped,
                    DurationMs = item.DurationMs,
                    ClipDurationMs = entry?.ClipDurationMs,
                    StartMs = item.StartMs,
                    EndMs = item.EndMs,
                    TimingMeasured = item.TimingMeasured,
                    Note = item.Note,
                    Hint = item.Hint,
                    Availability = availability,
                    Problem = problem,
                    Candidates = (item.CandidateIds ?? new List<Guid>())
                        .Select(c => view.Entries.GetValueOrDefault(c))
                        .Where(c => c is { IsArchived: false })
                        .Select(c => Candidate(c!))
                        .ToList(),
                });

                dto.Summary.Items++;
                if (availability == SkippedSign)
                {
                    dto.Summary.SkippedItems++;
                    continue;
                }

                confidenceSum += item.Confidence;
                confidenceCount++;
                switch (availability)
                {
                    case Ok:
                        dto.Summary.SignedItems++;
                        continue;
                    case MissingSign:
                        dto.Summary.MissingItems++;
                        break;
                    case AmbiguousSign:
                        dto.Summary.AmbiguousItems++;
                        break;
                    default:
                        dto.Summary.UnavailableItems++;
                        break;
                }

                blocked = true;
                segmentDto.Problem ??= problem;
                var key = (item.GlossId == null ? item.NormalizedText : entry?.Gloss ?? item.NormalizedText, availability);
                if (!missing.TryGetValue(key, out var word))
                {
                    missing[key] = word = new SignMissingWordDto
                    {
                        Text = item.GlossId == null ? item.SourceText : entry?.Gloss ?? item.SourceText,
                        Reason = item.Hint == SignGlossMatcher.SenseCheckHint ? SenseReason : Reason(availability),
                        Hint = item.Hint,
                    };
                }

                word.Count++;
                if (!word.Segments.Contains(row.SegmentIndex + 1)) word.Segments.Add(row.SegmentIndex + 1);
            }

            if (segment.Items.Count == 0) dto.Summary.NonSpeechSegments++;
            else if (!blocked && !segment.Skipped) dto.Summary.ReadySegments++;
            dto.Segments.Add(segmentDto);
        }

        dto.Summary.Confidence = confidenceCount == 0 ? 1 : Math.Round(confidenceSum / confidenceCount, 3);
        dto.Missing = missing.Values.OrderByDescending(m => m.Count).ThenBy(m => m.Segments.Min()).ToList();
        dto.Warnings = view.Warnings.ToList();

        if (!view.Prerequisites.RendererAvailable && renderer == SignVideo.Renderer.Clip)
            dto.RenderBlockers.Add(view.Prerequisites.RendererMessage ?? ErrorMessage(SignVideo.Errors.RendererNotConfigured)!);
        if (!view.Prerequisites.AvatarRendererAvailable && renderer == SignVideo.Renderer.Avatar)
            dto.RenderBlockers.Add(view.Prerequisites.AvatarRendererMessage ?? ErrorMessage(SignVideo.Errors.RendererNotConfigured)!);
        dto.RenderBlockers.AddRange(RenderProblems(view.Segments, view.Entries, renderer).Select(p => p.Message).Take(20));

        if (track.Status != TrackStatus.Published)
        {
            dto.PublishBlockers = PublishProblems(track, view.Segments, view.Entries, view.OutputAsset, view.Now)
                .Select(p => p.Message).Distinct().Take(20).ToList();
        }

        return dto;
    }

    private static string Hash(string text) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text))).ToLowerInvariant();
}

/// <summary>Everything <see cref="SignVideoRules.Dto"/> needs, loaded by <see cref="SignLanguageVideoReader"/>.</summary>
public sealed record SignVideoView
{
    public required Guid AssetId { get; init; }
    public PlatformSignLanguageTrack? Track { get; init; }
    public IReadOnlyList<SignSegmentState> Segments { get; init; } = Array.Empty<SignSegmentState>();
    public IReadOnlyDictionary<Guid, SignDictionaryEntry> Entries { get; init; } = new Dictionary<Guid, SignDictionaryEntry>();
    public required SignVideoPrerequisitesDto Prerequisites { get; init; }
    public PlatformAsset? OutputAsset { get; init; }
    public PlatformAsset? PublishedAsset { get; init; }
    public IReadOnlyDictionary<Guid, string> Reviewers { get; init; } = new Dictionary<Guid, string>();
    public string? CurrentCaptionFingerprint { get; init; }
    public IReadOnlyList<string> Warnings { get; init; } = Array.Empty<string>();
    public required DateTimeOffset Now { get; init; }
    public IPlatformAssetUrlSigner? Urls { get; init; }
}
