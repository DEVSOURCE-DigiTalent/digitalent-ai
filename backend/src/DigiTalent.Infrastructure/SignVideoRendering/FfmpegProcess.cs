using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace DigiTalent.Infrastructure.SignVideoRendering;

/// <summary>Exit code and the end of stderr of a finished FFmpeg / ffprobe command.</summary>
public sealed record FfmpegResult(int ExitCode, string StandardError, string StandardOutput);

/// <summary>What ffprobe says about a video file.</summary>
/// <param name="FrameRate">Frame rate of the first video stream as ffprobe gives it ("30000/1001"), null when unknown.</param>
public sealed record MediaInfo(int DurationMs, int Width, int Height, bool HasAudio, string? FrameRate = null);

/// <summary>The tool could not be started (not installed, wrong path).</summary>
public sealed class FfmpegMissingException : Exception
{
    public FfmpegMissingException(string tool, Exception inner) : base($"{tool} could not be started.", inner)
    {
    }
}

/// <summary>
/// Runs FFmpeg tools without a shell: every argument goes through <see cref="ProcessStartInfo.ArgumentList"/>, so a
/// file name or a gloss can never become part of a command line. Kills the process tree on timeout or cancellation.
/// </summary>
public static class FfmpegProcess
{
    private const int MaxCapturedChars = 8000;

    public static async Task<FfmpegResult> RunAsync(
        string tool,
        IReadOnlyList<string> arguments,
        string workingDirectory,
        TimeSpan timeout,
        CancellationToken cancellationToken,
        Action<string>? onOutputLine = null)
    {
        var start = new ProcessStartInfo
        {
            FileName = tool,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
        };
        foreach (var argument in arguments) start.ArgumentList.Add(argument);

        using var process = new Process { StartInfo = start, EnableRaisingEvents = true };
        var stderr = new StringBuilder();
        var stdout = new StringBuilder();
        process.ErrorDataReceived += (_, e) => Append(stderr, e.Data);
        process.OutputDataReceived += (_, e) =>
        {
            if (e.Data == null) return;
            onOutputLine?.Invoke(e.Data);
            Append(stdout, e.Data);
        };

        try
        {
            if (!process.Start()) throw new FfmpegMissingException(tool, new InvalidOperationException("Process.Start returned false."));
        }
        catch (Win32Exception ex)
        {
            throw new FfmpegMissingException(tool, ex);
        }

        process.BeginErrorReadLine();
        process.BeginOutputReadLine();
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        deadline.CancelAfter(timeout);
        try
        {
            await process.WaitForExitAsync(deadline.Token);
        }
        catch (OperationCanceledException)
        {
            Kill(process);
            if (cancellationToken.IsCancellationRequested) throw;
            throw new TimeoutException($"{Path.GetFileName(tool)} ran longer than {timeout}.");
        }

        // Let the asynchronous readers flush the last lines.
        process.WaitForExit();
        lock (stderr)
        lock (stdout)
        {
            return new FfmpegResult(process.ExitCode, stderr.ToString(), stdout.ToString());
        }
    }

    /// <summary>Duration, size and audio of a file; null when ffprobe cannot read it as a video.</summary>
    public static async Task<MediaInfo?> ProbeAsync(string ffprobe, string file, string workingDirectory, TimeSpan timeout, CancellationToken cancellationToken)
    {
        var result = await RunAsync(ffprobe, new[]
        {
            "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,duration,avg_frame_rate,r_frame_rate", "-of", "json", file,
        }, workingDirectory, timeout, cancellationToken);
        return result.ExitCode == 0 ? ParseProbe(result.StandardOutput) : null;
    }

    /// <summary>Reads the JSON of ffprobe (format duration, first video stream size, audio presence).</summary>
    public static MediaInfo? ParseProbe(string json)
    {
        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;
            int width = 0, height = 0;
            var hasAudio = false;
            string? frameRate = null;
            double? streamSeconds = null;
            if (root.TryGetProperty("streams", out var streams))
            {
                foreach (var stream in streams.EnumerateArray())
                {
                    var type = stream.TryGetProperty("codec_type", out var t) ? t.GetString() : null;
                    if (type == "audio") hasAudio = true;
                    if (type != "video" || width > 0) continue;
                    width = stream.TryGetProperty("width", out var w) ? w.GetInt32() : 0;
                    height = stream.TryGetProperty("height", out var h) ? h.GetInt32() : 0;
                    streamSeconds = Seconds(stream);
                    frameRate = Rate(stream, "avg_frame_rate") ?? Rate(stream, "r_frame_rate");
                }
            }

            var seconds = root.TryGetProperty("format", out var format) ? Seconds(format) : null;
            seconds ??= streamSeconds;
            if (width <= 0 || height <= 0 || seconds is not > 0) return null;
            return new MediaInfo((int)Math.Round(seconds.Value * 1000), width, height, hasAudio, frameRate);
        }
        catch (Exception ex) when (ex is JsonException or InvalidOperationException or FormatException)
        {
            return null;
        }
    }

    /// <summary>"30000/1001" when it is a real rate (ffprobe writes "0/0" when it does not know).</summary>
    private static string? Rate(JsonElement stream, string name) =>
        stream.TryGetProperty(name, out var r) && r.ValueKind == JsonValueKind.String && r.GetString() is { } text
        && FrameRates.Parse(text) is > 0 ? text : null;

    private static double? Seconds(JsonElement element) =>
        element.TryGetProperty("duration", out var d) && d.ValueKind == JsonValueKind.String
        && double.TryParse(d.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var value)
            ? value
            : null;

    private static void Append(StringBuilder buffer, string? line)
    {
        if (line == null) return;
        lock (buffer)
        {
            buffer.AppendLine(line);
            if (buffer.Length > MaxCapturedChars) buffer.Remove(0, buffer.Length - MaxCapturedChars);
        }
    }

    private static void Kill(Process process)
    {
        try
        {
            if (!process.HasExited) process.Kill(entireProcessTree: true);
        }
        catch (Exception ex) when (ex is InvalidOperationException or Win32Exception or NotSupportedException)
        {
            // Already gone.
        }
    }
}
