using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Application.UseCases.Platform.SignDictionary;
using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.BackgroundServices;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.SignVideoRendering;
using DigiTalent.Tests.Authorization;
using DigiTalent.Tests.Pulse;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// The sign-language video from end to end (docs/specs/2026-11-24-sign-language-video.md): prerequisites, analysis of
/// the captions, missing signs reported, manual mapping, review, the background render (a test renderer writes a
/// real file; production never registers it), the new platform asset, preview, publication rules, what learners
/// receive, retry, idempotency and permissions. Captions are never changed by any of it.
/// </summary>
public class SignLanguageVideoFlowTests
{
    private static readonly Guid AdminId = Guid.NewGuid();
    private const string SigningKey = "test-signing-key-for-platform-assets-0123456789";

    /// <summary>Files kept in memory (stands for local disk or MinIO).</summary>
    private sealed class MemoryStorage : IFileStorageService
    {
        public Dictionary<string, byte[]> Files { get; } = new();

        public async Task<string> UploadAsync(Stream content, string fileName, string contentType, string folder = "general", CancellationToken cancellationToken = default)
        {
            using var buffer = new MemoryStream();
            await content.CopyToAsync(buffer, cancellationToken);
            var key = $"{folder}/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";
            Files[key] = buffer.ToArray();
            return key;
        }

        public Task AppendAsync(string storagePath, Stream content, CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<Stream> DownloadAsync(string storagePath, CancellationToken cancellationToken = default) =>
            Files.TryGetValue(storagePath, out var bytes)
                ? Task.FromResult<Stream>(new MemoryStream(bytes))
                : throw new NotFoundException($"Storage file '{storagePath}' not found.");

        public Task<bool> DeleteAsync(string storagePath, CancellationToken cancellationToken = default) => Task.FromResult(Files.Remove(storagePath));

        public Task<string> GetDownloadUrlAsync(string storagePath, TimeSpan? expiresIn = null, CancellationToken cancellationToken = default) => Task.FromResult(storagePath);
    }

    /// <summary>Test renderer: writes a small real file and the timeline a real render would use (1 s per sign).</summary>
    private sealed class TestRenderer : ISignVideoRenderer
    {
        public bool Available { get; set; } = true;
        public Exception? Failure { get; set; }
        public List<SignRenderRequest> Requests { get; } = new();

        public string Kind => SignVideo.Renderer.Clip;

        public Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(Available ? SignRendererStatus.Ready : new SignRendererStatus(false, "Máy chủ chưa cài FFmpeg."));

        public async Task<SignRenderOutput> RenderAsync(SignRenderRequest request, Func<SignRenderProgress, Task> progress, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            await progress(new SignRenderProgress(SignVideo.Stage.Composing, 50, "Dựng video đầu ra"));
            if (Failure != null) throw Failure;
            var path = Path.Combine(Path.GetTempPath(), $"sign-test-{Guid.NewGuid():N}.mp4");
            await File.WriteAllBytesAsync(path, new byte[2048], cancellationToken);
            var timeline = SignTimelinePlanner.Plan(request.Segments.Select(s =>
                new SignPlanSegment(s.SegmentIndex, s.StartMs, s.EndMs, s.Items.Select(i => new SignPlanItem(i.ItemIndex, 1000, i.TargetMs)).ToList())));
            return new SignRenderOutput
            {
                FilePath = path,
                ContentType = "video/mp4",
                SizeBytes = 2048,
                DurationMs = 12_000,
                Width = 1280,
                Height = 720,
                VideoDurationsMs = request.Clips.Keys.ToDictionary(id => id, _ => 1000),
                Placements = timeline.Placements,
                Cleanup = () =>
                {
                    File.Delete(path);
                    return ValueTask.CompletedTask;
                },
            };
        }
    }

    /// <summary>Test avatar renderer: composes nothing, needs the uploaded track like the real one.</summary>
    private sealed class TestAvatarRenderer : ISignVideoRenderer
    {
        private readonly MemoryAvatarTracks _tracks;

        public TestAvatarRenderer(MemoryAvatarTracks tracks) => _tracks = tracks;

        public bool Available { get; set; } = true;
        public List<SignRenderRequest> Requests { get; } = new();

        public string Kind => SignVideo.Renderer.Avatar;

        public Task<SignRendererStatus> CheckAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(Available ? SignRendererStatus.Ready : new SignRendererStatus(false, "Máy chủ chưa cài FFmpeg."));

        public async Task<SignRenderOutput> RenderAsync(SignRenderRequest request, Func<SignRenderProgress, Task> progress, CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            var info = await _tracks.FindAsync(request.JobId, cancellationToken)
                ?? throw new SignRenderException(SignVideo.Errors.AvatarTrackMissing, "Không còn track nhân vật.");
            if (info.Fingerprint != request.Fingerprint) throw new SignRenderException(SignVideo.Errors.AvatarTrackOutdated, "Track cũ.");
            await progress(new SignRenderProgress(SignVideo.Stage.Composing, 50, "Dựng video đầu ra: cửa sổ nhân vật ở góc trái dưới"));
            var path = Path.Combine(Path.GetTempPath(), $"sign-avatar-test-{Guid.NewGuid():N}.mp4");
            await File.WriteAllBytesAsync(path, new byte[1024], cancellationToken);
            return new SignRenderOutput
            {
                FilePath = path, ContentType = "video/mp4", SizeBytes = 1024, DurationMs = 12_000, Width = 1280, Height = 720,
                Placements = info.Placements,
                Cleanup = () =>
                {
                    File.Delete(path);
                    return ValueTask.CompletedTask;
                },
            };
        }
    }

    /// <summary>Avatar tracks in memory; the lesson video is 25 fps, 12 s.</summary>
    private sealed class MemoryAvatarTracks : ISignAvatarTrackStore
    {
        public Dictionary<Guid, (byte[] Bytes, SignAvatarTrackInfo Info)> Tracks { get; } = new();

