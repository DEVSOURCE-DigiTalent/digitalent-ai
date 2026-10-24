using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Điểm rủi ro gian lận của một phiên làm bài có giám sát, tổng hợp từ nhật ký giám sát (canonical v3.4): rời tab / cửa sổ,
/// mất một nguồn ghi và các khoảng khuôn mặt bất thường do trình duyệt tự nhận diện (vắng mặt, nhiều người, nhìn ra ngoài).
/// Chỉ để người chấm biết nên xem đoạn nào trước — không tự đánh trượt bài.
/// </summary>
public static class PulseProctoringRisk
{
    public const string Low = "LOW";
    public const string Medium = "MEDIUM";
    public const string High = "HIGH";

    /// <summary>Nhận diện khuôn mặt chạy suốt phiên / không chạy / chạy một phần / phiên không có thông tin (bài cũ).</summary>
    public const string FaceCheckOn = "ON";
    public const string FaceCheckOff = "OFF";
    public const string FaceCheckPartial = "PARTIAL";
    public const string FaceCheckNone = "NONE";

    public const int MediumFrom = 20;
    public const int HighFrom = 50;
    /// <summary>Hai sự kiện cách nhau không quá khoảng này được gộp thành một điểm đáng ngờ.</summary>
    public const long MergeGapMs = 10_000;
    public const int MaxMoments = 20;

    /// <summary>
    /// Điểm của mỗi loại: mỗi lần + mỗi 10 giây kéo dài (tối đa 3 lần điểm gốc cho một lần), tổng một loại không quá Cap.
    /// </summary>
    private sealed record Weight(int PerEvent, int PerTenSeconds, int Cap, string Severity);

    private static readonly Dictionary<string, Weight> Weights = new()
    {
        [Statuses.ProctoringEvent.MultipleFaces] = new(15, 3, 40, High),
        [Statuses.ProctoringEvent.ShareStopped] = new(10, 2, 25, High),
        [Statuses.ProctoringEvent.CameraStopped] = new(10, 2, 25, High),
        [Statuses.ProctoringEvent.TabHidden] = new(6, 2, 30, Medium),
        [Statuses.ProctoringEvent.FaceMissing] = new(5, 2, 30, Medium),
        [Statuses.ProctoringEvent.MicStopped] = new(5, 1, 15, Medium),
        [Statuses.ProctoringEvent.FocusLost] = new(3, 1, 15, Low),
        [Statuses.ProctoringEvent.LookingAway] = new(3, 1, 20, Low),
    };

    /// <summary>Sự kiện bật lại nguồn ghi khép khoảng mất nguồn tương ứng.</summary>
    private static readonly Dictionary<string, string> ResumedBy = new()
    {
        [Statuses.ProctoringEvent.ShareStopped] = Statuses.ProctoringEvent.ShareResumed,
        [Statuses.ProctoringEvent.CameraStopped] = Statuses.ProctoringEvent.CameraResumed,
        [Statuses.ProctoringEvent.MicStopped] = Statuses.ProctoringEvent.MicResumed,
    };

    private static readonly string[] SeverityOrder = { Low, Medium, High };

    private sealed record Scored(string Kind, long StartMs, long EndMs, int Points, string Severity);

    /// <param name="events">Nhật ký của phiên, theo thứ tự thời gian.</param>
    /// <param name="totalMs">Độ dài phiên (ms) — khép các khoảng mất nguồn chưa được bật lại.</param>
    public static PulseProctoringRiskDto Analyze(IReadOnlyList<PulseProctoringEventDto> events, long totalMs)
    {
        var ordered = events.OrderBy(e => e.OffsetMs).ToList();
        var end = Math.Max(totalMs, ordered.Count == 0 ? 0 : ordered.Max(e => e.OffsetMs + (e.DurationMs ?? 0)));

        var scored = new List<Scored>();
        for (var i = 0; i < ordered.Count; i++)
        {
            var e = ordered[i];
            if (!Weights.TryGetValue(e.Kind, out var weight))
            {
                continue;
            }

            var duration = e.DurationMs ?? DurationUntilResumed(ordered, i, end);
            var points = weight.PerEvent + Math.Min(weight.PerEvent * 2, weight.PerTenSeconds * (int)(duration / 10_000));
            scored.Add(new Scored(e.Kind, e.OffsetMs, e.OffsetMs + Math.Max(1000, duration), points, weight.Severity));
        }

        var factors = scored
            .GroupBy(s => s.Kind)
            .Select(g => new PulseRiskFactorDto
            {
                Kind = g.Key,
                Count = g.Count(),
                TotalMs = g.Sum(s => s.EndMs - s.StartMs),
                Points = Math.Min(Weights[g.Key].Cap, g.Sum(s => s.Points)),
            })
            .OrderByDescending(f => f.Points).ThenBy(f => f.Kind)
            .ToList();
        var score = Math.Min(100, factors.Sum(f => f.Points));

        return new PulseProctoringRiskDto
        {
            Score = score,
            Level = score >= HighFrom ? High : score >= MediumFrom ? Medium : Low,
            FaceCheck = FaceCheckOf(ordered),
            Factors = factors,
            Moments = MomentsOf(scored),
        };
    }

