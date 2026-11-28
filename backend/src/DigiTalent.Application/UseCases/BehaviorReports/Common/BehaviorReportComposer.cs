using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// Phần tính toán thuần của báo cáo hành vi: số liệu từ nhật ký, phần tổng hợp bằng luật, nhật ký gửi cho AI và đối chiếu
/// các phát hiện của AI với đúng các sự kiện đã ghi (AI chỉ được dẫn chứng bằng số thứ tự sự kiện, nên mốc thời gian của
/// bằng chứng luôn là mốc thật trong nhật ký).
/// </summary>
public static class BehaviorReportComposer
{
    public const int MaxAiEvents = 300;
    public const int MaxFindings = 8;
    public const int MaxTitleChars = 120;
    public const int MaxExplanationChars = 600;
    public const int MaxSummaryChars = 1200;
    public const int MaxAdviceChars = 600;

    // Tiếng Việt giữ nguyên trong jsonb (không \uXXXX); ký tự nhạy cảm với HTML vẫn được thoát.
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Encoder = JavaScriptEncoder.Create(UnicodeRanges.All),
    };

    /// <summary>Sự kiện chỉ để mốc phiên / trạng thái: không gửi cho AI.</summary>
    private static readonly string[] NotForAi =
    {
        Statuses.ProctoringEvent.Started, Statuses.ProctoringEvent.Submitted, Statuses.ProctoringEvent.FaceCheckOn,
    };

    private static readonly string[] Away = { Statuses.ProctoringEvent.TabHidden, Statuses.ProctoringEvent.FocusLost };

    private static readonly string[] FaceAlerts =
    {
        Statuses.ProctoringEvent.FaceMissing, Statuses.ProctoringEvent.MultipleFaces, Statuses.ProctoringEvent.LookingAway,
    };

    private static readonly string[] SourceLosses =
    {
        Statuses.ProctoringEvent.ShareStopped, Statuses.ProctoringEvent.CameraStopped, Statuses.ProctoringEvent.MicStopped,
    };

    public static PulseProctoringEventDto ToDto(ProctoringEvent e) => new()
    {
        Kind = e.Kind,
        OffsetMs = e.OffsetMs,
        DurationMs = e.DurationMs,
        Detail = e.Detail,
        Flagged = Statuses.ProctoringEvent.Flagged.Contains(e.Kind),
    };

    /// <summary>Độ dài phiên: thời lượng đã ghi khi nộp, không có thì tới sự kiện cuối.</summary>
    public static long DurationOf(ProctoringSession session, IReadOnlyList<PulseProctoringEventDto> events) =>
        session.DurationMs ?? events.Select(e => e.OffsetMs + (e.DurationMs ?? 0)).DefaultIfEmpty(0).Max();

    public static BehaviorStatsDto Stats(
        IReadOnlyList<PulseProctoringEventDto> events,
        int attemptNo,
        int essayChars,
        int? choiceScore,
        int? choiceTotal)
    {
        var pastes = events
            .Where(e => e.Kind == Statuses.ProctoringEvent.Paste)
            .Select(e => Statuses.ProctoringEventDetail.ParseClipboard(e.Detail))
            .ToList();
        var away = events.Where(e => Away.Contains(e.Kind)).ToList();
        var faces = events.Where(e => FaceAlerts.Contains(e.Kind)).ToList();
        return new BehaviorStatsDto
        {
            AttemptNo = attemptNo,
            EssayChars = essayChars,
            PasteCount = pastes.Count,
            PastedChars = pastes.Sum(p => p?.Chars ?? 0),
            PastedIntoEssayChars = pastes.Where(p => p?.Place == Statuses.ProctoringEventDetail.Essay).Sum(p => p!.Value.Chars),
            LargePasteCount = pastes.Count(p => p?.Chars >= PulseProctoringRisk.LargePasteChars),
            CopyCount = events.Count(e => e.Kind == Statuses.ProctoringEvent.Copy),
            AwayCount = away.Count,
            AwayMs = away.Sum(e => e.DurationMs ?? 0),
            IdleMs = events.Where(e => e.Kind == Statuses.ProctoringEvent.Idle).Sum(e => e.DurationMs ?? 0),
            FaceAlertCount = faces.Count,
            FaceAlertMs = faces.Sum(e => e.DurationMs ?? 0),
            SourceLossCount = events.Count(e => SourceLosses.Contains(e.Kind)),
            SecondScreen = events.Any(e => e.Kind == Statuses.ProctoringEvent.SecondScreen),
            ChoiceScore = choiceScore,
            ChoiceTotal = choiceTotal,
        };
    }

    /// <summary>Phần báo cáo không cần AI: số liệu và điểm rủi ro theo luật.</summary>
    public static BehaviorReportDetails Compose(IReadOnlyList<PulseProctoringEventDto> events, long durationMs, BehaviorStatsDto stats) => new()
    {
        DurationMs = durationMs,
        Stats = stats,
        Risk = PulseProctoringRisk.Analyze(events, durationMs),
    };

    /// <summary>
    /// Nhật ký gửi cho AI, đánh số từ 1 theo thời gian. Quá <see cref="MaxAiEvents"/> sự kiện thì giữ các sự kiện đáng chú ý
    /// (và các lần bật lại nguồn ghi để AI biết khoảng mất nguồn kết thúc khi nào).
    /// </summary>
    public static (List<BehaviorAiEvent> Events, bool Truncated) AiEvents(IReadOnlyList<PulseProctoringEventDto> events)
    {
        var relevant = events
            .Where(e => !NotForAi.Contains(e.Kind))
            .OrderBy(e => e.OffsetMs)
            .ToList();
        var truncated = relevant.Count > MaxAiEvents;
        if (truncated)
        {
            relevant = relevant
                .Where(e => e.Flagged || e.Kind is Statuses.ProctoringEvent.ShareResumed
                    or Statuses.ProctoringEvent.CameraResumed or Statuses.ProctoringEvent.MicResumed)
                .Take(MaxAiEvents)
                .ToList();
        }

        return (relevant.Select((e, i) => new BehaviorAiEvent(i + 1, e.Kind, e.OffsetMs, e.DurationMs, e.Detail)).ToList(), truncated);
    }

    /// <summary>LOW | MEDIUM | HIGH, hoặc null khi AI trả một mức khác.</summary>
    public static string? NormalizeLevel(string? level)
    {
        var value = level?.Trim().ToUpperInvariant();
        return Statuses.RiskLevel.All.Contains(value) ? value : null;
    }

    /// <summary>
    /// Các phát hiện của AI đối chiếu với nhật ký đã gửi: bỏ phát hiện không dẫn được sự kiện nào có thật, khoảng thời gian
    /// lấy từ chính các sự kiện; giữ tối đa <see cref="MaxFindings"/> phát hiện nặng nhất, xếp theo thời gian.
    /// </summary>
    public static List<BehaviorFindingDto> Findings(BehaviorAiResult result, IReadOnlyList<BehaviorAiEvent> sent)
    {
        var byNumber = sent.ToDictionary(e => e.Number);
        var findings = new List<BehaviorFindingDto>();
        foreach (var finding in result.Findings)
        {
            var evidence = finding.EventNumbers
                .Distinct()
                .Where(byNumber.ContainsKey)
                .Select(n => byNumber[n])
                .OrderBy(e => e.OffsetMs)
                .ToList();
            var title = Clip(finding.Title, MaxTitleChars);
            if (evidence.Count == 0 || title.Length == 0)
            {
                continue;
            }

            var start = evidence.Min(e => e.OffsetMs);
            var end = evidence.Max(e => e.OffsetMs + (e.DurationMs ?? 0));
            findings.Add(new BehaviorFindingDto
            {
                StartMs = start,
                EndMs = Math.Max(end, start + 1000),
                Severity = NormalizeLevel(finding.Severity) ?? PulseProctoringRisk.Medium,
                Title = title,
                Explanation = Clip(finding.Explanation, MaxExplanationChars),
                Events = evidence.Select(e => new PulseProctoringEventDto
                {
                    Kind = e.Kind,
                    OffsetMs = e.OffsetMs,
                    DurationMs = e.DurationMs,
                    Detail = e.Detail,
                    Flagged = Statuses.ProctoringEvent.Flagged.Contains(e.Kind),
                }).ToList(),
            });
        }

        return findings
            .OrderByDescending(f => Array.IndexOf(Statuses.RiskLevel.All, f.Severity))
            .ThenBy(f => f.StartMs)
            .Take(MaxFindings)
            .OrderBy(f => f.StartMs)
            .ToList();
    }

    /// <summary>Vạch trên dải thời gian thu nhỏ: phát hiện của AI khi có, không thì các đoạn đáng ngờ theo luật.</summary>
    public static List<BehaviorMarkDto> Marks(BehaviorReportDetails details) =>
        details.Findings.Count > 0
            ? details.Findings.Select(f => new BehaviorMarkDto { StartMs = f.StartMs, EndMs = f.EndMs, Severity = f.Severity }).ToList()
            : details.Risk.Moments.Select(m => new BehaviorMarkDto { StartMs = m.StartMs, EndMs = m.EndMs, Severity = m.Severity }).ToList();

    /// <summary>SHA-256 (hex) của dữ liệu đã gửi cho AI.</summary>
    public static string InputHash(BehaviorAiInput input) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(input, Json))));

    public static string Serialize(BehaviorReportDetails details) => JsonSerializer.Serialize(details, Json);

    /// <summary>Nội dung đã lưu; dòng đọc không được thì coi như báo cáo trống (phân tích lại sẽ ghi đè).</summary>
    public static BehaviorReportDetails Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new BehaviorReportDetails();
        }

        try
        {
            return JsonSerializer.Deserialize<BehaviorReportDetails>(json, Json) ?? new BehaviorReportDetails();
        }
        catch (JsonException)
        {
            return new BehaviorReportDetails();
        }
    }

    public static string Clip(string? text, int max)
    {
        var value = (text ?? string.Empty).Trim();
        return value.Length <= max ? value : value[..max].TrimEnd() + "…";
    }
}