        public Task<SignAvatarTrackSpec> SpecAsync(SignRenderMedia source, string renderMode, CancellationToken cancellationToken = default) =>
            Task.FromResult(SignVideo.AvatarTrack.IsTransparent(renderMode)
                ? new SignAvatarTrackSpec("25", 25, 300, 12_000, 432, 432, "#E9EEF5", Transparent: true, Side: "LEFT")
                : new SignAvatarTrackSpec("25", 25, 300, 12_000, 480, 540, "#E9EEF5"));

        public async Task SaveAsync(Guid trackId, Stream content, SignAvatarTrackInfo info, CancellationToken cancellationToken = default)
        {
            using var buffer = new MemoryStream();
            await content.CopyToAsync(buffer, cancellationToken);
            Tracks[trackId] = (buffer.ToArray(), info);
        }

        public Task<SignAvatarTrackInfo?> FindAsync(Guid trackId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Tracks.TryGetValue(trackId, out var track) ? track.Info : null);

        public string? PathOf(Guid trackId) => Tracks.ContainsKey(trackId) ? "memory" : null;

        public Task DeleteAsync(Guid trackId, CancellationToken cancellationToken = default)
        {
            Tracks.Remove(trackId);
            return Task.CompletedTask;
        }
    }

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public required PlatformAsset Video { get; init; }
        public required Dictionary<string, SignGloss> Signs { get; init; }
        public MemoryStorage Storage { get; } = new();
        public TestRenderer Renderer { get; } = new();
        public MemoryAvatarTracks AvatarTracks { get; } = new();
        private TestAvatarRenderer? _avatar;
        public TestAvatarRenderer AvatarRenderer => _avatar ??= new TestAvatarRenderer(AvatarTracks);
        public List<Guid> Queued { get; } = new();
        public ManualClock Clock { get; } = new() { Now = DateTimeOffset.UtcNow };
        public Mock<IAuditService> Audit { get; } = new();
        public PlatformAssetUrlSigner Urls { get; } = new(new JwtSettings { SigningKey = SigningKey }, TimeProvider.System);

        private ICurrentUser User
        {
            get
            {
                var user = new Mock<ICurrentUser>();
                user.Setup(u => u.UserId).Returns(AdminId);
                return user.Object;
            }
        }

        private ISignVideoJobQueue Queue
        {
            get
            {
                var queue = new Mock<ISignVideoJobQueue>();
                queue.Setup(q => q.Enqueue(It.IsAny<Guid>())).Callback<Guid>(Queued.Add);
                return queue.Object;
            }
        }

        private ISignVideoRenderer[] Renderers => new ISignVideoRenderer[] { Renderer, AvatarRenderer };
        private SignLanguageVideoReader Reader => new(Context, Renderers, Clock, Urls);
        private SignVideoRenderStarter Starter => new(Context, Renderers, Storage, Queue, User, Clock, null, AvatarTracks);

        public Task<SignAvatarJobDto> AvatarJobAsync(Guid trackId) =>
            new GetSignAvatarJobUseCase(Context, Renderers, Storage, Clock, AvatarTracks).ExecuteAsync(new GetSignAvatarJobUseCaseInput { TrackId = trackId });

        public Task<SignLanguageVideoDto> UploadAvatarAsync(Guid trackId, string fingerprint, string frameRate = "25", int frames = 300,
            List<SignAvatarPlacementInput>? placements = null, byte[]? content = null, bool transparent = true) =>
            new UploadSignAvatarTrackUseCase(Context, Starter, Reader, Clock, AvatarTracks).ExecuteAsync(new UploadSignAvatarTrackUseCaseInput
            {
                TrackId = trackId,
                Content = new MemoryStream(content ?? new byte[] { 0, 0, 0, 1, 0x67 }),
                SizeBytes = (content ?? new byte[5]).Length,
                Fingerprint = fingerprint,
                Format = SignVideo.AvatarTrack.H264,
                FrameRate = frameRate,
                FrameCount = frames,
                Transparent = transparent,
                Placements = placements ?? new List<SignAvatarPlacementInput>(),
            });

        public Task<SignLanguageVideoDto> GetAsync() =>
            new GetSignLanguageVideoUseCase(Context, Reader).ExecuteAsync(new GetSignLanguageVideoUseCaseInput { AssetId = Video.Id });

        public Task<SignLanguageVideoDto> AnalyzeAsync(string source = SignVideo.CaptionSource.Published, string mode = SignVideo.RenderMode.Overlay, string renderer = SignVideo.Renderer.Clip) =>
            new AnalyzeSignLanguageVideoUseCase(Context, new SignGlossMatcher(), Storage, Reader, User, Clock)
                .ExecuteAsync(new AnalyzeSignLanguageVideoUseCaseInput { AssetId = Video.Id, CaptionSource = source, RenderMode = mode, Renderer = renderer });

        public Task<SignLanguageVideoDto> SaveAsync(Guid trackId, params SignSegmentInput[] segments) =>
            new SaveSignLanguageSegmentsUseCase(Context, new SignGlossMatcher(), Reader, User, Clock)
                .ExecuteAsync(new SaveSignLanguageSegmentsUseCaseInput { TrackId = trackId, Segments = segments.ToList() });

        public Task<SignLanguageVideoDto> RenderAsync(Guid trackId, bool force = false) =>
            new RenderSignLanguageVideoUseCase(Context, Starter, Reader).ExecuteAsync(new RenderSignLanguageVideoUseCaseInput { TrackId = trackId, Force = force });

        public Task<SignLanguageVideoDto> RetryAsync(Guid trackId) =>
            new RetrySignLanguageVideoUseCase(Context, Starter, Reader, Clock).ExecuteAsync(new RetrySignLanguageVideoUseCaseInput { TrackId = trackId });

        public Task<SignVideoStatusDto> StatusAsync(Guid trackId) =>
            new GetSignLanguageVideoStatusUseCase(Context, Clock).ExecuteAsync(new GetSignLanguageVideoStatusUseCaseInput { TrackId = trackId });

        public Task<SignVideoOutputDto> PreviewAsync(Guid trackId) =>
            new GetSignLanguageVideoPreviewUseCase(Context, Urls).ExecuteAsync(new GetSignLanguageVideoPreviewUseCaseInput { TrackId = trackId });

