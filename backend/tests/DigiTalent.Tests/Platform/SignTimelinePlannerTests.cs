using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.SignVideoRendering;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Placing the signs on the lesson timeline and turning it into FFmpeg pieces: order, no overlap, rests between
/// sentences, clips shorter or longer than the time they get, and the FFmpeg commands (no shell, safe names).
/// </summary>
public class SignTimelinePlannerTests
{
    private static SignPlanSegment Sentence(int index, int start, int end, params int[] clipLengths) =>
        new(index, start, end, clipLengths.Select((ms, i) => new SignPlanItem(i, ms)).ToList());

    [Fact]
    public void Signs_FollowTheirOrder_StartWithTheCaption_AndNeverOverlap()
    {
        var timeline = SignTimelinePlanner.Plan(new[]
        {
            Sentence(1, 5000, 7000, 800, 900),
            Sentence(0, 0, 2000, 500, 600, 700),
        });

        timeline.Placements.Select(p => (p.SegmentIndex, p.ItemIndex)).Should().Equal((0, 0), (0, 1), (0, 2), (1, 0), (1, 1));
        timeline.Placements[0].StartMs.Should().Be(0);
        timeline.Placements[3].StartMs.Should().Be(5000, "câu sau bắt đầu ra dấu khi phụ đề của nó hiện");
        timeline.Placements.Zip(timeline.Placements.Skip(1)).Should().OnlyContain(p => p.First.EndMs <= p.Second.StartMs);
        timeline.Warnings.Should().BeEmpty();
    }

    [Fact]
    public void ShortClips_PlayAtTheirSpeed_AndTheSignerRestsUntilTheNextSentence()
    {
        var timeline = SignTimelinePlanner.Plan(new[] { Sentence(0, 1000, 5000, 600, 400), Sentence(1, 8000, 9000, 500) });

        timeline.Placements[0].Should().Match<SignPlacement>(p => p.StartMs == 1000 && p.EndMs == 1600 && p.Speed == 1 && p.HoldMs == 0);
        timeline.Placements[1].EndMs.Should().Be(2000);
        timeline.Placements[2].StartMs.Should().Be(8000, "khoảng 2000–8000 là lúc nghỉ giữa hai câu");
    }

    [Fact]
    public void LongClips_UseThePauseFirst_ThenPlayFaster_ThenAreCut_NeverReachingTheNextSentence()
    {
        // 3 s of signs for a 2 s caption with 2 s of pause after it: fits at normal speed.
        var pause = SignTimelinePlanner.Plan(new[] { Sentence(0, 0, 2000, 1500, 1500), Sentence(1, 4000, 5000, 500) });
        pause.Placements.Take(2).Should().OnlyContain(p => p.Speed == 1);
        pause.Placements[1].EndMs.Should().Be(3000);

        // 3 s of signs for 2.5 s before the next caption: ×1.2.
        var faster = SignTimelinePlanner.Plan(new[] { Sentence(0, 0, 2000, 1500, 1500), Sentence(1, 2500, 3000, 400) });
        faster.Placements.Take(2).Should().OnlyContain(p => p.Speed == 1.2 && !p.Trimmed);
        faster.Placements[1].EndMs.Should().Be(2500);
        faster.Warnings.Should().ContainSingle().Which.Should().Contain("Câu 1").And.Contain("×1,2");

        // 6 s of signs for 2 s: ×1.5 is the limit, the end of each sign is cut.
        var cut = SignTimelinePlanner.Plan(new[] { Sentence(0, 0, 2000, 3000, 3000), Sentence(1, 2000, 3000, 400) });
        cut.Placements.Take(2).Should().OnlyContain(p => p.Speed == SignVideo.MaxSpeedup && p.Trimmed && p.SourceMs < 3000);
        cut.Placements[1].EndMs.Should().BeLessThanOrEqualTo(2000);
        cut.Placements[2].StartMs.Should().Be(2000);
        cut.Warnings.Single().Should().Contain("cắt bớt");
    }

