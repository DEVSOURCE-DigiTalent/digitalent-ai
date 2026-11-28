using System.Diagnostics;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.SignVideoRendering;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DigiTalent.Tests.Platform;

/// <summary>A test that needs FFmpeg on the machine; skipped (with the reason) when ffmpeg/ffprobe are missing.</summary>
public sealed class FfmpegFactAttribute : FactAttribute
{
    private static readonly Lazy<bool> Installed = new(() =>
    {
        foreach (var tool in new[] { "ffmpeg", "ffprobe" })
        {
            try
            {
                using var process = Process.Start(new ProcessStartInfo(tool, "-hide_banner -version")
                {
                    RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true,
                });
                if (process == null) return false;
                process.StandardOutput.ReadToEnd();
                if (!process.WaitForExit(15_000) || process.ExitCode != 0) return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        return true;
    });

    public FfmpegFactAttribute()
    {
        if (!Installed.Value) Skip = "FFmpeg/ffprobe không có trên máy chạy test: cài FFmpeg để chạy test dựng video thật.";
    }
}

/// <summary>
/// The clip renderer with the real FFmpeg (category Ffmpeg): synthetic clips are joined on a caption timeline and the
/// output is checked — length of the lesson video, lesson sound kept, signer window where it should be, rest
/// background between sentences, track-only and full-screen modes, a broken clip reported.
/// </summary>
[Trait("Category", "Ffmpeg")]
public sealed class ClipSequenceRendererTests : IDisposable
{
    private readonly string _folder = Path.Combine(Path.GetTempPath(), $"sign-renderer-test-{Guid.NewGuid():N}");
    private readonly Dictionary<string, byte[]> _files = new();

    public ClipSequenceRendererTests() => Directory.CreateDirectory(_folder);

    public void Dispose()
    {
        if (Directory.Exists(_folder)) Directory.Delete(_folder, recursive: true);
    }

    private sealed class Storage : IFileStorageService
    {
        private readonly Dictionary<string, byte[]> _files;

        public Storage(Dictionary<string, byte[]> files) => _files = files;

        public Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task AppendAsync(string storagePath, Stream content, CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default) =>
            _files.TryGetValue(storagePath, out var bytes) ? Task.FromResult<Stream>(new MemoryStream(bytes)) : throw new NotFoundException("missing");

        public Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default) => Task.FromResult(false);

        public Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default) => Task.FromResult(storagePath);
    }

    private async Task<string> MakeAsync(string key, params string[] arguments)
    {
        var file = Path.Combine(_folder, Path.GetFileName(key));
        var result = await FfmpegProcess.RunAsync("ffmpeg", new[] { "-nostdin", "-hide_banner", "-loglevel", "error", "-y" }.Concat(arguments).Append(file).ToList(),
            _folder, TimeSpan.FromMinutes(2), CancellationToken.None);
        result.ExitCode.Should().Be(0, result.StandardError);
        _files[key] = await File.ReadAllBytesAsync(file);
        return key;
    }

    /// <summary>RGB of one pixel of a frame of the video.</summary>
    private async Task<byte[]> PixelAsync(string video, double seconds, int x, int y)
    {
        var raw = Path.Combine(_folder, $"pixel-{Guid.NewGuid():N}.raw");
        var result = await FfmpegProcess.RunAsync("ffmpeg", new[]
        {
            "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-ss", seconds.ToString(System.Globalization.CultureInfo.InvariantCulture), "-i", video,
            "-frames:v", "1", "-vf", $"format=rgb24,crop=1:1:{x}:{y}", "-f", "rawvideo", "-pix_fmt", "rgb24", raw,
        }, _folder, TimeSpan.FromMinutes(1), CancellationToken.None);
        result.ExitCode.Should().Be(0, result.StandardError);
        return await File.ReadAllBytesAsync(raw);
    }