        public Task<SignLanguageVideoDto> PublishAsync(Guid trackId) =>
            new PublishSignLanguageVideoUseCase(Context, Storage, Reader, User, Audit.Object, Clock).ExecuteAsync(new PublishSignLanguageVideoUseCaseInput { TrackId = trackId });

        public Task<SignLanguageVideoDto> DiscardAsync(Guid trackId) =>
            new DiscardSignLanguageVideoDraftUseCase(Context, Reader, Clock).ExecuteAsync(new DiscardSignLanguageVideoDraftUseCaseInput { TrackId = trackId });

        /// <summary>What the background worker does with the queued render.</summary>
        public async Task RunQueuedAsync()
        {
            var id = Queued.Last();
            Context.ChangeTracker.Clear();
            await new SignVideoProcessor(Context, Storage, Renderers, NullLogger<SignVideoProcessor>.Instance, Clock, AvatarTracks).ProcessAsync(id, TimeSpan.FromMinutes(5));
            Context.ChangeTracker.Clear();
        }

        public async Task<SignGloss> AddSignAsync(string gloss, bool withVideo = true, bool licensed = true, string region = SignLanguage.Region.National,
            string? signer = "Người ra dấu A", bool withMotion = false)
        {
            Guid? videoId = null;
            if (withVideo)
            {
                var key = $"platform-assets/signs/{Guid.NewGuid():N}.mp4";
                Storage.Files[key] = new byte[64];
                var clip = new PlatformAsset { Kind = PlatformCatalog.AssetKind.Video, FileName = $"{gloss}.mp4", ContentType = "video/mp4", SizeBytes = 64, StorageKey = key };
                Context.PlatformAssets.Add(clip);
                videoId = clip.Id;
            }

            var sign = new SignGloss
            {
                Gloss = gloss, Normalized = SignGlossRules.Normalize(gloss), Kind = SignLanguage.Kind.Word, Status = Statuses.SignGloss.Draft,
                VideoAssetId = videoId, Region = region,
                SourceName = licensed ? "Từ điển thử" : null, LicenseNote = licensed ? "Được phép dùng thử" : null, ConsentConfirmed = licensed,
                SignerName = withVideo ? signer : null,
                MotionData = withMotion ? new byte[650] : null, MotionLayout = withMotion ? (short)1 : null,
                MotionFps = withMotion ? (short)20 : null, MotionFrames = withMotion ? 1 : null,
            };
            Context.SignGlosses.Add(sign);
            await Context.SaveChangesAsync();
            return sign;
        }

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private static CaptionCueDto Cue(int start, int end, string text) => new() { StartMs = start, EndMs = end, Text = text };

    private static async Task<World> CreateWorldAsync(bool publishCaptions = true, bool inLesson = true)
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var video = new PlatformAsset { Kind = PlatformCatalog.AssetKind.Video, FileName = "Bài giảng dữ liệu.mp4", ContentType = "video/mp4", SizeBytes = 4096, StorageKey = $"platform-assets/{Guid.NewGuid():N}.mp4" };
        context.PlatformAssets.Add(video);
        if (inLesson)
        {
            context.PlatformModuleBlocks.Add(new PlatformModuleBlock { ModuleId = Guid.NewGuid(), SortOrder = 1, BlockType = PlatformCatalog.BlockType.Video, AssetId = video.Id });
        }

        var cues = PlatformCaptionRules.Serialize(new[]
        {
            Cue(0, 2000, "Chào mừng"),
            Cue(2000, 6000, "khóa học dữ liệu"),
            Cue(6000, 9000, "[nhạc nền]"),
            Cue(10_000, 12_000, "marketing"),
        });
        context.PlatformAssetCaptions.Add(new PlatformAssetCaption
        {
            AssetId = video.Id, Language = PlatformCatalog.Captions.Vietnamese, Status = Statuses.PlatformAssetCaption.Ready,
            Source = PlatformCatalog.Captions.SourceManual, DraftCues = cues,
            PublishedCues = publishCaptions ? cues : null, PublishedAt = publishCaptions ? DateTimeOffset.UtcNow : null,
        });
        await context.SaveChangesAsync();
        var world = new World { Context = context, Video = video, Signs = new Dictionary<string, SignGloss>() };
        world.Storage.Files[video.StorageKey] = new byte[4096];
        world.Signs["chào mừng"] = await world.AddSignAsync("chào mừng");
        world.Signs["khóa học"] = await world.AddSignAsync("khóa học");
        world.Signs["dữ liệu"] = await world.AddSignAsync("dữ liệu", withVideo: false);
        return world;
    }

    // ----- Prerequisites -----------------------------------------------------------------------

    [Fact]
    public async Task ATrackAnalysedFromTheOldPublishedCaptions_IsToldWhenTheSavedTranscriptDiffers()
    {
        await using var world = await CreateWorldAsync();
        var analysed = await world.AnalyzeAsync(SignVideo.CaptionSource.Published);
        analysed.CaptionsChanged.Should().BeFalse("lời thoại đã lưu giống bản đã xuất bản");

        var caption = world.Context.PlatformAssetCaptions.Single();
        caption.DraftCues = PlatformCaptionRules.Serialize(new[] { new CaptionCueDto { StartMs = 0, EndMs = 1500, Text = "Chào mừng" } });
        await world.Context.SaveChangesAsync();

        (await world.GetAsync()).CaptionsChanged.Should().BeTrue("bước 1 giờ là bản lời thoại đã lưu: phân tích lại sẽ đọc nó");
    }

