using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Infrastructure.AI;

/// <summary>
/// Captions of a lesson video by Gemini (docs/specs/2026-11-24-ai-video-captions.md). A video may be up to 500 MB, too
/// big to send inline, so it goes through the Files API: resumable upload → wait until the file is ACTIVE →
/// generateContent with the file and a JSON schema → the file is deleted. Same key as the other Gemini features
/// (<see cref="GeminiService.ResolveApiKey"/>); models: see the constructor.
/// </summary>
public sealed class GeminiCaptionTranscriber : ICaptionTranscriber
{
    private const string Api = "https://generativelanguage.googleapis.com";
    private const string DefaultModel = "gemini-3.5-flash";
    private const string LegacyModel = "gemini-2.5-flash";
    private static readonly TimeSpan UploadTimeout = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan ProcessingTimeout = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan GenerateTimeout = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan PollEvery = TimeSpan.FromSeconds(3);

    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly IReadOnlyList<string> _models;
    private readonly ILogger<GeminiCaptionTranscriber> _logger;

    public GeminiCaptionTranscriber(HttpClient http, IConfiguration config, ILogger<GeminiCaptionTranscriber> logger)
    {
        _http = http;
        _apiKey = GeminiService.ResolveApiKey(config);
        // Google retires models for new keys (404 "no longer available"): every model answering 404 hands over to the
        // next one, ending with the assistant's model (same key) and current defaults.
        var assistantModel = string.IsNullOrWhiteSpace(config["Assistant:Provider"])
            || config["Assistant:Provider"]!.Equals("Gemini", StringComparison.OrdinalIgnoreCase)
            ? config["Assistant:Model"]
            : null;
        _models = new[] { config["Gemini:CaptionModel"], config["Gemini:Model"], assistantModel, DefaultModel, LegacyModel }
            .Where(m => !string.IsNullOrWhiteSpace(m))
            .Select(m => m!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<CaptionTranscript> TranscribeAsync(CaptionMediaFile media, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured) throw new CaptionTranscriptionException("AI_NOT_CONFIGURED", "Gemini API key is not set.");

        var file = await UploadAsync(media, cancellationToken);
        try
        {
            file = await WaitUntilActiveAsync(file, cancellationToken);
            var (answer, model) = await GenerateAsync(file, media.ContentType, cancellationToken);
            return new CaptionTranscript(ParseAnswer(answer), model);
        }
        finally
        {
            await DeleteQuietlyAsync(file.Name);
        }
    }

    // ----- Files API ---------------------------------------------------------------------------

    private sealed record GeminiFile(string Name, string Uri, string State);

    private async Task<GeminiFile> UploadAsync(CaptionMediaFile media, CancellationToken cancellationToken)
    {
        using var timeout = Linked(cancellationToken, UploadTimeout);
        try
        {
            using var start = new HttpRequestMessage(HttpMethod.Post, $"{Api}/upload/v1beta/files")
            {
                Content = JsonContent.Create(new { file = new { display_name = Truncate(media.FileName, 120) } }),
            };
            start.Headers.Add("x-goog-api-key", _apiKey);
            start.Headers.Add("X-Goog-Upload-Protocol", "resumable");
            start.Headers.Add("X-Goog-Upload-Command", "start");
            start.Headers.Add("X-Goog-Upload-Header-Content-Length", media.SizeBytes.ToString(CultureInfo.InvariantCulture));
            start.Headers.Add("X-Goog-Upload-Header-Content-Type", media.ContentType);
            using var started = await _http.SendAsync(start, timeout.Token);
            await EnsureUploadOkAsync(started, "start", timeout.Token);
            var uploadUrl = started.Headers.TryGetValues("X-Goog-Upload-URL", out var values) ? values.FirstOrDefault() : null;
            if (string.IsNullOrWhiteSpace(uploadUrl))
            {
                throw new CaptionTranscriptionException("AI_UPLOAD_FAILED", "Gemini gave no upload URL.");
            }

            using var body = new StreamContent(media.Content, 1 << 20);
            body.Headers.ContentLength = media.SizeBytes;
            body.Headers.ContentType = new MediaTypeHeaderValue(media.ContentType);
            using var upload = new HttpRequestMessage(HttpMethod.Post, uploadUrl) { Content = body };
            upload.Headers.Add("X-Goog-Upload-Offset", "0");
            upload.Headers.Add("X-Goog-Upload-Command", "upload, finalize");
            using var uploaded = await _http.SendAsync(upload, timeout.Token);
            await EnsureUploadOkAsync(uploaded, "upload", timeout.Token);
            var json = await uploaded.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: timeout.Token);
            return ReadFile(json?["file"]) ?? throw new CaptionTranscriptionException("AI_UPLOAD_FAILED", "Gemini returned no file.");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new CaptionTranscriptionException("AI_TIMEOUT", "Uploading the video to Gemini took too long.");
        }
        catch (HttpRequestException ex)
        {
            throw new CaptionTranscriptionException("AI_UPLOAD_FAILED", "Uploading the video to Gemini failed.", ex);
        }
    }

