using System.Globalization;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>A sign to place: its own length (clip) and the length the admin asked for (null = its own).</summary>
public sealed record SignPlanItem(int ItemIndex, int NaturalMs, int? TargetMs = null);

/// <summary>A caption sentence with the signs to show for it, in order (skipped ones left out by the caller).</summary>
public sealed record SignPlanSegment(int SegmentIndex, int StartMs, int EndMs, IReadOnlyList<SignPlanItem> Items);

/// <summary>
/// Where a sign is shown on the lesson video: [StartMs, EndMs). The clip is played <see cref="Speed"/> times faster,
/// <see cref="SourceMs"/> of it is used (less than its length = its end is cut), then its last frame is held for
/// <see cref="HoldMs"/>.
/// </summary>
public sealed record SignPlacement(int SegmentIndex, int ItemIndex, int StartMs, int EndMs, double Speed, int SourceMs, int HoldMs, bool Trimmed)
{
    public int DurationMs => EndMs - StartMs;
}

public sealed record SignTimeline(IReadOnlyList<SignPlacement> Placements, IReadOnlyList<string> Warnings);

/// <summary>
/// Puts the signs of each caption sentence on the lesson video timeline (pure, so the builder's estimate and the
/// renderer agree). Each sentence starts its signs when its caption starts and may run on into the pause before the
/// next sentence — never into it, so signs never overlap and stay in step with the speech. Too long: played up to
/// <see cref="SignVideo.MaxSpeedup"/>× faster, then the end of each sign is cut (with a warning). Too short: the
/// signer rests (the renderer shows the idle background) until the next sentence. A sign given a longer length than
/// its clip holds its last frame.
/// </summary>
public static class SignTimelinePlanner
{
    public static SignTimeline Plan(
        IEnumerable<SignPlanSegment> segments,
        int? videoDurationMs = null,
        double maxSpeedup = SignVideo.MaxSpeedup,
        int lastSentenceTailMs = SignVideo.LastSentenceTailMs)
    {
        // Sentences with nothing to sign ([nhạc nền], skipped) do not limit the signing of the sentence before them.
        var ordered = segments.Where(s => s.Items.Count > 0).OrderBy(s => s.StartMs).ThenBy(s => s.SegmentIndex).ToList();
        var placements = new List<SignPlacement>();
        var warnings = new List<string>();
        var previousEnd = 0;

        for (var k = 0; k < ordered.Count; k++)
        {
            var segment = ordered[k];
            // Signing starts with the caption (or once the previous signs end) and must end before the next caption
            // starts; the last sentence may run a little past its caption, not past the end of the video.
            var start = Math.Max(segment.StartMs, previousEnd);
            var limit = k + 1 < ordered.Count
                ? ordered[k + 1].StartMs
                : videoDurationMs is > 0
                    ? Math.Min(segment.EndMs + lastSentenceTailMs, Math.Max(videoDurationMs.Value, segment.EndMs))
                    : segment.EndMs + lastSentenceTailMs;
            var available = Math.Max(limit - start, segment.Items.Count);

            var targets = segment.Items
                .Select(i => (double)Math.Max(SignVideo.MinItemDurationMs, i.TargetMs ?? Math.Max(1, i.NaturalMs)))
                .ToList();
            var total = targets.Sum();
            if (total > available)
            {
                var scale = available / total;
                for (var i = 0; i < targets.Count; i++) targets[i] *= scale;
            }

            var cumulative = 0.0;
            var maxSpeed = 1.0;
            var trimmed = false;
            for (var i = 0; i < segment.Items.Count; i++)
            {
                var item = segment.Items[i];
                var from = start + (int)Math.Round(cumulative);
                cumulative += targets[i];
                var to = Math.Max(from + 1, start + (int)Math.Round(cumulative));
                var outMs = to - from;
                var natural = Math.Max(1, item.NaturalMs);
                double speed;
                int sourceMs;
                int holdMs;
                if (outMs >= natural)
                {
                    speed = 1;
                    sourceMs = natural;
                    holdMs = outMs - natural;
                }
                else
                {
                    speed = Math.Min((double)natural / outMs, maxSpeedup);
                    sourceMs = Math.Min(natural, (int)Math.Round(outMs * speed));
                    holdMs = 0;
                }

                var cut = sourceMs < natural - 1;
                maxSpeed = Math.Max(maxSpeed, speed);
                trimmed |= cut;
                placements.Add(new SignPlacement(segment.SegmentIndex, item.ItemIndex, from, to, Math.Round(speed, 3), sourceMs, holdMs, cut));
            }

            previousEnd = placements[^1].EndMs;
            var label = $"Câu {segment.SegmentIndex + 1}";
            if (trimmed)
            {
                warnings.Add($"{label}: ký hiệu dài hơn lời nói quá nhiều nên đã phát nhanh ×{Speed(maxSpeedup)} và cắt bớt cuối ký hiệu. Nên tách câu hoặc bỏ bớt ký hiệu.");
            }
            else if (maxSpeed > 1.01)
            {
                warnings.Add($"{label}: ký hiệu dài hơn lời nói nên được phát nhanh ×{Speed(maxSpeed)}.");
            }
        }

        return new SignTimeline(placements, warnings);
    }

    /// <summary>"1,25" — Vietnamese decimal comma, whatever the culture of the server.</summary>
    private static string Speed(double value) => value.ToString("0.0#", CultureInfo.InvariantCulture).Replace('.', ',');
}