    [Fact]
    public async Task WithoutCaptions_NothingIsMade_AndTheAdminIsToldWhatToDoFirst()
    {
        await using var world = await CreateWorldAsync(publishCaptions: false);

        var none = await world.GetAsync();
        none.Status.Should().Be("NONE");
        none.Prerequisites.HasPublishedCaptions.Should().BeFalse();
        none.Prerequisites.HasDraftCaptions.Should().BeTrue();
        none.Prerequisites.UsableSigns.Should().Be(2);
        none.Prerequisites.RendererAvailable.Should().BeTrue();
        none.Prerequisites.AvatarRendererAvailable.Should().BeTrue("máy chủ chỉ cần FFmpeg để ghép nhân vật do trình duyệt dựng");
        none.Prerequisites.UsableMotionSigns.Should().Be(0, "chưa ký hiệu nào có chuyển động");

        var published = () => world.AnalyzeAsync();
        var error = (await published.Should().ThrowAsync<BadRequestException>()).Which;
        error.Errors.Single().Code.Should().Be(SignVideo.Errors.CaptionNotPublished);

        // The transcript last saved: what the builder always uses now (PUBLISHED stays for tracks analysed before).
        (await world.AnalyzeAsync(SignVideo.CaptionSource.Draft)).Settings!.CaptionSource.Should().Be(SignVideo.CaptionSource.Draft);
    }

    [Fact]
    public async Task OnlyLessonVideosWithCaptionsAndAFile_CanBeAnalysed()
    {
        await using var notInLesson = await CreateWorldAsync(inLesson: false);
        var outside = () => notInLesson.AnalyzeAsync();
        (await outside.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.NotALessonVideo);

        await using var world = await CreateWorldAsync();
        world.Context.PlatformAssetCaptions.RemoveRange(world.Context.PlatformAssetCaptions);
        await world.Context.SaveChangesAsync();
        var noCaptions = () => world.AnalyzeAsync();
        var error = (await noCaptions.Should().ThrowAsync<BadRequestException>()).Which;
        error.Errors.Single().Code.Should().Be(SignVideo.Errors.CaptionNotFound);
        error.Message.Should().Be("Hãy tạo lời thoại của video (bước 1) trước khi tạo video ngôn ngữ ký hiệu.");

        await using var missingFile = await CreateWorldAsync();
        missingFile.Storage.Files.Remove(missingFile.Video.StorageKey);
        var unreadable = () => missingFile.AnalyzeAsync();
        (await unreadable.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.VideoUnreadable);
    }

    // ----- Analysis, missing signs, manual mapping ---------------------------------------------

    [Fact]
    public async Task Analysis_ReportsWhatIsMissingAndWhy_AndCannotRenderUntilEverySignIsUsable()
    {
        await using var world = await CreateWorldAsync();
        var map = await world.AnalyzeAsync();

        map.Status.Should().Be(TrackStatus.MissingGlosses);
        map.Segments.Should().HaveCount(4);
        map.Segments[0].Items.Single().Should().Match<SignItemDto>(i => i.Gloss == "chào mừng" && i.Availability == SignVideoRules.Ok && i.MatchType == SignVideo.Match.ExactSentence);
        map.Segments[1].Items.Select(i => (i.SourceText, i.Availability)).Should().Equal(("khóa học", SignVideoRules.Ok), ("dữ liệu", SignVideoRules.NoVideo));
        map.Segments[2].NonSpeech.Should().BeTrue("[nhạc nền] không phải lời nói");
        map.Segments[3].Items.Single().Availability.Should().Be(SignVideoRules.MissingSign);
        map.Summary.Should().Match<SignVideoSummaryDto>(s => s.SignedItems == 2 && s.MissingItems == 1 && s.UnavailableItems == 1 && s.ReadySegments == 1);
        map.Missing.Select(m => (m.Text, m.Reason)).Should().BeEquivalentTo(new[]
        {
            ("dữ liệu", "Đã có từ trong từ điển nhưng chưa có video"),
            ("marketing", "Chưa có trong từ điển"),
        });
        map.RenderBlockers.Should().Contain("Không thể tạo video ký hiệu vì câu số 4 chưa có ký hiệu cho “marketing”.");
        map.Segments[1].Items[0].StartMs.Should().Be(2000, "thời điểm ước tính theo phụ đề");

        var render = () => world.RenderAsync(map.TrackId!.Value);
        (await render.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.MediaMissing);
        world.Queued.Should().BeEmpty("không tạo việc dựng khi còn thiếu ký hiệu");
        world.Context.PlatformAssetCaptions.AsNoTracking().Single().PublishedCues.Should().Contain("marketing", "phụ đề không bị sửa");
    }

    [Fact]
    public async Task ManualMapping_PicksSignsSkipsWordsAndReviews_ThenTheMapIsReadyToRender()
    {
        await using var world = await CreateWorldAsync();
        var map = await world.AnalyzeAsync();
        var trackId = map.TrackId!.Value;
        // Two meanings of the word, both with a video: the matcher picks neither, the reviewer does.
        var data = await world.AddSignAsync("dữ liệu (tin học)");
        await world.AddSignAsync("dữ liệu (thống kê)");

        // Approving a sentence that still has a word without a sign is refused.
        var approveMissing = () => world.SaveAsync(trackId, new SignSegmentInput { Index = 3, ReviewStatus = SignVideo.Review.Approved });
        (await approveMissing.Should().ThrowAsync<BadRequestException>()).Which.Message.Should().Contain("“marketing” chưa có ký hiệu");

        var saved = await world.SaveAsync(trackId,
            new SignSegmentInput
            {
                Index = 1,
                Items = new()
                {
                    new SignItemInput { SourceText = "dữ liệu", GlossId = data.Id, DurationMs = 1500 },
                    new SignItemInput { SourceText = "khóa học", GlossId = world.Signs["khóa học"].Id },
                },
                ReviewStatus = SignVideo.Review.Approved,
                ReviewNote = "Đổi trật tự theo ngữ pháp ký hiệu",
            },
            new SignSegmentInput { Index = 3, Items = new() { new SignItemInput { SourceText = "marketing", Skipped = true } } },
            new SignSegmentInput { Index = 0, ReviewStatus = SignVideo.Review.Approved });

        var reordered = saved.Segments[1];
        reordered.Items.Select(i => i.Gloss).Should().Equal("dữ liệu (tin học)", "khóa học");
        reordered.Items[0].Should().Match<SignItemDto>(i => i.IsManualOverride && i.MatchType == SignVideo.Match.Manual && i.DurationMs == 1500);
        reordered.Items[1].IsManualOverride.Should().BeFalse("chọn đúng ký hiệu tự tìm thì không tính là sửa tay");
        reordered.ReviewStatus.Should().Be(SignVideo.Review.Approved);
        reordered.ReviewNote.Should().Be("Đổi trật tự theo ngữ pháp ký hiệu");
        reordered.ReviewedAt.Should().NotBeNull();
        saved.Segments[3].Items.Single().Availability.Should().Be(SignVideoRules.SkippedSign);
        saved.Status.Should().Be(TrackStatus.ReadyToRender);
        saved.RenderBlockers.Should().BeEmpty();
        saved.PublishBlockers.Should().Contain(m => m.StartsWith("Chưa dựng video ký hiệu"));

        // Changing an approved sentence sends it back to review.
        var changed = await world.SaveAsync(trackId, new SignSegmentInput { Index = 0, Items = new() { new SignItemInput { SourceText = "Chào mừng", Skipped = true } } });
        changed.Segments[0].ReviewStatus.Should().Be(SignVideo.Review.Pending);

        // A sign that is not in the dictionary cannot be chosen.
        var unknown = () => world.SaveAsync(trackId, new SignSegmentInput { Index = 0, Items = new() { new SignItemInput { SourceText = "x", GlossId = Guid.NewGuid() } } });
        (await unknown.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.GlossNotFound);
    }

