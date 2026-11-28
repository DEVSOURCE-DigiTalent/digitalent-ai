using DigiTalent.Application.UseCases.Platform.Catalog;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// AI speech-to-text for the captions of a lesson video (docs/specs/2026-11-24-ai-video-captions.md). Gemini today
/// (Infrastructure/AI/GeminiCaptionTranscriber); another service can replace it without touching the use cases.
/// </summary>
public interface ICaptionTranscriber
{
    /// <summary>An API key is set, so a transcription can be asked for.</summary>
    bool IsConfigured { get; }

    /// <summary>
    /// Vietnamese captions of the video, with sounds that are not speech in square brackets. The cues are raw:
    /// <see cref="PlatformCaptionRules.Normalize"/> puts them in order and splits long ones. Throws
    /// <see cref="CaptionTranscriptionException"/> when the video could not be transcribed.
    /// </summary>
    Task<CaptionTranscript> TranscribeAsync(CaptionMediaFile media, CancellationToken cancellationToken = default);
}

/// <param name="Content">The video bytes, read once from the start.</param>
public sealed record CaptionMediaFile(Stream Content, long SizeBytes, string ContentType, string FileName);

public sealed record CaptionTranscript(IReadOnlyList<CaptionCueDto> Cues, string Model);

/// <summary>A transcription that failed for a known reason; <see cref="Code"/> goes to platform_asset_captions.error_code.</summary>
public sealed class CaptionTranscriptionException : Exception
{
    public CaptionTranscriptionException(string code, string message, Exception? inner = null) : base(message, inner)
    {
        Code = code;
    }

    public string Code { get; }
}

/// <summary>
/// Runs AI caption jobs outside the request (Infrastructure: in-process queue + background worker). Jobs still
/// PROCESSING when the server stops are started again when it starts.
/// </summary>
public interface ICaptionJobQueue
{
    void Enqueue(Guid captionId);
}