    [Fact]
    public void ASentenceWithNothingToSign_DoesNotCutTheSigningBeforeIt()
    {
        // 3 s of signs, then "[nhạc nền]" at 2 s (nothing to sign), then a sentence at 6 s.
        var timeline = SignTimelinePlanner.Plan(new[] { Sentence(0, 0, 2000, 1500, 1500), Sentence(1, 2000, 3000), Sentence(2, 6000, 7000, 500) });

        timeline.Placements.Take(2).Should().OnlyContain(p => p.Speed == 1, "tràn sang đoạn nhạc nền thay vì phát nhanh");
        timeline.Placements[1].EndMs.Should().Be(3000);
        timeline.Warnings.Should().BeEmpty();
    }

    [Fact]
    public void ALongerLengthGivenByTheAdmin_HoldsTheLastFrame()
    {
        var timeline = SignTimelinePlanner.Plan(new[] { new SignPlanSegment(0, 0, 5000, new[] { new SignPlanItem(0, 800, TargetMs: 2000) }) });

        timeline.Placements.Single().Should().Match<SignPlacement>(p => p.DurationMs == 2000 && p.Speed == 1 && p.SourceMs == 800 && p.HoldMs == 1200);
    }

    [Fact]
    public void TheLastSentence_MayRunPastItsCaption_ButNotPastTheVideo()
    {
        var timeline = SignTimelinePlanner.Plan(new[] { Sentence(0, 1000, 2000, 2500) }, videoDurationMs: 3000);
        timeline.Placements.Single().EndMs.Should().Be(3000);
        timeline.Placements.Single().Speed.Should().BeApproximately(1.25, 0.001);
    }

    [Fact]
    public void Pieces_CoverTheWholeVideoOnTheFrameGrid_WithRestsBetweenSigns()
    {
        var clip = new ClipSequenceRenderer.NormalizedClip("clip-0.mp4", 20);
        var timeline = SignTimelinePlanner.Plan(new[] { Sentence(0, 1000, 2000, 800), Sentence(1, 3000, 4000, 800) });

        var pieces = ClipSequenceRenderer.PlanPieces(timeline.Placements, _ => clip, videoDurationMs: 5000, fps: 25);

        pieces.Sum(p => p.Frames).Should().Be(125, "5 giây × 25 khung, không lệch");
        pieces.Select(p => p.Clip == null ? "rest" : "sign").Should().Equal("rest", "sign", "rest", "sign", "rest");
        pieces[0].Frames.Should().Be(25);
        pieces[1].Frames.Should().Be(20);
        pieces[1].Key.Should().Be(pieces[3].Key, "cùng một ký hiệu cùng tốc độ chỉ dựng một lần");
    }

    [Fact]
    public void TrimRange_UsesThePartChosenInTheDictionary_ClampedToTheVideo()
    {
        ClipSequenceRenderer.TrimRange(200, 1400, 2000).Should().Be((200, 1200));
        ClipSequenceRenderer.TrimRange(200, 5000, 2000).Should().Be((200, 1800));
        ClipSequenceRenderer.TrimRange(null, null, 2000).Should().Be((0, 2000));
        ClipSequenceRenderer.TrimRange(1990, 2500, 2000).Should().Be((0, 2000), "đoạn quá ngắn thì dùng cả video");
    }