    [Fact]
    public async Task Reanalysis_KeepsManualChoicesAndReviews_AndFindsSignsAddedSince()
    {
        await using var world = await CreateWorldAsync();
        var map = await world.AnalyzeAsync();
        var trackId = map.TrackId!.Value;
        await world.SaveAsync(trackId, new SignSegmentInput { Index = 0, ReviewStatus = SignVideo.Review.Approved });
        await world.AddSignAsync("marketing");

        var again = await world.AnalyzeAsync();

        again.TrackId.Should().Be(trackId);
        again.Segments[0].ReviewStatus.Should().Be(SignVideo.Review.Approved, "câu không đổi giữ kết quả duyệt");
        again.Segments[3].Items.Single().Availability.Should().Be(SignVideoRules.Ok, "ký hiệu mới thêm được tìm lại");
    }

    // ----- Render, preview, publish, learners -------------------------------------------------

    private static async Task<(World World, Guid TrackId)> ReadyToRenderAsync()
    {
        var world = await CreateWorldAsync();
        var map = await world.AnalyzeAsync();
        var trackId = map.TrackId!.Value;
        await world.AddSignAsync("marketing");
        var data = world.Context.SignGlosses.Single(g => g.Gloss == "dữ liệu");
        await world.SaveAsync(trackId, new SignSegmentInput
        {
            Index = 1,
            Items = new() { new SignItemInput { SourceText = "khóa học" }, new SignItemInput { SourceText = "dữ liệu", Skipped = true } },
        });
        await world.AnalyzeAsync();
        _ = data;
        return (world, trackId);
    }

    [Fact]
    public async Task Render_RunsInTheBackground_StoresARealOutputAsANewAsset_AndOnlyOnce()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;

        var started = await world.RenderAsync(trackId);
        started.Status.Should().Be(TrackStatus.Rendering);
        started.ProgressStage.Should().Be(SignVideo.Stage.Queued, "người dùng thấy việc đang chờ đến lượt");
        started.ProgressDetail.Should().NotBeNullOrEmpty();
        started.RenderStartedAt.Should().NotBeNull();
        world.Queued.Should().ContainSingle();
        (await world.RenderAsync(trackId)).Status.Should().Be(TrackStatus.Rendering);
        world.Queued.Should().ContainSingle("bấm lại khi đang dựng không tạo việc trùng");
        var edit = () => world.SaveAsync(trackId, new SignSegmentInput { Index = 0, ReviewStatus = SignVideo.Review.Approved });
        (await edit.Should().ThrowAsync<ConflictException>()).Which.Code.Should().Be(SignVideo.Errors.JobAlreadyRunning);
        (await world.StatusAsync(trackId)).Status.Should().Be(TrackStatus.Rendering);
        var previewBefore = () => world.PreviewAsync(trackId);
        await previewBefore.Should().ThrowAsync<NotFoundException>();

        await world.RunQueuedAsync();

        var ready = await world.GetAsync();
        ready.Status.Should().Be(TrackStatus.Ready);
        ready.Progress.Should().Be(100);
        ready.ProgressStage.Should().BeNull("xong thì không còn bước đang chạy");
        ready.Output!.ContentType.Should().Be("video/mp4");
        ready.Output.DurationMs.Should().Be(12_000);
        ready.OutputOutdated.Should().BeFalse();
        var asset = world.Context.PlatformAssets.AsNoTracking().Single(a => a.Id == ready.Output.AssetId);
        asset.Kind.Should().Be(PlatformCatalog.AssetKind.Video);
        asset.FileName.Should().Be("bai-giang-du-lieu-ngon-ngu-ky-hieu.mp4");
        world.Storage.Files.Should().ContainKey(asset.StorageKey).WhoseValue.Should().HaveCount(2048);
        asset.StorageKey.Should().StartWith("platform-assets/sign-language/");

        var request = world.Renderer.Requests.Single();
        request.RenderMode.Should().Be(SignVideo.RenderMode.Overlay);
        request.Segments.Select(s => s.SegmentIndex).Should().Equal(0, 1, 3);
        request.Segments[1].Items.Select(i => i.GlossId).Should().Equal(world.Signs["khóa học"].Id);
        request.Clips.Should().HaveCount(3);
        ready.Segments[1].Items[0].TimingMeasured.Should().BeTrue("thời điểm thật sau khi dựng");
        world.Context.SignGlosses.AsNoTracking().Single(g => g.Id == world.Signs["khóa học"].Id).VideoDurationMs.Should().Be(1000);

        var preview = await world.PreviewAsync(trackId);
        preview.Url.Should().Contain($"platform/assets/{asset.Id}/content");