    private async Task<GeminiFile> WaitUntilActiveAsync(GeminiFile file, CancellationToken cancellationToken)
    {
        using var timeout = Linked(cancellationToken, ProcessingTimeout);
        try
        {
            while (file.State != "ACTIVE")
            {
                if (file.State == "FAILED")
                {
                    throw new CaptionTranscriptionException("AI_VIDEO_UNREADABLE", "Gemini could not process the video.");
                }

                await Task.Delay(PollEvery, timeout.Token);
                using var request = new HttpRequestMessage(HttpMethod.Get, $"{Api}/v1beta/{file.Name}");
                request.Headers.Add("x-goog-api-key", _apiKey);
                using var response = await _http.SendAsync(request, timeout.Token);
                if (!response.IsSuccessStatusCode) continue; // a blip while polling: ask again
                file = ReadFile(await response.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: timeout.Token)) ?? file;
            }

            return file;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new CaptionTranscriptionException("AI_TIMEOUT", "Gemini took too long to process the video.");
        }
    }

    private async Task DeleteQuietlyAsync(string name)
    {
        try
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var request = new HttpRequestMessage(HttpMethod.Delete, $"{Api}/v1beta/{name}");
            request.Headers.Add("x-goog-api-key", _apiKey);
            using var _ = await _http.SendAsync(request, timeout.Token);
        }
        catch (Exception ex)
        {
            // Gemini removes uploaded files after 48 hours anyway.
            _logger.LogInformation(ex, "Could not delete Gemini file {File}", name);
        }
    }

    private static GeminiFile? ReadFile(JsonNode? node)
    {
        var name = node?["name"]?.GetValue<string>();
        var uri = node?["uri"]?.GetValue<string>();
        return string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(uri)
            ? null
            : new GeminiFile(name, uri, node?["state"]?.GetValue<string>() ?? "PROCESSING");
    }

    private async Task EnsureUploadOkAsync(HttpResponseMessage response, string step, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode) return;
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogWarning("Gemini file {Step} returned {Status}: {Body}", step, (int)response.StatusCode, Truncate(body, 500));
        throw response.StatusCode switch
        {
            HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden => new CaptionTranscriptionException("AI_KEY_REJECTED", "Gemini refused the key."),
            HttpStatusCode.TooManyRequests or HttpStatusCode.ServiceUnavailable => new CaptionTranscriptionException("AI_BUSY", "Gemini is busy."),
            _ => new CaptionTranscriptionException("AI_UPLOAD_FAILED", $"Gemini file {step} failed ({(int)response.StatusCode})."),
        };
    }

    // ----- generateContent ---------------------------------------------------------------------

    /// <summary>The instructions: Vietnamese captions for deaf and hard-of-hearing learners (SDH).</summary>
    public const string Prompt =
        "Bạn làm phụ đề tiếng Việt cho người khiếm thính (phụ đề có mô tả âm thanh) cho một video bài giảng về năng lực số. "
        + "Nghe toàn bộ âm thanh của video và viết phụ đề theo các quy tắc:\n"
        + "1. Chép đúng lời người nói, không tóm tắt. Giữ nguyên thuật ngữ và tên công cụ như người nói (Excel, Google Sheets, ChatGPT, email…). "
        + "Bỏ từ đệm vô nghĩa (ờ, à, ừm) và chỗ nói lắp.\n"
        + "2. Mỗi câu phụ đề tối đa 2 dòng, khoảng 84 ký tự, hiện từ 1 đến 7 giây; ngắt ở chỗ ngắt tự nhiên của câu nói.\n"
        + "3. Âm thanh có ý nghĩa mà không phải lời nói ghi trong ngoặc vuông, ví dụ [nhạc nền], [tiếng chuông điện thoại], [tiếng vỗ tay], [cười]. "
        + "Không ghi tiếng ồn nền không quan trọng.\n"
        + "4. Chỉ khi có từ hai người nói trở lên: đầu câu của người vừa đổi lượt ghi vai trò trong ngoặc tròn, ví dụ (Giảng viên), (Học viên); không rõ thì (Người nói 2).\n"
        + "5. Câu nói hoàn toàn bằng tiếng nước ngoài thì dịch sang tiếng Việt; từ nước ngoài xen trong câu tiếng Việt thì giữ nguyên.\n"
        + "6. start và end là mốc thời gian tính từ đầu video, dạng MM:SS.mmm (video dài hơn 1 giờ dùng HH:MM:SS.mmm), "
        + "khớp lúc lời bắt đầu và kết thúc; các câu xếp theo thời gian, không chồng lên nhau.\n"
        + "7. Không mô tả hình ảnh trên màn hình, chỉ phụ đề cho âm thanh.\n"
        + "8. Video không có lời nói: hasSpeech = false, cues chỉ gồm các âm thanh đáng chú ý (có thể là mảng rỗng).\n"
        + "Trả về JSON đúng cấu trúc đã cho.";

    private static readonly JsonObject Schema = JsonNode.Parse("""
        {
          "type": "OBJECT",
          "properties": {
            "hasSpeech": { "type": "BOOLEAN" },
            "cues": {
              "type": "ARRAY",
              "items": {
                "type": "OBJECT",
                "properties": {
                  "start": { "type": "STRING" },
                  "end": { "type": "STRING" },
                  "text": { "type": "STRING" }
                },
                "required": ["start", "end", "text"],
                "propertyOrdering": ["start", "end", "text"]
              }
            }
          },
          "required": ["hasSpeech", "cues"],
          "propertyOrdering": ["hasSpeech", "cues"]
        }
        """)!.AsObject();

    private async Task<(string Answer, string Model)> GenerateAsync(GeminiFile file, string contentType, CancellationToken cancellationToken)
    {
        var lastStatus = 0;
        foreach (var model in _models)
        {
            // Low media resolution: far fewer tokens per frame; only the sound matters for captions.
            var lowResolution = true;
            for (var attempt = 0; attempt < 3; attempt++)
            {
                using var timeout = Linked(cancellationToken, GenerateTimeout);
                HttpResponseMessage response;
                try
                {
                    using var request = new HttpRequestMessage(HttpMethod.Post, $"{Api}/v1beta/models/{Uri.EscapeDataString(model)}:generateContent")
                    {
                        Content = JsonContent.Create(Request(file, contentType, lowResolution)),
                    };
                    request.Headers.Add("x-goog-api-key", _apiKey);
                    response = await _http.SendAsync(request, timeout.Token);
                }
                catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
                {
                    throw new CaptionTranscriptionException("AI_TIMEOUT", "Gemini took too long to answer.");
                }

                using (response)
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: timeout.Token);
                        var text = json?["candidates"]?[0]?["content"]?["parts"]?.AsArray()
                            .Select(p => p?["text"]?.GetValue<string>())
                            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));
                        if (string.IsNullOrWhiteSpace(text))
                        {
                            var reason = json?["candidates"]?[0]?["finishReason"]?.GetValue<string>() ?? json?["promptFeedback"]?["blockReason"]?.GetValue<string>();
                            _logger.LogWarning("Gemini model {Model} gave no caption text (reason {Reason})", model, reason);
                            throw new CaptionTranscriptionException("AI_BAD_RESPONSE", "Gemini returned no captions.");
                        }

                        return (text, model);
                    }

                    lastStatus = (int)response.StatusCode;
                    var body = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogWarning("Gemini captions model {Model} attempt {Attempt} returned {Status}: {Body}", model, attempt + 1, lastStatus, Truncate(body, 500));
                    if (lastStatus is 401 or 403) throw new CaptionTranscriptionException("AI_KEY_REJECTED", "Gemini refused the key.");
                    if (lastStatus == 400 && lowResolution)
                    {
                        lowResolution = false; // a model without mediaResolution support: ask again without it
                        continue;
                    }

                    if (lastStatus is 429 or 500 or 503 && attempt < 2)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(3 * (attempt + 1)), cancellationToken);
                        continue;
                    }

                    break; // 400/404 or still failing: next model
                }
            }
        }

        throw lastStatus switch
        {
            429 or 503 => new CaptionTranscriptionException("AI_BUSY", "Gemini is busy."),
            404 => new CaptionTranscriptionException("AI_MODEL_UNAVAILABLE", $"None of the Gemini models ({string.Join(", ", _models)}) is available to this key."),
            _ => new CaptionTranscriptionException("AI_FAILED", $"No Gemini model could caption the video ({lastStatus})."),
        };
    }

    private static JsonObject Request(GeminiFile file, string contentType, bool lowResolution)
    {
        var config = new JsonObject
        {
            ["responseMimeType"] = "application/json",
            ["responseSchema"] = Schema.DeepClone(),
        };
        if (lowResolution) config["mediaResolution"] = "MEDIA_RESOLUTION_LOW";

        return new JsonObject
        {
            ["contents"] = new JsonArray
            {
                new JsonObject
                {
                    ["role"] = "user",
                    ["parts"] = new JsonArray
                    {
                        new JsonObject { ["fileData"] = new JsonObject { ["mimeType"] = contentType, ["fileUri"] = file.Uri } },
                        new JsonObject { ["text"] = Prompt },
                    },
                },
            },
            ["generationConfig"] = config,
        };
    }

    // ----- Answer ------------------------------------------------------------------------------

    /// <summary>
    /// Cues of the JSON answer ({ hasSpeech, cues: [{ start, end, text }] }, or a bare array). Times may be "MM:SS.mmm",
    /// "HH:MM:SS.mmm", "SS.mmm" or numbers of seconds; a cue without a readable start is dropped, a missing end is
    /// guessed later by <see cref="PlatformCaptionRules.Normalize"/>.
    /// </summary>
    public static List<CaptionCueDto> ParseAnswer(string answer)
    {
        JsonNode? root;
        try
        {
            root = JsonNode.Parse(TrimCodeFences(answer));
        }
        catch (JsonException ex)
        {
            throw new CaptionTranscriptionException("AI_BAD_RESPONSE", "The captions are not valid JSON.", ex);
        }

        var cues = root switch
        {
            JsonArray array => array,
            JsonObject obj when obj["cues"] is JsonArray array => array,
            JsonObject obj when obj["cues"] == null && obj["hasSpeech"] != null => new JsonArray(),
            _ => throw new CaptionTranscriptionException("AI_BAD_RESPONSE", "The captions have no cue list."),
        };

        var result = new List<CaptionCueDto>();
        foreach (var node in cues.OfType<JsonObject>())
        {
            var start = ParseTime(node["start"]);
            if (start == null) continue;
            result.Add(new CaptionCueDto
            {
                StartMs = start.Value,
                EndMs = ParseTime(node["end"]) ?? 0,
                Text = node["text"] is JsonValue text && text.TryGetValue<string>(out var value) ? value : string.Empty,
            });
        }

        return result;
    }

    /// <summary>Milliseconds of "HH:MM:SS.mmm", "MM:SS.mmm", "SS.mmm" (comma accepted) or a number of seconds.</summary>
    public static int? ParseTime(JsonNode? node)
    {
        if (node is not JsonValue value) return null;
        if (value.TryGetValue<double>(out var seconds)) return ToMs(seconds);
        return value.TryGetValue<string>(out var text) ? ParseTime(text) : null;
    }

    public static int? ParseTime(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var parts = text.Trim().Replace(',', '.').Split(':');
        if (parts.Length > 3) return null;
        if (!double.TryParse(parts[^1], NumberStyles.Float, CultureInfo.InvariantCulture, out var total) || total < 0) return null;
        var multiplier = 60;
        for (var i = parts.Length - 2; i >= 0; i--)
        {
            if (!int.TryParse(parts[i], NumberStyles.None, CultureInfo.InvariantCulture, out var unit)) return null;
            total += unit * multiplier;
            multiplier *= 60;
        }

        return ToMs(total);
    }

    private static int? ToMs(double seconds) =>
        seconds < 0 || double.IsNaN(seconds) || seconds > int.MaxValue / 1000.0 ? null : (int)Math.Round(seconds * 1000);

    private static string TrimCodeFences(string text)
    {
        var trimmed = text.Trim();
        if (!trimmed.StartsWith("```", StringComparison.Ordinal)) return trimmed;
        var firstNewline = trimmed.IndexOf('\n');
        var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
        return firstNewline >= 0 && lastFence > firstNewline ? trimmed[(firstNewline + 1)..lastFence].Trim() : trimmed;
    }

    private static CancellationTokenSource Linked(CancellationToken cancellationToken, TimeSpan after)
    {
        var source = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        source.CancelAfter(after);
        return source;
    }

    private static string Truncate(string text, int max) => text.Length <= max ? text : text[..max];
}