    [Fact]
    public void FfmpegCommands_UseOnlyGeneratedNames_InvariantNumbers_AndKeepTheLessonSound()
    {
        var settings = new SignVideoSettings().Sanitized();
        var source = new MediaInfo(61_234, 1281, 721, HasAudio: true);
        var overlay = ClipSequenceRenderer.ComposeArguments(settings, SignVideo.RenderMode.Overlay, "source.mp4", "pieces.txt", source, "output.mp4");

        overlay.Should().ContainInOrder("-i", "source.mp4", "-f", "concat", "-i", "pieces.txt");
        overlay.Should().Contain("0:a?").And.Contain("aac").And.Contain("+faststart").And.Contain("libx264").And.Contain("yuv420p");
        overlay.Should().ContainInOrder("-t", "61.234");
        var filter = overlay[overlay.IndexOf("-filter_complex") + 1];
        filter.Should().Contain("scale=1280:720").And.Contain("overlay=x=22:y=338", "cửa sổ ở góc trái dưới, cách mép 22 px");
        filter.Should().Contain("scale=316:356,pad=320:360:2:2", "cửa sổ cao nửa video (360 px), có viền sáng 2 px");
        overlay.Should().NotContain(a => a.Contains(';') && a != filter, "không có câu lệnh shell nối chuỗi");

        var trackOnly = ClipSequenceRenderer.ComposeArguments(settings, SignVideo.RenderMode.TrackOnly, "source.mp4", "pieces.txt", source, "output.mp4");
        trackOnly.Should().Contain("-an").And.NotContain("source.mp4");

        var fullscreen = ClipSequenceRenderer.ComposeArguments(settings, SignVideo.RenderMode.Fullscreen, "source.mp4", "pieces.txt", source, "output.mp4");
        fullscreen.Should().Contain("0:a?");

        var piece = ClipSequenceRenderer.PieceArguments(settings, "clip-0.mp4", 1.25, 30, "piece-0.mp4");
        piece.Should().Contain(a => a.Contains("setpts=(PTS-STARTPTS)/1.25")).And.ContainInOrder("-frames:v", "30").And.Contain("-an");
        var normalize = ClipSequenceRenderer.NormalizeClipArguments(settings, "clip-0-raw.mp4", 200, 1200, mirrored: true, 30, "clip-0.mp4");
        normalize.Should().ContainInOrder("-ss", "0.2", "-t", "1.2").And.Contain("-an");
        normalize.Should().Contain(a => a.StartsWith("hflip,"), "video soi gương được lật lại");
    }

    [Fact]
    public void Settings_FallBackToSafeValues()
    {
        var sanitized = new SignVideoSettings { Preset = "; rm -rf /", BackgroundColor = "red", Crf = 99, Fps = 1, FfmpegPath = " " }.Sanitized();

        sanitized.Preset.Should().Be("veryfast");
        sanitized.BackgroundColor.Should().Be("#1E293B");
        sanitized.FfmpegColor.Should().Be("0x1E293B");
        sanitized.Crf.Should().Be(23);
        sanitized.Fps.Should().Be(25);
        sanitized.FfmpegPath.Should().Be("ffmpeg");
    }

    [Theory]
    [InlineData("out_time_us=1500000", 1_500_000L)]
    [InlineData("out_time_ms=1500000", 1_500_000L)]
    [InlineData("frame=12", null)]
    public void Progress_IsReadFromFfmpeg(string line, long? expected) =>
        ClipSequenceRenderer.ProgressMicroseconds(line).Should().Be(expected);

    [Fact]
    public void Probe_ReadsDurationSizeAndAudio()
    {
        var info = FfmpegProcess.ParseProbe("""
            {"streams":[{"codec_type":"video","width":640,"height":360,"duration":"4.960000"},{"codec_type":"audio","duration":"5.0"}],"format":{"duration":"5.012000"}}
            """);
        info.Should().Be(new MediaInfo(5012, 640, 360, true));
        FfmpegProcess.ParseProbe("""{"streams":[{"codec_type":"audio"}],"format":{"duration":"3"}}""").Should().BeNull("không có hình");
        FfmpegProcess.ParseProbe("not json").Should().BeNull();
    }

    [Fact]
    public void OutputFileName_KeepsOnlySafeCharacters()
    {
        SignVideoProcessor.OutputFileName("Bài giảng 1: Dữ liệu (v2).mp4").Should().Be("bai-giang-1-du-lieu-v2-ngon-ngu-ky-hieu.mp4");
        SignVideoProcessor.OutputFileName("../../etc/passwd").Should().Be("passwd-ngon-ngu-ky-hieu.mp4");
        SignVideoProcessor.OutputFileName("").Should().Be("video-ngon-ngu-ky-hieu.mp4");
    }
}