        // Same map, nothing to do; "Tạo lại video" renders again on purpose.
        (await world.RenderAsync(trackId)).Status.Should().Be(TrackStatus.Ready);
        world.Queued.Should().ContainSingle();
        (await world.RenderAsync(trackId, force: true)).Status.Should().Be(TrackStatus.Rendering);
        world.Queued.Should().HaveCount(2);
    }

    [Fact]
    public async Task Publish_NeedsACurrentOutputInStorageAndEverySentenceReviewed_ThenLearnersSeeIt()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;

        var notRendered = () => world.PublishAsync(trackId);
        (await notRendered.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.NotRendered);

        await world.RenderAsync(trackId);
        await world.RunQueuedAsync();
        var notReviewed = () => world.PublishAsync(trackId);
        var pending = (await notReviewed.Should().ThrowAsync<BadRequestException>()).Which;
        pending.Errors.Single().Code.Should().Be(SignVideo.Errors.ReviewPending);
        pending.Message.Should().Contain("Còn 3 câu chưa được duyệt");

        await world.SaveAsync(trackId,
            new SignSegmentInput { Index = 0, ReviewStatus = SignVideo.Review.Approved },
            new SignSegmentInput { Index = 1, ReviewStatus = SignVideo.Review.Approved },
            new SignSegmentInput { Index = 3, ReviewStatus = SignVideo.Review.Approved });

        // The file must really be there.
        var output = (await world.GetAsync()).Output!;
        var key = world.Context.PlatformAssets.AsNoTracking().Single(a => a.Id == output.AssetId).StorageKey;
        var bytes = world.Storage.Files[key];
        world.Storage.Files.Remove(key);
        var missingFile = () => world.PublishAsync(trackId);
        (await missingFile.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.OutputInvalid);
        world.Storage.Files[key] = bytes;

        var published = await world.PublishAsync(trackId);
        published.Status.Should().Be(TrackStatus.Published);
        published.Published!.AssetId.Should().Be(output.AssetId);
        published.HasUnpublishedChanges.Should().BeFalse();
        world.Audit.Verify(a => a.LogAsync("PLATFORM_SIGN_VIDEO_PUBLISHED", "platform_sign_language_tracks", trackId, null, It.IsAny<object>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);

        // Learners get it with the lesson video, and only that: the transcript it was made from is not sent.
        var lessonId = Guid.NewGuid();
        world.Context.LearningMaterials.Add(new LearningMaterial { LessonId = lessonId, Title = "Video", MaterialType = "LINK", ExternalUrl = $"platform-asset:{world.Video.Id:D}", SortOrder = 1 });
        await world.Context.SaveChangesAsync();
        var media = (await new LearningContentReader(world.Context, world.Urls).MediaAsync(new[] { lessonId }))[lessonId].Single();
        media.SignLanguage!.Mode.Should().Be(SignVideo.RenderMode.Overlay);
        media.SignLanguage.Url.Should().Contain($"platform/assets/{output.AssetId}/content");
        System.Text.Json.JsonSerializer.Serialize(media).Should().NotContain("Chào mừng");

        // A new draft does not change what learners see until it is published; "Hủy bản nháp" brings it back.
        var edited = await world.SaveAsync(trackId, new SignSegmentInput { Index = 0, Items = new() { new SignItemInput { SourceText = "Chào mừng", Skipped = true } } });
        edited.Status.Should().Be(TrackStatus.ReadyToRender);
        edited.HasUnpublishedChanges.Should().BeTrue();
        edited.Published!.AssetId.Should().Be(output.AssetId);
        var stillPublished = (await new LearningContentReader(world.Context, world.Urls).MediaAsync(new[] { lessonId }))[lessonId].Single();
        stillPublished.SignLanguage!.Url.Should().Contain(output.AssetId.ToString());
        var restored = await world.DiscardAsync(trackId);
        restored.Status.Should().Be(TrackStatus.Published);
        restored.Segments[0].Items.Single().Skipped.Should().BeFalse();
    }

    [Fact]
    public async Task AFailedRender_IsExplained_KeepsNoOutput_AndCanBeRetried()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;
        world.Renderer.Failure = new SignRenderException(SignVideo.Errors.VideoUnreadable, "Không đọc được video của ký hiệu “khóa học”.");

        await world.RenderAsync(trackId);
        await world.RunQueuedAsync();

        var failed = await world.GetAsync();
        failed.Status.Should().Be(TrackStatus.Failed);
        failed.ErrorCode.Should().Be(SignVideo.Errors.VideoUnreadable);
        failed.ProgressStage.Should().Be(SignVideo.Stage.Composing, "giữ bước bị lỗi để người dùng biết lỗi ở đâu");
        failed.ErrorMessage.Should().Be("Không đọc được video của ký hiệu “khóa học”.");
        failed.Output.Should().BeNull("không có tệp thì không báo thành công");
        world.Context.PlatformAssets.AsNoTracking().Count(a => a.FileName.EndsWith("ngon-ngu-ky-hieu.mp4")).Should().Be(0);
        var publish = () => world.PublishAsync(trackId);
        await publish.Should().ThrowAsync<BadRequestException>();

        world.Renderer.Failure = new InvalidOperationException("ffmpeg crashed at /home/secret/path");
        await world.RetryAsync(trackId);
        await world.RunQueuedAsync();
        var crashed = await world.GetAsync();
        crashed.ErrorCode.Should().Be(SignVideo.Errors.RenderFailed);
        crashed.ErrorMessage.Should().NotContain("/home").And.Contain("mã việc");

        world.Renderer.Failure = null;
        (await world.RetryAsync(trackId)).Status.Should().Be(TrackStatus.Rendering);
        await world.RunQueuedAsync();
        (await world.GetAsync()).Status.Should().Be(TrackStatus.Ready);
        var retryReady = () => world.RetryAsync(trackId);
        await retryReady.Should().ThrowAsync<ConflictException>("chỉ thử lại khi lần dựng trước lỗi");
    }

    [Fact]
    public async Task WithoutARenderer_NothingIsQueued_AndTheAvatarIsNeverComposedWithoutAnUploadedTrack()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;
        world.Renderer.Available = false;

        var render = () => world.RenderAsync(trackId);
        var error = (await render.Should().ThrowAsync<BadRequestException>()).Which;
        error.Errors.Single().Code.Should().Be(SignVideo.Errors.RendererNotConfigured);
        error.Message.Should().Be("Máy chủ chưa cài FFmpeg.");
        world.Queued.Should().BeEmpty();

        world.Renderer.Available = true;
        var avatar = await world.AnalyzeAsync(renderer: SignVideo.Renderer.Avatar);
        avatar.RenderBlockers.Should().Contain(b => b.Contains("chưa có chuyển động cho nhân vật 3D"));
        foreach (var sign in world.Context.SignGlosses.Where(g => g.VideoAssetId != null))
        {
            sign.MotionData = new byte[650];
            sign.MotionFps = 20;
            sign.MotionFrames = 1;
        }

        await world.Context.SaveChangesAsync();
        (await world.GetAsync()).RenderBlockers.Should().BeEmpty();
        var renderAvatar = () => world.RenderAsync(trackId);
        (await renderAvatar.Should().ThrowAsync<BadRequestException>("nhân vật do trình duyệt dựng: chưa tải track lên thì không có video"))
            .Which.Errors.Single().Code.Should().Be(SignVideo.Errors.AvatarTrackMissing);
        world.Queued.Should().BeEmpty();
    }

    // ----- One character per video ---------------------------------------------------------

    [Fact]
    public async Task ClipsOfSeveralSigners_AreRefused_BecauseAVideoShowsOneCharacterOnly()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;
        world.Context.SignGlosses.Single(g => g.Gloss == "khóa học").SignerName = "Người ra dấu B";
        await world.Context.SaveChangesAsync();

        var map = await world.GetAsync();
        map.RenderBlockers.Should().Contain(b => b.Contains("chỉ được có một nhân vật") && b.Contains("2 người khác nhau"));
        var render = () => world.RenderAsync(trackId);
        (await render.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.SignerMixed);

        // A signer not recorded cannot be shown to be the same person either.
        world.Context.SignGlosses.Single(g => g.Gloss == "khóa học").SignerName = null;
        await world.Context.SaveChangesAsync();
        (await world.GetAsync()).RenderBlockers.Should().Contain(b => b.Contains("chưa ghi người ra dấu của “khóa học”"));

        // Same person everywhere: allowed. The avatar is always one character, whoever signed the source videos.
        world.Context.SignGlosses.Single(g => g.Gloss == "khóa học").SignerName = "người ra dấu a";
        await world.Context.SaveChangesAsync();
        (await world.GetAsync()).RenderBlockers.Should().BeEmpty();
        SignVideoRules.SignerProblem(Array.Empty<SignSegmentState>(), new Dictionary<Guid, SignDictionaryEntry>()).Should().BeNull();
    }

    [Fact]
    public async Task TheAvatar_IsComposedOnlyFromATrackRenderedForTheCurrentMap_OnTheLessonFrameGrid()
    {
        await using var world = await CreateWorldAsync();
        foreach (var sign in world.Context.SignGlosses.Where(g => g.VideoAssetId != null))
        {
            sign.MotionData = new byte[650];
            sign.MotionFps = 20;
            sign.MotionFrames = 1;
            sign.SignerName = null; // the avatar does not show the people of the source videos
        }

        await world.Context.SaveChangesAsync();
        var map = await world.AnalyzeAsync(renderer: SignVideo.Renderer.Avatar);
        var trackId = map.TrackId!.Value;
        await world.AddSignAsync("marketing", withMotion: true, signer: "Người ra dấu C");
        await world.SaveAsync(trackId, new SignSegmentInput
        {
            Index = 1,
            Items = new() { new SignItemInput { SourceText = "khóa học" }, new SignItemInput { SourceText = "dữ liệu", Skipped = true } },
        });
        await world.AnalyzeAsync(renderer: SignVideo.Renderer.Avatar);

        var job = await world.AvatarJobAsync(trackId);
        job.FrameRate.Should().Be("25");
        job.FrameCount.Should().Be(300);
        job.Transparent.Should().BeTrue("góc trái dưới: nhân vật không nền, phủ thẳng lên video");
        job.Side.Should().Be("LEFT");
        job.Width.Should().Be(432);
        job.Segments.Select(s => s.Index).Should().Equal(0, 1, 3);
        job.Segments[1].Items.Select(i => (i.SourceText, i.GlossId != null)).Should().Equal(("khóa học", true), ("dữ liệu", false));
        job.Signs.Should().HaveCount(3);

        var stale = () => world.UploadAvatarAsync(trackId, "another-map");
        (await stale.Should().ThrowAsync<ConflictException>()).Which.Code.Should().Be(SignVideo.Errors.AvatarTrackOutdated);
        var wrongRate = () => world.UploadAvatarAsync(trackId, job.Fingerprint, frameRate: "30");
        (await wrongRate.Should().ThrowAsync<BadRequestException>("một khung nhân vật cho mỗi khung video bài giảng")).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.AvatarTrackInvalid);
        var wrongFrames = () => world.UploadAvatarAsync(trackId, job.Fingerprint, frames: 250);
        (await wrongFrames.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.AvatarTrackInvalid);
        var onABackground = () => world.UploadAvatarAsync(trackId, job.Fingerprint, transparent: false);
        (await onABackground.Should().ThrowAsync<BadRequestException>("trang mở từ trước vẫn dựng nhân vật trên nền màu")).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.AvatarTrackInvalid);
        var overlapping = () => world.UploadAvatarAsync(trackId, job.Fingerprint, placements: new()
        {
            new() { SegmentIndex = 0, ItemIndex = 0, StartMs = 0, EndMs = 1500 },
            new() { SegmentIndex = 1, ItemIndex = 0, StartMs = 1000, EndMs = 2500 },
        });
        await overlapping.Should().ThrowAsync<BadRequestException>();
        var skippedWord = () => world.UploadAvatarAsync(trackId, job.Fingerprint, placements: new()
        {
            new() { SegmentIndex = 1, ItemIndex = 1, StartMs = 3000, EndMs = 3500 },
        });
        await skippedWord.Should().ThrowAsync<BadRequestException>("từ đã bỏ qua không được ra dấu");
        world.Queued.Should().BeEmpty();

        var started = await world.UploadAvatarAsync(trackId, job.Fingerprint, placements: new()
        {
            new() { SegmentIndex = 0, ItemIndex = 0, StartMs = 150, EndMs = 1900, Speed = 1.1, SourceMs = 1900 },
            new() { SegmentIndex = 1, ItemIndex = 0, StartMs = 2100, EndMs = 3300, Speed = 1, SourceMs = 1200 },
            new() { SegmentIndex = 3, ItemIndex = 0, StartMs = 10_000, EndMs = 11_200, Speed = 1, SourceMs = 1200 },
        });
        started.Status.Should().Be(TrackStatus.Rendering);
        world.Queued.Should().ContainSingle();

        await world.RunQueuedAsync();
        var ready = await world.GetAsync();
        ready.Status.Should().Be(TrackStatus.Ready);
        ready.Output.Should().NotBeNull();
        world.AvatarRenderer.Requests.Single().Fingerprint.Should().Be(job.Fingerprint);
        ready.Segments[1].Items[0].StartMs.Should().Be(2100, "vị trí ký hiệu do trình duyệt xếp hiện trong bản đồ");
        ready.Segments[1].Items[0].TimingMeasured.Should().BeTrue();
        world.AvatarTracks.Tracks.Should().BeEmpty("track nhân vật đã dùng xong thì xóa");

        // A motion taken again changes the avatar video: the output is outdated.
        world.Context.SignGlosses.Single(g => g.Gloss == "khóa học").MotionFrames = 2;
        await world.Context.SaveChangesAsync();
        (await world.GetAsync()).OutputOutdated.Should().BeTrue();
    }

    [Fact]
    public async Task TheAvatar_UsesOnlyMotionsTakenFromVideosWhoseRightsAreRecorded()
    {
        await using var world = await CreateWorldAsync();
        var unlicensed = await world.AddSignAsync("chào", licensed: false, withMotion: true);
        var entry = (await SignDictionaryLoader.ByIdsAsync(world.Context, new[] { unlicensed.Id }))[unlicensed.Id];

        SignVideoRules.Availability(new SignSequenceItem { SourceText = "chào", GlossId = unlicensed.Id }, entry, SignVideo.Renderer.Avatar)
            .Should().Be(SignVideoRules.NoLicense);
    }

    [Fact]
    public async Task ALostRender_IsShownAsTimedOut_AndMayBeRetried()
    {
        var (world, trackId) = await ReadyToRenderAsync();
        await using var _ = world;
        await world.RenderAsync(trackId);
        var retryWhileRunning = () => world.RetryAsync(trackId);
        (await retryWhileRunning.Should().ThrowAsync<ConflictException>()).Which.Code.Should().Be(SignVideo.Errors.JobAlreadyRunning);

        world.Clock.Advance(SignVideo.StaleAfter + TimeSpan.FromMinutes(1));
        var status = await world.StatusAsync(trackId);
        status.Stale.Should().BeTrue();
        status.ErrorCode.Should().Be(SignVideo.Errors.JobTimeout);
        (await world.RetryAsync(trackId)).Status.Should().Be(TrackStatus.Rendering);
        world.Queued.Should().HaveCount(2);
    }

    [Fact]
    public async Task DiscardingANeverPublishedDraft_RemovesIt()
    {
        await using var world = await CreateWorldAsync();
        var map = await world.AnalyzeAsync();

        var none = await world.DiscardAsync(map.TrackId!.Value);

        none.Status.Should().Be("NONE");
        world.Context.PlatformSignLanguageSegments.Should().BeEmpty();
        world.Context.PlatformAssetCaptions.Should().ContainSingle("phụ đề không bị đụng tới");
    }

    // ----- Worker queue and permissions --------------------------------------------------------

    [Fact]
    public void TheQueue_DoesNotHoldTheSameRenderTwice()
    {
        var queue = new SignVideoJobQueue();
        var id = Guid.NewGuid();
        queue.Enqueue(id);
        queue.Enqueue(id);
        queue.Reader.TryRead(out _).Should().BeTrue();
        queue.Reader.TryRead(out _).Should().BeFalse();
        queue.Done(id);
        queue.Enqueue(id);
        queue.Reader.TryRead(out _).Should().BeTrue();
    }

    [Theory]
    [InlineData("GET", "api/v1/platform/assets/{assetId:guid}/sign-language")]
    [InlineData("POST", "api/v1/platform/assets/{assetId:guid}/sign-language/analyze")]
    [InlineData("PUT", "api/v1/platform/sign-language/{trackId:guid}/segments")]
    [InlineData("POST", "api/v1/platform/sign-language/{trackId:guid}/render")]
    [InlineData("GET", "api/v1/platform/sign-language/{trackId:guid}/status")]
    [InlineData("GET", "api/v1/platform/sign-language/{trackId:guid}/preview")]
    [InlineData("POST", "api/v1/platform/sign-language/{trackId:guid}/publish")]
    [InlineData("POST", "api/v1/platform/sign-language/{trackId:guid}/retry")]
    [InlineData("DELETE", "api/v1/platform/sign-language/{trackId:guid}/draft")]
    [InlineData("GET", "api/v1/platform/sign-glosses/match")]
    public void OnlyThePlatformAdmin_ReachesTheSignVideoApi(string verb, string route)
    {
        var endpoint = EndpointCatalog.Find(verb, route);
        endpoint.Permissions.Should().ContainSingle().Which.Should().BeOneOf(Permissions.Platform.CatalogRead, Permissions.Platform.CatalogManage);
        if (verb != "GET") endpoint.Permissions.Should().Equal(Permissions.Platform.CatalogManage);
        EndpointCatalog.RoleCanCall(Roles.PlatformAdmin, endpoint).Should().BeTrue();
        foreach (var role in new[] { Roles.Owner, Roles.Manager, Roles.Employee, Roles.Mentor })
        {
            EndpointCatalog.RoleCanCall(role, endpoint).Should().BeFalse($"{role} không sửa nội dung khóa học");
        }
    }
}
