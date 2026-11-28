using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.AI;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using DigiTalent.Tests.Pulse;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Video captions for deaf and hard-of-hearing learners (docs/specs/2026-11-24-ai-video-captions.md, schema v3.11):
/// the AI draft made on request, editing, publishing, what learners receive and the Gemini Files API flow.
/// </summary>
public class PlatformCaptionTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private static CaptionCueDto Cue(int start, int end, string text) => new() { StartMs = start, EndMs = end, Text = text };

    // ----- Rules -------------------------------------------------------------------------------

    [Fact]
    public void CheckSaved_CleansTheText_AndRejectsEmptyOrOverlappingCues()
    {
        var cleaned = PlatformCaptionRules.CheckSaved(new[] { Cue(0, 1500, "  Xin   chào\r\n các bạn "), Cue(1500, 3000, "[nhạc nền]") });
        cleaned.Select(c => c.Text).Should().Equal("Xin chào\ncác bạn", "[nhạc nền]");

        var overlap = () => PlatformCaptionRules.CheckSaved(new[] { Cue(0, 2000, "Một"), Cue(1500, 3000, "Hai") });
        var error = overlap.Should().Throw<BadRequestException>().Which;
        error.Errors.Single().Code.Should().Be("INVALID_CAPTIONS");
        error.Message.Should().Contain("Câu 2");

        var empty = () => PlatformCaptionRules.CheckSaved(new[] { Cue(0, 1000, "   ") });
        empty.Should().Throw<BadRequestException>().WithMessage("*chưa có chữ*");
        var backwards = () => PlatformCaptionRules.CheckSaved(new[] { Cue(2000, 1000, "Ngược") });
        backwards.Should().Throw<BadRequestException>().WithMessage("*kết thúc phải sau*");
        var tooLong = () => PlatformCaptionRules.CheckSaved(new[] { Cue(0, 1000, new string('a', PlatformCatalog.Captions.MaxCueTextLength + 1)) });
        tooLong.Should().Throw<BadRequestException>();
    }

    [Fact]
    public void Normalize_SortsCutsOverlapsGuessesMissingEndsMergesTiesAndSplitsLongText()
    {
        var longText = string.Join(' ', Enumerable.Repeat("bảng tính", 20)); // 199 characters
        var cues = PlatformCaptionRules.Normalize(new[]
        {
            Cue(5000, 0, "Không có giờ kết thúc"),
            Cue(1000, 6000, "Chồng lên câu sau"),
            Cue(0, 900, "  "),
            Cue(9000, 9500, "Cùng lúc"),
            Cue(9000, 9800, "bắt đầu"),
            Cue(20_000, 30_000, longText),
        });

        cues.Should().OnlyContain(c => c.EndMs > c.StartMs && c.Text.Length <= PlatformCatalog.Captions.ReadableCueLength);
        cues[0].Should().BeEquivalentTo(Cue(1000, 5000, "Chồng lên câu sau"), "cắt ở lúc câu sau bắt đầu");
        cues[1].StartMs.Should().Be(5000);
        cues[1].EndMs.Should().BeInRange(6000, 9000, "đoán theo độ dài chữ");
        cues[2].Text.Should().Be("Cùng lúc bắt đầu");
        var pieces = cues.Where(c => c.StartMs >= 20_000).ToList();
        pieces.Should().HaveCountGreaterThan(1);
        pieces.First().StartMs.Should().Be(20_000);
        pieces.Last().EndMs.Should().Be(30_000);
        string.Join(' ', pieces.Select(p => p.Text)).Should().Be(longText);
        PlatformCaptionRules.CheckSaved(cues).Should().HaveCount(cues.Count, "kết quả của AI đã chuẩn hóa luôn lưu được");
    }

    [Theory]
    [InlineData("00:01.200", 1200)]
    [InlineData("1:02:03.5", 3723500)]
    [InlineData("12,5", 12500)]
    [InlineData("7", 7000)]
    [InlineData("02:05", 125000)]
    [InlineData("abc", null)]
    [InlineData("-1", null)]
    [InlineData("1:2:3:4", null)]
    public void ParseTime_ReadsTheTimeFormatsGeminiUses(string text, int? expected) =>
        GeminiCaptionTranscriber.ParseTime(text).Should().Be(expected);

    [Fact]
    public void ParseAnswer_ReadsObjectsArraysAndNumbers_AndRefusesBrokenJson()
    {
        var cues = GeminiCaptionTranscriber.ParseAnswer("""
            ```json
            {"hasSpeech":true,"cues":[{"start":"00:00.500","end":"00:02.000","text":"Xin chào"},{"start":"x","end":"1","text":"bỏ"},{"start":3,"end":4.25,"text":"[nhạc nền]"}]}
            ```
            """);
        cues.Should().BeEquivalentTo(new[] { Cue(500, 2000, "Xin chào"), Cue(3000, 4250, "[nhạc nền]") }, o => o.WithStrictOrdering());

        GeminiCaptionTranscriber.ParseAnswer("""{"hasSpeech":false,"cues":[]}""").Should().BeEmpty();
        GeminiCaptionTranscriber.ParseAnswer("""[{"start":"1","end":"2","text":"a"}]""").Should().HaveCount(1);
        var broken = () => GeminiCaptionTranscriber.ParseAnswer("{\"cues\": [");
        broken.Should().Throw<CaptionTranscriptionException>().Which.Code.Should().Be("AI_BAD_RESPONSE");
    }

    // ----- Use cases ---------------------------------------------------------------------------

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public required PlatformAsset Video { get; init; }
        public required PlatformAsset Image { get; init; }
        public Mock<ICaptionTranscriber> Transcriber { get; } = new();
        public List<Guid> Queued { get; } = new();
        public Mock<IFileStorageService> Storage { get; } = new();
        public TimeProvider Time { get; set; } = TimeProvider.System;

        public ICurrentUser User
        {
            get
            {
                var user = new Mock<ICurrentUser>();
                user.Setup(u => u.UserId).Returns(AdminId);
                return user.Object;
            }
        }

        public ICaptionJobQueue Queue
        {
            get
            {
                var queue = new Mock<ICaptionJobQueue>();
                queue.Setup(q => q.Enqueue(It.IsAny<Guid>())).Callback<Guid>(Queued.Add);
                return queue.Object;
            }
        }

        public Task<PlatformAssetCaptionsDto> GetAsync(Guid assetId) =>
            new GetPlatformAssetCaptionsUseCase(Context, Transcriber.Object).ExecuteAsync(new GetPlatformAssetCaptionsUseCaseInput { AssetId = assetId });

        public Task<PlatformAssetCaptionsDto> GenerateAsync(Guid assetId) =>
            new GeneratePlatformAssetCaptionsUseCase(Context, Transcriber.Object, Queue, User, Time)
                .ExecuteAsync(new GeneratePlatformAssetCaptionsUseCaseInput { AssetId = assetId });

        public Task<PlatformAssetCaptionsDto> SaveAsync(Guid assetId, params CaptionCueDto[] cues) =>
            new SavePlatformAssetCaptionsUseCase(Context, Transcriber.Object, User, Time)
                .ExecuteAsync(new SavePlatformAssetCaptionsUseCaseInput { AssetId = assetId, Cues = cues.ToList() });

        public Task ProcessAsync(Guid captionId) =>
            new PlatformCaptionProcessor(Context, Storage.Object, Transcriber.Object, NullLogger<PlatformCaptionProcessor>.Instance).ProcessAsync(captionId);

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private static async Task<World> CreateWorldAsync(AppDbContext? context = null)
    {
        context ??= new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var video = new PlatformAsset { Kind = PlatformCatalog.AssetKind.Video, FileName = "bai-giang.mp4", ContentType = "video/mp4", SizeBytes = 1024, StorageKey = $"v-{Guid.NewGuid():N}.mp4" };
        var image = new PlatformAsset { Kind = PlatformCatalog.AssetKind.Image, FileName = "anh.png", ContentType = "image/png", SizeBytes = 10, StorageKey = $"i-{Guid.NewGuid():N}.png" };
        context.PlatformAssets.AddRange(video, image);
        await context.SaveChangesAsync();
        var world = new World { Context = context, Video = video, Image = image };
        world.Transcriber.SetupGet(t => t.IsConfigured).Returns(true);
        world.Storage.Setup(s => s.DownloadAsync(video.StorageKey, It.IsAny<CancellationToken>())).ReturnsAsync(() => new MemoryStream(new byte[1024]));
        return world;
    }

    [Fact]
    public async Task Generate_RunsOnlyWhenAsked_ForAVideo_WithAKey_AndOneJobAtATime()
    {
        await using var world = await CreateWorldAsync();

        (await world.GetAsync(world.Video.Id)).Status.Should().Be("NONE");
        var image = () => world.GenerateAsync(world.Image.Id);
        (await image.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NOT_A_VIDEO");

        world.Transcriber.SetupGet(t => t.IsConfigured).Returns(false);
        var noKey = () => world.GenerateAsync(world.Video.Id);
        (await noKey.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("AI_NOT_CONFIGURED");
        world.Queued.Should().BeEmpty();

        world.Transcriber.SetupGet(t => t.IsConfigured).Returns(true);
        var started = await world.GenerateAsync(world.Video.Id);
        started.Status.Should().Be(CaptionStatus.Processing);
        world.Queued.Should().ContainSingle();

        var again = () => world.GenerateAsync(world.Video.Id);
        await again.Should().ThrowAsync<ConflictException>("AI đang tạo lời thoại");
        var edit = () => world.SaveAsync(world.Video.Id, Cue(0, 1000, "Sửa"));
        await edit.Should().ThrowAsync<ConflictException>("không sửa khi AI đang ghi đè bản nháp");

        // A job lost for more than an hour may be started again.
        world.Time = new ManualClock { Now = DateTimeOffset.UtcNow.AddHours(2) };
        await world.GenerateAsync(world.Video.Id);
        world.Queued.Should().HaveCount(2).And.OnlyContain(id => id == world.Queued[0]);
    }

    [Fact]
    public async Task Processor_StoresTheNormalizedAiDraft_OrRecordsTheFailureAndKeepsTheOldDraft()
    {
        await using var world = await CreateWorldAsync();
        world.Transcriber
            .Setup(t => t.TranscribeAsync(It.IsAny<CaptionMediaFile>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CaptionTranscript(new[] { Cue(2000, 4000, "Câu hai"), Cue(0, 2500, "Câu  một") }, "gemini-test"));

        await world.GenerateAsync(world.Video.Id);
        await world.ProcessAsync(world.Queued.Single());

        var ready = await world.GetAsync(world.Video.Id);
        ready.Status.Should().Be(CaptionStatus.Ready);
        ready.Source.Should().Be(PlatformCatalog.Captions.SourceAi);
        ready.Model.Should().Be("gemini-test");
        ready.DraftCues.Should().BeEquivalentTo(new[] { Cue(0, 2000, "Câu một"), Cue(2000, 4000, "Câu hai") }, o => o.WithStrictOrdering());
        world.Transcriber.Verify(t => t.TranscribeAsync(
            It.Is<CaptionMediaFile>(m => m.SizeBytes == 1024 && m.ContentType == "video/mp4"), It.IsAny<CancellationToken>()), Times.Once);

        world.Transcriber
            .Setup(t => t.TranscribeAsync(It.IsAny<CaptionMediaFile>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new CaptionTranscriptionException("AI_BUSY", "busy"));
        world.Context.ChangeTracker.Clear();
        await world.GenerateAsync(world.Video.Id);
        await world.ProcessAsync(world.Queued.Last());

        var failed = await world.GetAsync(world.Video.Id);
        failed.Status.Should().Be(CaptionStatus.Failed);
        failed.ErrorCode.Should().Be("AI_BUSY");
        failed.ErrorMessage.Should().Contain("quá tải");
        failed.DraftCues.Should().HaveCount(2, "lần AI lỗi không xóa bản nháp đang có");
    }

    [Fact]
    public async Task Processor_MarksAMissingVideoFile()
    {
        await using var world = await CreateWorldAsync();
        world.Storage.Setup(s => s.DownloadAsync(world.Video.StorageKey, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NotFoundException("missing"));

        await world.GenerateAsync(world.Video.Id);
        await world.ProcessAsync(world.Queued.Single());

        (await world.GetAsync(world.Video.Id)).ErrorCode.Should().Be("VIDEO_FILE_MISSING");
    }

    [Fact]
    public async Task Save_KeepsTheTranscriptForTheSignLanguageVideo_AndLearnersNeverReceiveIt()
    {
        await using var world = await CreateWorldAsync();

        // Typed by hand, without the AI.
        var saved = await world.SaveAsync(world.Video.Id, Cue(0, 1800, "Chào mừng"), Cue(2000, 4000, "[nhạc nền]"));
        saved.Status.Should().Be(CaptionStatus.Ready);
        saved.Source.Should().Be(PlatformCatalog.Captions.SourceManual);
        saved.DraftCues.Select(c => c.Text).Should().Equal("Chào mừng", "[nhạc nền]");
        var invalid = () => world.SaveAsync(world.Video.Id, Cue(0, 3000, "Một"), Cue(2000, 4000, "Hai"));
        (await invalid.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_CAPTIONS");
        (await world.SaveAsync(world.Video.Id, Cue(0, 1800, "Chào mừng các bạn"))).DraftCues.Single().Text.Should().Be("Chào mừng các bạn");

        // What a learner's lesson page receives: the video, never its transcript.
        var lessonId = Guid.NewGuid();
        world.Context.LearningMaterials.Add(
            new LearningMaterial { LessonId = lessonId, Title = "Video", MaterialType = "LINK", ExternalUrl = $"platform-asset:{world.Video.Id:D}", SortOrder = 1 });
        await world.Context.SaveChangesAsync();
        var signer = new PlatformAssetUrlSigner(new JwtSettings { SigningKey = "test-signing-key-for-platform-assets-0123456789" }, TimeProvider.System);
        var media = (await new LearningContentReader(world.Context, signer).MediaAsync(new[] { lessonId }))[lessonId];

        media.Should().ContainSingle(m => m.Kind == PlatformCatalog.AssetKind.Video);
        System.Text.Json.JsonSerializer.Serialize(media).Should().NotContain("Chào mừng", "người học không nhận phụ đề chữ");
    }

    [Fact]
    public async Task PublishCheck_SaysNothingAboutTranscripts()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await PlatformCatalogSeeder.SeedAsync(context);
        context.ChangeTracker.Clear();
        await using var world = await CreateWorldAsync(context);
        var sanitizer = new HtmlContentSanitizer();
        var editor = new PlatformCatalogEditor(context, sanitizer, world.User, TimeProvider.System);
        var reader = new PlatformCourseContentReader(context, new PlatformAssetUrlSigner(new JwtSettings { SigningKey = "test-signing-key-for-platform-assets-0123456789" }, TimeProvider.System));
        await new CreatePlatformCatalogDraftUseCase(context, editor, Mock.Of<IAuditService>()).ExecuteAsync(new CreatePlatformCatalogDraftUseCaseInput());
        var courseId = (await context.PlatformCourses.AsNoTracking().SingleAsync(c => c.Code == "M6-I")).Id;

        var withModule = await new AddPlatformCourseModuleUseCase(context, editor, reader)
            .ExecuteAsync(new AddPlatformCourseModuleUseCaseInput { VersionNo = 2, CourseId = courseId, Title = "Video bài giảng" });
        var withBlock = await new AddPlatformModuleBlockUseCase(context, editor, reader)
            .ExecuteAsync(new AddPlatformModuleBlockUseCaseInput { VersionNo = 2, CourseId = courseId, ModuleId = withModule.Modules.Last().ModuleId, Type = "VIDEO" });
        await new UpdatePlatformModuleBlockUseCase(context, editor, reader).ExecuteAsync(new UpdatePlatformModuleBlockUseCaseInput
        {
            VersionNo = 2, CourseId = courseId, BlockId = withBlock.Modules.Last().Blocks.Single().BlockId, AssetId = world.Video.Id,
        });

        var check = await new GetPlatformCatalogPublishCheckUseCase(editor, new PlatformPublishChecker(context, sanitizer))
            .ExecuteAsync(new GetPlatformCatalogPublishCheckUseCaseInput { VersionNo = 2 });
        check.Items.Should().NotContain(i => i.Message.Contains("phụ đề") || i.Message.Contains("lời thoại"), "lời thoại chỉ là đầu vào của video ký hiệu");
    }

    // ----- Gemini Files API --------------------------------------------------------------------

    [Fact]
    public async Task Gemini_UploadsTheVideo_AsksForCaptionsAtLowResolution_AndDeletesTheFile()
    {
        var handler = new RouteHandler();
        var transcriber = Transcriber(handler);

        var transcript = await transcriber.TranscribeAsync(new CaptionMediaFile(new MemoryStream(new byte[2048]), 2048, "video/mp4", "bai-giang.mp4"));

        transcript.Model.Should().Be("gemini-test");
        transcript.Cues.Select(c => c.Text).Should().Equal("Xin chào", "[nhạc nền]");
        handler.Calls.Select(c => c.Method + " " + c.Path).Should().Equal(
            "POST /upload/v1beta/files",
            "POST /session-1",
            "POST /v1beta/models/gemini-test:generateContent",
            "DELETE /v1beta/files/abc");
        handler.Calls[0].Headers["X-Goog-Upload-Header-Content-Length"].Should().Be("2048");
        handler.Calls[1].ContentLength.Should().Be(2048);
        var generate = JsonNode.Parse(handler.Calls[2].Body)!;
        generate["contents"]![0]!["parts"]![0]!["fileData"]!["fileUri"]!.GetValue<string>().Should().Be("https://generativelanguage.googleapis.com/v1beta/files/abc");
        generate["generationConfig"]!["mediaResolution"]!.GetValue<string>().Should().Be("MEDIA_RESOLUTION_LOW");
        generate["generationConfig"]!["responseSchema"]!["required"]!.AsArray().Select(n => n!.GetValue<string>()).Should().Contain("cues");
    }

    [Fact]
    public async Task Gemini_AsksAgainWithoutMediaResolution_WhenTheModelRejectsIt_AndStillDeletesOnFailure()
    {
        var handler = new RouteHandler { GenerateStatuses = new Queue<HttpStatusCode>(new[] { HttpStatusCode.BadRequest, HttpStatusCode.OK }) };
        var transcript = await Transcriber(handler).TranscribeAsync(new CaptionMediaFile(new MemoryStream(new byte[16]), 16, "video/mp4", "a.mp4"));
        transcript.Cues.Should().HaveCount(2);
        var generates = handler.Calls.Where(c => c.Path.EndsWith(":generateContent")).ToList();
        generates.Should().HaveCount(2);
        JsonNode.Parse(generates[1].Body)!["generationConfig"]!["mediaResolution"].Should().BeNull();

        var refused = new RouteHandler { GenerateStatuses = new Queue<HttpStatusCode>(new[] { HttpStatusCode.Forbidden }) };
        var act = () => Transcriber(refused).TranscribeAsync(new CaptionMediaFile(new MemoryStream(new byte[16]), 16, "video/mp4", "a.mp4"));
        (await act.Should().ThrowAsync<CaptionTranscriptionException>()).Which.Code.Should().Be("AI_KEY_REJECTED");
        refused.Calls.Last().Method.Should().Be("DELETE", "tệp tạm trên Gemini luôn được xóa");
    }

    [Fact]
    public async Task Gemini_MovesOnFromARetiredModel_ToTheAssistantModel_AndNamesTheProblemWhenNoneIsLeft()
    {
        IConfiguration Config(string? assistantModel) => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Gemini:ApiKey"] = "test-key",
            ["Gemini:Model"] = "gemini-retired",
            ["Assistant:Provider"] = "Gemini",
            ["Assistant:Model"] = assistantModel,
        }).Build();

        // "This model … is no longer available to new users" → 404, then the assistant's model answers.
        var handler = new RouteHandler { GenerateStatuses = new Queue<HttpStatusCode>(new[] { HttpStatusCode.NotFound, HttpStatusCode.OK }) };
        var transcript = await new GeminiCaptionTranscriber(new HttpClient(handler), Config("gemini-assistant"), NullLogger<GeminiCaptionTranscriber>.Instance)
            .TranscribeAsync(new CaptionMediaFile(new MemoryStream(new byte[16]), 16, "video/mp4", "a.mp4"));
        transcript.Model.Should().Be("gemini-assistant");
        handler.Calls.Where(c => c.Path.EndsWith(":generateContent")).Select(c => c.Path)
            .Should().Equal("/v1beta/models/gemini-retired:generateContent", "/v1beta/models/gemini-assistant:generateContent");

        var allGone = new RouteHandler { GenerateStatuses = new Queue<HttpStatusCode>(Enumerable.Repeat(HttpStatusCode.NotFound, 10)) };
        var act = () => new GeminiCaptionTranscriber(new HttpClient(allGone), Config(null), NullLogger<GeminiCaptionTranscriber>.Instance)
            .TranscribeAsync(new CaptionMediaFile(new MemoryStream(new byte[16]), 16, "video/mp4", "a.mp4"));
        (await act.Should().ThrowAsync<CaptionTranscriptionException>()).Which.Code.Should().Be("AI_MODEL_UNAVAILABLE");
        PlatformCaptionRules.ErrorMessage("AI_MODEL_UNAVAILABLE").Should().Contain("Gemini:CaptionModel");
    }

    private static GeminiCaptionTranscriber Transcriber(RouteHandler handler) =>
        new(new HttpClient(handler),
            new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Gemini:ApiKey"] = "test-key",
                ["Gemini:CaptionModel"] = "gemini-test",
                ["Gemini:Model"] = "gemini-test",
            }).Build(),
            NullLogger<GeminiCaptionTranscriber>.Instance);

    private sealed record Call(string Method, string Path, Dictionary<string, string> Headers, long? ContentLength, string Body);

    /// <summary>Answers like the Gemini REST API: upload start / upload / generateContent / delete.</summary>
    private sealed class RouteHandler : HttpMessageHandler
    {
        public List<Call> Calls { get; } = new();
        public Queue<HttpStatusCode> GenerateStatuses { get; init; } = new();

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var path = request.RequestUri!.AbsolutePath;
            var isUpload = path == "/session-1";
            var body = request.Content == null || isUpload ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
            Calls.Add(new Call(
                request.Method.Method,
                path,
                request.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value), StringComparer.OrdinalIgnoreCase),
                request.Content?.Headers.ContentLength,
                body));

            if (path == "/upload/v1beta/files")
            {
                var started = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{}") };
                started.Headers.Add("X-Goog-Upload-URL", "https://upload.test/session-1");
                return started;
            }

            if (isUpload)
            {
                return Json("""{"file":{"name":"files/abc","uri":"https://generativelanguage.googleapis.com/v1beta/files/abc","state":"ACTIVE"}}""");
            }

            if (path.EndsWith(":generateContent"))
            {
                var status = GenerateStatuses.Count > 0 ? GenerateStatuses.Dequeue() : HttpStatusCode.OK;
                if (status != HttpStatusCode.OK) return new HttpResponseMessage(status) { Content = new StringContent("{\"error\":{}}") };
                var answer = JsonValue.Create("""{"hasSpeech":true,"cues":[{"start":"00:00.000","end":"00:01.500","text":"Xin chào"},{"start":"00:01.500","end":"00:03.000","text":"[nhạc nền]"}]}""");
                return Json("""{"candidates":[{"finishReason":"STOP","content":{"role":"model","parts":[{"text":""" + answer.ToJsonString() + "}]}}]}");
            }

            return Json("{}");
        }

        private static HttpResponseMessage Json(string body) =>
            new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
    }
}
