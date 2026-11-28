using System.Text.Json;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using CaptionLimits = DigiTalent.Domain.Constants.PlatformCatalog.Captions;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Rules of video captions (schema v3.11, platform_asset_captions): what a saved caption list must respect, how the
/// raw AI answer is tidied up, and how the jsonb columns are read and written.
/// </summary>
public static partial class PlatformCaptionRules
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static string Serialize(IEnumerable<CaptionCueDto> cues) =>
        JsonSerializer.Serialize(cues.Select(c => new CaptionCueDto { StartMs = c.StartMs, EndMs = c.EndMs, Text = c.Text }), Json);

    /// <summary>Cues stored in a jsonb column; an empty list when the value is missing or unreadable.</summary>
    public static List<CaptionCueDto> Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new();
        try
        {
            return JsonSerializer.Deserialize<List<CaptionCueDto>>(json, Json) ?? new();
        }
        catch (JsonException)
        {
            return new();
        }
    }

    public static bool SameCues(IReadOnlyList<CaptionCueDto> a, IReadOnlyList<CaptionCueDto> b) =>
        a.Count == b.Count && a.Zip(b).All(p => p.First.StartMs == p.Second.StartMs && p.First.EndMs == p.Second.EndMs && p.First.Text == p.Second.Text);

    /// <summary>Text as stored: line breaks kept (a cue may have two lines), spaces inside a line collapsed.</summary>
    public static string CleanText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var lines = text.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n')
            .Select(line => Spaces().Replace(line, " ").Trim())
            .Where(line => line.Length > 0);
        return string.Join("\n", lines);
    }

    /// <summary>Cues typed or edited by the Platform Admin, cleaned; throws 400 INVALID_CAPTIONS on the first problem.</summary>
    public static List<CaptionCueDto> CheckSaved(IReadOnlyList<CaptionCueDto>? cues)
    {
        if (cues == null) throw Invalid("Thiếu danh sách câu lời thoại.");
        if (cues.Count > CaptionLimits.MaxCues) throw Invalid($"Tối đa {CaptionLimits.MaxCues} câu lời thoại cho một video.");

        var result = new List<CaptionCueDto>(cues.Count);
        for (var i = 0; i < cues.Count; i++)
        {
            var cue = cues[i] ?? throw Invalid($"Câu {i + 1}: trống.");
            var label = $"Câu {i + 1}";
            var text = CleanText(cue.Text);
            if (text.Length == 0) throw Invalid($"{label}: chưa có chữ.");
            if (text.Length > CaptionLimits.MaxCueTextLength) throw Invalid($"{label}: dài quá {CaptionLimits.MaxCueTextLength} ký tự, hãy tách thành hai câu.");
            if (cue.StartMs < 0) throw Invalid($"{label}: giờ bắt đầu không được âm.");
            if (cue.EndMs <= cue.StartMs) throw Invalid($"{label}: giờ kết thúc phải sau giờ bắt đầu.");
            if (cue.EndMs - cue.StartMs > CaptionLimits.MaxCueDurationMs) throw Invalid($"{label}: hiện lâu quá {CaptionLimits.MaxCueDurationMs / 1000} giây, hãy tách thành nhiều câu.");
            if (cue.EndMs > CaptionLimits.MaxTimeMs) throw Invalid($"{label}: giờ kết thúc vượt quá 6 giờ.");
            if (i > 0 && cue.StartMs < result[i - 1].EndMs) throw Invalid($"{label}: bắt đầu trước khi câu {i} kết thúc.");
            result.Add(new CaptionCueDto { StartMs = cue.StartMs, EndMs = cue.EndMs, Text = text });
        }

        return result;
    }

    /// <summary>
    /// Tidies the raw AI answer into cues that pass <see cref="CheckSaved"/>: empty cues dropped, sorted by time,
    /// a missing end guessed from the text, overlaps cut at the next cue, cues that start together merged, long
    /// text split into readable pieces, at most <see cref="CaptionLimits.MaxCues"/> cues.
    /// </summary>
    public static List<CaptionCueDto> Normalize(IEnumerable<CaptionCueDto> raw)
    {
        var cues = raw
            .Select(c => new CaptionCueDto { StartMs = Math.Max(0, c.StartMs), EndMs = c.EndMs, Text = CleanText(c.Text) })
            .Where(c => c.Text.Length > 0 && c.StartMs < CaptionLimits.MaxTimeMs)
            .OrderBy(c => c.StartMs)
            .ThenBy(c => c.EndMs)
            .ToList();

        var result = new List<CaptionCueDto>();
        for (var i = 0; i < cues.Count; i++)
        {
            var cue = cues[i];
            var end = cue.EndMs > cue.StartMs ? cue.EndMs : cue.StartMs + ReadingTimeMs(cue.Text);
            end = Math.Min(end, Math.Min(cue.StartMs + CaptionLimits.MaxCueDurationMs, CaptionLimits.MaxTimeMs));
            if (i + 1 < cues.Count && end > cues[i + 1].StartMs) end = cues[i + 1].StartMs;
            if (end <= cue.StartMs)
            {
                // Starts together with the next cue: say both there.
                cues[i + 1].Text = cue.Text + " " + cues[i + 1].Text;
                continue;
            }

            result.AddRange(Split(cue.StartMs, end, cue.Text));
            if (result.Count >= CaptionLimits.MaxCues) break;
        }

        return result.Take(CaptionLimits.MaxCues).ToList();
    }

    /// <summary>Time a cue without an end stays on screen: about 15 characters a second, 1–7 seconds.</summary>
    private static int ReadingTimeMs(string text) => Math.Clamp(text.Length * 1000 / 15, 1000, 7000);

    private static IEnumerable<CaptionCueDto> Split(int start, int end, string text)
    {
        if (text.Length <= CaptionLimits.ReadableCueLength)
        {
            yield return new CaptionCueDto { StartMs = start, EndMs = end, Text = text };
            yield break;
        }

        var pieces = Pieces(text.Replace('\n', ' '), CaptionLimits.ReadableCueLength);
        if (end - start < pieces.Count * 200)
        {
            // Too short to show several pieces: one cue, cut to the longest text allowed.
            yield return new CaptionCueDto { StartMs = start, EndMs = end, Text = text[..Math.Min(text.Length, CaptionLimits.MaxCueTextLength)].TrimEnd() };
            yield break;
        }

        var total = pieces.Sum(p => p.Length);
        var done = 0;
        var from = start;
        for (var i = 0; i < pieces.Count; i++)
        {
            done += pieces[i].Length;
            var to = i == pieces.Count - 1 ? end : start + (int)((long)(end - start) * done / total);
            if (to <= from) to = from + 1;
            yield return new CaptionCueDto { StartMs = from, EndMs = to, Text = pieces[i] };
            from = to;
        }
    }

    /// <summary>Words grouped into pieces of at most <paramref name="max"/> characters (a longer word is cut).</summary>
    private static List<string> Pieces(string text, int max)
    {
        var pieces = new List<string>();
        var current = "";
        foreach (var word in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            var rest = word;
            while (rest.Length > max)
            {
                if (current.Length > 0) { pieces.Add(current); current = ""; }
                pieces.Add(rest[..max]);
                rest = rest[max..];
            }

            if (current.Length == 0) current = rest;
            else if (current.Length + 1 + rest.Length <= max) current += " " + rest;
            else { pieces.Add(current); current = rest; }
        }

        if (current.Length > 0) pieces.Add(current);
        return pieces;
    }

    /// <summary>A caption job still PROCESSING long after it started was lost (server stopped, worker crashed).</summary>
    public static bool IsStale(PlatformAssetCaption caption, DateTimeOffset now) =>
        caption.Status == CaptionStatus.Processing && now - caption.UpdatedAt > CaptionLimits.StaleAfter;

    public static string? ErrorMessage(string? code) => code switch
    {
        null => null,
        "AI_NOT_CONFIGURED" => "Chưa cấu hình khóa Gemini nên chưa tạo lời thoại bằng AI được.",
        "AI_KEY_REJECTED" => "Khóa Gemini bị từ chối (sai khóa hoặc hết quyền).",
        "AI_UPLOAD_FAILED" => "Không gửi được video sang Gemini. Thử lại sau ít phút.",
        "AI_VIDEO_UNREADABLE" => "Gemini không đọc được video này. Hãy kiểm tra tệp (MP4 H.264 là an toàn nhất).",
        "AI_BUSY" => "Gemini đang quá tải. Thử lại sau ít phút.",
        "AI_MODEL_UNAVAILABLE" => "Model Gemini đã cấu hình không còn dùng được với khóa này. Đặt Gemini:CaptionModel sang một model mới hơn.",
        "AI_TIMEOUT" => "AI xử lý quá lâu nên đã dừng. Thử lại, hoặc chia video thành các phần ngắn hơn.",
        "AI_BAD_RESPONSE" => "AI trả về lời thoại không đọc được. Thử tạo lại.",
        "VIDEO_FILE_MISSING" => "Không tìm thấy tệp video trong kho lưu trữ.",
        _ => "Tạo lời thoại bằng AI chưa thành công. Thử lại sau.",
    };

    public static PlatformAssetCaptionsDto Dto(Guid assetId, PlatformAssetCaption? caption, bool aiConfigured)
    {
        if (caption == null)
        {
            return new PlatformAssetCaptionsDto
            {
                AssetId = assetId, Language = CaptionLimits.Vietnamese, Status = "NONE", AiConfigured = aiConfigured,
            };
        }

        var draft = Parse(caption.DraftCues);
        var published = caption.PublishedCues == null ? null : Parse(caption.PublishedCues);
        return new PlatformAssetCaptionsDto
        {
            AssetId = assetId,
            Language = caption.Language,
            Status = caption.Status,
            Source = caption.Source,
            Model = caption.Model,
            ErrorCode = caption.ErrorCode,
            ErrorMessage = ErrorMessage(caption.ErrorCode),
            DraftCues = draft,
            PublishedCues = published,
            PublishedAt = caption.PublishedAt,
            HasUnpublishedChanges = caption.Status != CaptionStatus.Processing && draft.Count > 0 && (published == null || !SameCues(draft, published)),
            AiConfigured = aiConfigured,
            UpdatedAt = caption.UpdatedAt,
        };
    }

    private static BadRequestException Invalid(string message) => new(message, "cues", "INVALID_CAPTIONS");

    [GeneratedRegex(@"[ \t ]+")]
    private static partial Regex Spaces();
}