    private static long DurationUntilResumed(List<PulseProctoringEventDto> ordered, int index, long end)
    {
        var e = ordered[index];
        if (!ResumedBy.TryGetValue(e.Kind, out var resumed))
        {
            return 0;
        }

        var back = ordered.Skip(index + 1).FirstOrDefault(x => x.Kind == resumed);
        return Math.Max(0, (back?.OffsetMs ?? end) - e.OffsetMs);
    }

    private static string FaceCheckOf(List<PulseProctoringEventDto> events)
    {
        var on = events.Any(e => e.Kind == Statuses.ProctoringEvent.FaceCheckOn);
        var off = events.Any(e => e.Kind == Statuses.ProctoringEvent.FaceCheckOff);
        return (on, off) switch
        {
            (true, false) => FaceCheckOn,
            (false, true) => FaceCheckOff,
            (true, true) => FaceCheckPartial,
            _ => FaceCheckNone,
        };
    }

    /// <summary>Gộp các sự kiện sát nhau thành điểm đáng ngờ; giữ các điểm nặng nhất, trả theo thời gian.</summary>
    private static List<PulseRiskMomentDto> MomentsOf(List<Scored> scored)
    {
        var moments = new List<PulseRiskMomentDto>();
        PulseRiskMomentDto? current = null;
        foreach (var s in scored.OrderBy(s => s.StartMs))
        {
            if (current != null && s.StartMs <= current.EndMs + MergeGapMs)
            {
                current.EndMs = Math.Max(current.EndMs, s.EndMs);
                current.Points = Math.Min(100, current.Points + s.Points);
                current.EventCount++;
                if (!current.Kinds.Contains(s.Kind)) current.Kinds.Add(s.Kind);
                if (Array.IndexOf(SeverityOrder, s.Severity) > Array.IndexOf(SeverityOrder, current.Severity)) current.Severity = s.Severity;
                continue;
            }

            current = new PulseRiskMomentDto
            {
                StartMs = s.StartMs,
                EndMs = s.EndMs,
                Points = s.Points,
                Severity = s.Severity,
                EventCount = 1,
                Kinds = new List<string> { s.Kind },
            };
            moments.Add(current);
        }

        return moments
            .OrderByDescending(m => m.Points).ThenBy(m => m.StartMs)
            .Take(MaxMoments)
            .OrderBy(m => m.StartMs)
            .ToList();
    }
}

/// <summary>Điểm rủi ro gian lận của phiên (0–100) và các đoạn nên xem.</summary>
public class PulseProctoringRiskDto
{
    public int Score { get; set; }
    /// <summary>LOW (&lt; 20) | MEDIUM (&lt; 50) | HIGH.</summary>
    public string Level { get; set; } = PulseProctoringRisk.Low;
    /// <summary>ON | OFF | PARTIAL | NONE — nhận diện khuôn mặt trên trình duyệt có chạy trong phiên không.</summary>
    public string FaceCheck { get; set; } = PulseProctoringRisk.FaceCheckNone;
    public List<PulseRiskFactorDto> Factors { get; set; } = new();
    public List<PulseRiskMomentDto> Moments { get; set; } = new();
}

/// <summary>Đóng góp của một loại sự kiện vào điểm rủi ro.</summary>
public class PulseRiskFactorDto
{
    public string Kind { get; set; } = string.Empty;
    public int Count { get; set; }
    public long TotalMs { get; set; }
    public int Points { get; set; }
}

/// <summary>Một điểm đáng ngờ trên dòng thời gian của phiên: người chấm bấm vào để tua bản ghi tới.</summary>
public class PulseRiskMomentDto
{
    public long StartMs { get; set; }
    public long EndMs { get; set; }
    public int Points { get; set; }
    /// <summary>LOW | MEDIUM | HIGH — mức nặng nhất trong đoạn.</summary>
    public string Severity { get; set; } = PulseProctoringRisk.Low;
    public int EventCount { get; set; }
    public List<string> Kinds { get; set; } = new();
}