    private async Task<(ClipSequenceRenderer Renderer, SignRenderRequest Request)> ArrangeAsync(string mode)
    {
        var lesson = await MakeAsync("lessons/lesson.mp4",
            "-f", "lavfi", "-i", "color=c=0x00AA00:s=640x360:r=25", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100",
            "-t", "6", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest");
        var red = await MakeAsync("signs/red.mp4", "-f", "lavfi", "-i", "color=c=0xE00000:s=320x480:r=30", "-t", "1.2", "-c:v", "libx264", "-pix_fmt", "yuv420p");
        var blue = await MakeAsync("signs/blue.webm", "-f", "lavfi", "-i", "color=c=0x0000E0:s=480x480:r=24", "-t", "2", "-c:v", "libvpx-vp9", "-b:v", "200k");
        var redId = Guid.NewGuid();
        var blueId = Guid.NewGuid();
        var settings = new SignVideoSettings { WorkDirectory = Path.Combine(_folder, "work"), Preset = "ultrafast" };
        var renderer = new ClipSequenceRenderer(settings, new Storage(_files), NullLogger<ClipSequenceRenderer>.Instance);
        var request = new SignRenderRequest(
            Guid.NewGuid(),
            new SignRenderMedia(Guid.NewGuid(), lesson, "video/mp4"),
            mode,
            new Dictionary<Guid, SignRenderClip>
            {
                [redId] = new(redId, "đỏ", new SignRenderMedia(Guid.NewGuid(), red, "video/mp4"), null, null, Mirrored: true),
                // Only 0.4–1.4 s of the blue video holds the sign.
                [blueId] = new(blueId, "xanh", new SignRenderMedia(Guid.NewGuid(), blue, "video/webm"), 400, 1400, Mirrored: false),
            },
            new[]
            {
                new SignRenderSegment(0, 0, 2000, new[] { new SignRenderItem(0, 0, redId, null), new SignRenderItem(0, 1, blueId, null) }),
                new SignRenderSegment(1, 3500, 5000, new[] { new SignRenderItem(1, 0, redId, 1500) }),
            });
        return (renderer, request);
    }

    [FfmpegFact]
    public async Task Overlay_JoinsTheClipsInSyncWithTheCaptions_InAWindowAtTheBottomLeft_KeepingTheLessonSound()
    {
        var (renderer, request) = await ArrangeAsync(SignVideo.RenderMode.Overlay);
        (await renderer.CheckAsync()).Available.Should().BeTrue();
        var reported = new List<SignRenderProgress>();

        await using var output = await renderer.RenderAsync(request, p => { reported.Add(p); return Task.CompletedTask; });

        output.ContentType.Should().Be("video/mp4");
        output.SizeBytes.Should().BeGreaterThan(0);
        output.Width.Should().Be(640);
        output.Height.Should().Be(360);
        output.DurationMs.Should().BeInRange(5900, 6200, "cùng độ dài video bài học");
        var probe = await FfmpegProcess.ProbeAsync("ffprobe", output.FilePath, _folder, TimeSpan.FromMinutes(1), CancellationToken.None);
        probe!.HasAudio.Should().BeTrue("giữ âm thanh gốc của video học");
        output.VideoDurationsMs.Values.Should().OnlyContain(ms => ms > 1000);
        output.Placements.Select(p => (p.SegmentIndex, p.ItemIndex)).Should().Equal((0, 0), (0, 1), (1, 0));
        output.Placements[0].StartMs.Should().Be(0);
        output.Placements[2].StartMs.Should().Be(3500, "câu 2 bắt đầu ra dấu khi phụ đề hiện");
        output.Placements[2].HoldMs.Should().BeGreaterThan(0, "thời lượng 1,5 s dài hơn clip 1,2 s: giữ khung cuối");
        reported.Select(p => p.Percent).Should().BeInAscendingOrder();
        reported.Select(p => p.Stage).Distinct().Should().Equal(
            SignVideo.Stage.Downloading, SignVideo.Stage.PreparingClips, SignVideo.Stage.Joining, SignVideo.Stage.Composing, SignVideo.Stage.Checking);
        reported.Should().Contain(p => p.Detail != null && p.Detail.Contains("Chuẩn hóa video ký hiệu 2/2"));
        reported.Should().OnlyContain(p => !string.IsNullOrWhiteSpace(p.Detail), "mỗi bước nói rõ đang làm gì");

        // Window half the video height (160×180) at the bottom left, 10 px from the edges (even, for the colour planes); its centre is (90, 258).
        var signing = await PixelAsync(output.FilePath, 0.5, 91, 259);
        signing[0].Should().BeGreaterThan(150, "0,5 s: ký hiệu đỏ đang hiện trong cửa sổ");
        signing[1].Should().BeLessThan(80);
        var blueSign = await PixelAsync(output.FilePath, 1.7, 91, 259);
        blueSign[2].Should().BeGreaterThan(150, "1,7 s: ký hiệu thứ hai (xanh) theo đúng thứ tự");
        var resting = await PixelAsync(output.FilePath, 3.0, 91, 259);
        // 3,0 s: between the sentences the window shows the rest background #1E293B.
        resting[0].Should().BeLessThan(60);
        resting[1].Should().BeLessThan(70);
        resting[2].Should().BeInRange(40, 100);
        var lessonPixel = await PixelAsync(output.FilePath, 0.5, 100, 100);
        lessonPixel[1].Should().BeGreaterThan(120, "ngoài cửa sổ vẫn là video bài học");
        var right = await PixelAsync(output.FilePath, 0.5, 540, 259);
        right[1].Should().BeGreaterThan(120, "góc phải dưới để trống cho video bài học và phụ đề");

        var work = Path.GetDirectoryName(output.FilePath)!;
        await output.DisposeAsync();
        Directory.Exists(work).Should().BeFalse("thư mục tạm của việc dựng bị xóa");
    }

    [FfmpegFact]
    public async Task TrackOnly_AndFullscreen_AreAlsoPlayableVideosOfTheLessonLength()
    {
        var (trackRenderer, trackRequest) = await ArrangeAsync(SignVideo.RenderMode.TrackOnly);
        await using (var track = await trackRenderer.RenderAsync(trackRequest, _ => Task.CompletedTask))
        {
            track.Width.Should().Be(480);
            track.Height.Should().Be(540);
            track.DurationMs.Should().BeInRange(5900, 6200);
            (await FfmpegProcess.ProbeAsync("ffprobe", track.FilePath, _folder, TimeSpan.FromMinutes(1), CancellationToken.None))!.HasAudio
                .Should().BeFalse("track ký hiệu không có tiếng");
        }

        var (fullRenderer, fullRequest) = await ArrangeAsync(SignVideo.RenderMode.Fullscreen);
        await using var full = await fullRenderer.RenderAsync(fullRequest, _ => Task.CompletedTask);
        full.Width.Should().Be(640);
        full.Height.Should().Be(360);
        (await FfmpegProcess.ProbeAsync("ffprobe", full.FilePath, _folder, TimeSpan.FromMinutes(1), CancellationToken.None))!.HasAudio.Should().BeTrue();
    }

    [FfmpegFact]
    public async Task ABrokenClip_IsReportedByName_AndTheWorkFolderIsRemoved()
    {
        var (renderer, request) = await ArrangeAsync(SignVideo.RenderMode.Overlay);
        var red = request.Clips.Values.First(c => c.Gloss == "đỏ");
        _files[red.Video.StorageKey] = new byte[] { 1, 2, 3, 4 };

        var render = () => renderer.RenderAsync(request, _ => Task.CompletedTask);

        var error = (await render.Should().ThrowAsync<SignRenderException>()).Which;
        error.Code.Should().Be(SignVideo.Errors.VideoUnreadable);
        error.Message.Should().Contain("“đỏ”");
        Directory.EnumerateDirectories(Path.Combine(_folder, "work")).Should().BeEmpty();
    }

    [Fact]
    public async Task AMissingFfmpeg_IsReported_NotFaked()
    {
        var renderer = new ClipSequenceRenderer(new SignVideoSettings { FfmpegPath = "ffmpeg-not-installed-here", FfprobePath = "ffprobe-not-installed-here" },
            new Storage(_files), NullLogger<ClipSequenceRenderer>.Instance);

        var status = await renderer.CheckAsync();

        status.Available.Should().BeFalse();
        status.Message.Should().Contain("chưa cài FFmpeg");
        var disabled = await new ClipSequenceRenderer(new SignVideoSettings { Enabled = false }, new Storage(_files), NullLogger<ClipSequenceRenderer>.Instance).CheckAsync();
        disabled.Message.Should().Contain("SignVideo:Enabled");
    }

    // ----- The 3D avatar: a track rendered by the browser, composed on the lesson frame grid ---------------

    [Fact]
    public void TheSignerWindow_IsHalfTheVideoHigh_AtTheBottomLeft_AndNeverTooWide()
    {
        var settings = new SignVideoSettings().Sanitized();
        SignComposer.WindowFor(settings, 1280, 720).Should().Be(new SignComposer.Window(320, 360, 22, 338));
        SignComposer.WindowFor(settings, 1920, 1080).Should().Be(new SignComposer.Window(480, 540, 32, 508), "1080p: nhân vật hiện đúng kích thước dựng");
        var portrait = SignComposer.WindowFor(settings, 720, 1280);
        portrait.Width.Should().BeLessThanOrEqualTo(260, "video dọc: không quá 36% bề ngang");
        SignComposer.WindowFor(new SignVideoSettings { WindowSide = "right" }.Sanitized(), 1280, 720).X.Should().Be(1280 - 320 - 22);
    }

    [Fact]
    public void TheTransparentAvatar_StandsFlushInTheBottomCorner_AndIsRenderedAtItsSize()
    {
        var settings = new SignVideoSettings().Sanitized();
        SignComposer.AvatarWindowFor(settings, 1280, 720).Should().Be(new SignComposer.Window(432, 432, 0, 288), "sát mép trái và mép dưới, không lề, không viền");
        SignComposer.AvatarWindowFor(new SignVideoSettings { WindowSide = "RIGHT" }.Sanitized(), 1280, 720).X.Should().Be(1280 - 432);
        SignComposer.AvatarWindowFor(new SignVideoSettings { AvatarWindowHeightPercent = 50 }.Sanitized(), 1280, 720).Height.Should().Be(360);
        SignComposer.AvatarWindowFor(new SignVideoSettings { AvatarWindowHeightPercent = 5 }.Sanitized(), 1280, 720).Height.Should().Be(432, "giá trị lạ về mặc định");
        SignComposer.AvatarWindowFor(settings, 720, 1280).Width.Should().BeLessThanOrEqualTo(260, "video dọc: không quá 36% bề ngang");

        SignComposer.AvatarTile(settings, 1920, 1080).Should().Be((648, 648), "dựng đúng kích thước đặt lên video: không phóng to thu nhỏ");
        SignComposer.AvatarTile(settings, 3840, 2160).Should().Be((672, 672), "khung đôi (màu | alpha) vẫn trong giới hạn H.264 level 3.1");
    }

    [Fact]
    public void TheAvatarTrack_FollowsTheLessonFrameRate()
    {
        FrameRates.ForTrack("30000/1001").Should().Be(("30000/1001", 30000 / 1001.0));
        FrameRates.ForTrack("25/1").Text.Should().Be("25");
        FrameRates.ForTrack("1847/62").Text.Should().Be("30", "quay màn hình có tốc độ lẻ: làm tròn");
        FrameRates.ForTrack("120").Text.Should().Be("60");
        FrameRates.ForTrack("0/0").Text.Should().Be("25");
        FrameRates.FrameCount(6000, 25).Should().Be(150);
    }

    private async Task<(AvatarMotionRenderer Renderer, SignAvatarTrackStore Store, SignRenderRequest Request)> ArrangeAvatarAsync(string mode, string fingerprint = "map-1")
    {
        var lesson = await MakeAsync("lessons/avatar-lesson.mp4",
            "-f", "lavfi", "-i", "color=c=0x00AA00:s=640x360:r=25", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100",
            "-t", "6", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest");
        var settings = new SignVideoSettings { WorkDirectory = Path.Combine(_folder, "work"), Preset = "ultrafast" };
        var storage = new Storage(_files);
        var store = new SignAvatarTrackStore(settings, storage, NullLogger<SignAvatarTrackStore>.Instance);
        var source = new SignRenderMedia(Guid.NewGuid(), lesson, "video/mp4");
        var spec = await store.SpecAsync(source, mode);

        // What the browser uploads: raw H.264 (Annex B), one frame per lesson frame (25 fps × 6 s). Opaque: the red tile.
        // Transparent (OVERLAY): twice as wide — a red "avatar" premultiplied on black | its alpha in white — standing on
        // the bottom edge, 40 px from the side, with nothing (alpha 0) around it.
        var picture = spec.Transparent
            ? new[]
            {
                "-f", "lavfi", "-i", $"color=c=black:s={2 * spec.Width}x{spec.Height}:r=25", "-vf",
                $"drawbox=x=40:y=40:w=110:h={spec.Height - 40}:color=0xE00000:t=fill,drawbox=x={spec.Width + 40}:y=40:w=110:h={spec.Height - 40}:color=white:t=fill",
            }
            : new[] { "-f", "lavfi", "-i", $"color=c=0xE00000:s={spec.Width}x{spec.Height}:r=25" };
        var raw = Path.Combine(_folder, "avatar.h264");
        var made = await FfmpegProcess.RunAsync("ffmpeg", new[] { "-nostdin", "-hide_banner", "-loglevel", "error", "-y" }.Concat(picture).Concat(new[]
        {
            "-frames:v", "150", "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p", "-bsf:v", "h264_mp4toannexb", "-f", "h264", raw,
        }).ToList(), _folder, TimeSpan.FromMinutes(2), CancellationToken.None);
        made.ExitCode.Should().Be(0, made.StandardError);

        var trackId = Guid.NewGuid();
        await using (var content = File.OpenRead(raw))
        {
            await store.SaveAsync(trackId, content, new SignAvatarTrackInfo(fingerprint, SignVideo.AvatarTrack.H264, spec.FrameRate, spec.FrameCount, 0,
                new[] { new SignPlacement(0, 0, 200, 1800, 1.2, 1900, 0, false) }, DateTimeOffset.UtcNow, spec.Transparent));
        }

        var renderer = new AvatarMotionRenderer(settings, storage, store, NullLogger<AvatarMotionRenderer>.Instance);
        var request = new SignRenderRequest(trackId, source, mode, new Dictionary<Guid, SignRenderClip>(), Array.Empty<SignRenderSegment>(), "map-1");
        return (renderer, store, request);
    }

    [FfmpegFact]
    public async Task TheAvatarTrack_IsComposedFrameForFrame_WithoutBackground_FlushInTheBottomLeftCorner()
    {
        var (renderer, store, request) = await ArrangeAvatarAsync(SignVideo.RenderMode.Overlay);
        var spec = await store.SpecAsync(request.Source, SignVideo.RenderMode.Overlay);
        spec.FrameRate.Should().Be("25");
        spec.FrameCount.Should().Be(150);
        spec.Transparent.Should().BeTrue();
        spec.Side.Should().Be("LEFT");
        (spec.Width, spec.Height).Should().Be((216, 216), "60% của video 640×360, dựng đúng kích thước đặt lên video");
        var reported = new List<SignRenderProgress>();

        await using var output = await renderer.RenderAsync(request, p => { reported.Add(p); return Task.CompletedTask; });

        output.Width.Should().Be(640);
        output.DurationMs.Should().BeInRange(5900, 6200);
        output.Placements.Should().ContainSingle().Which.StartMs.Should().Be(200);
        (await FfmpegProcess.ProbeAsync("ffprobe", output.FilePath, _folder, TimeSpan.FromMinutes(1), CancellationToken.None))!.HasAudio.Should().BeTrue();
        reported.Select(p => p.Percent).Should().BeInAscendingOrder();
        reported.Should().OnlyContain(p => !string.IsNullOrWhiteSpace(p.Detail));
        foreach (var second in new[] { 0.1, 3.0, 5.8 })
        {
            var avatar = await PixelAsync(output.FilePath, second, 95, 300);
            avatar[0].Should().BeGreaterThan(200, $"{second} s: nhân vật hiện suốt video, màu không bị nhạt");
            avatar[1].Should().BeLessThan(60);
        }

        var onTheEdge = await PixelAsync(output.FilePath, 3.0, 95, 359);
        onTheEdge[0].Should().BeGreaterThan(200, "nhân vật đứng sát mép dưới video");
        foreach (var (x, y) in new[] { (10, 300), (170, 300), (95, 160), (1, 200) })
        {
            var lesson = await PixelAsync(output.FilePath, 3.0, x, y);
            lesson[1].Should().BeInRange(155, 185, $"({x},{y}): quanh nhân vật là video bài giảng nguyên màu — không nền, không viền");
            lesson[0].Should().BeLessThan(30);
        }

        (await PixelAsync(output.FilePath, 3.0, 540, 259))[1].Should().BeGreaterThan(120);
    }

    [FfmpegFact]
    public async Task TheAvatarTrack_OfAnotherMap_OrMissing_IsNeverComposed()
    {
        var (renderer, store, request) = await ArrangeAvatarAsync(SignVideo.RenderMode.TrackOnly);
        var outdated = () => renderer.RenderAsync(request with { Fingerprint = "map-2" }, _ => Task.CompletedTask);
        (await outdated.Should().ThrowAsync<SignRenderException>()).Which.Code.Should().Be(SignVideo.Errors.AvatarTrackOutdated);
        var onABackground = () => renderer.RenderAsync(request with { RenderMode = SignVideo.RenderMode.Overlay }, _ => Task.CompletedTask);
        (await onABackground.Should().ThrowAsync<SignRenderException>("góc video cần track nền trong suốt")).Which.Code.Should().Be(SignVideo.Errors.AvatarTrackOutdated);

        await using (var track = await renderer.RenderAsync(request, _ => Task.CompletedTask))
        {
            (track.Width, track.Height).Should().Be((480, 540));
            track.DurationMs.Should().BeInRange(5900, 6200);
        }

        await store.DeleteAsync(request.JobId);
        var missing = () => renderer.RenderAsync(request, _ => Task.CompletedTask);
        (await missing.Should().ThrowAsync<SignRenderException>()).Which.Code.Should().Be(SignVideo.Errors.AvatarTrackMissing);

        var notH264 = () => store.SaveAsync(request.JobId, new MemoryStream(new byte[] { 1, 2, 3, 4, 5 }),
            new SignAvatarTrackInfo("map-1", SignVideo.AvatarTrack.H264, "25", 150, 0, Array.Empty<SignPlacement>(), DateTimeOffset.UtcNow));
        (await notH264.Should().ThrowAsync<SignRenderException>()).Which.Code.Should().Be(SignVideo.Errors.AvatarTrackInvalid);
    }
}
