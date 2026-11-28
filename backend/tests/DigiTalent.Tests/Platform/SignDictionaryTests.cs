using System.Text;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.SignDictionary;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Sign-language dictionary of the 3D signing avatar (docs/specs/2026-11-24-sign-language-avatar.md, schema v3.12):
/// glosses with their source video, motion of layout 1 (int16 landmarks), publishing and archiving.
/// </summary>
public class SignDictionaryTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public required PlatformAsset Video { get; init; }
        public required PlatformAsset OtherVideo { get; init; }
        public required PlatformAsset Image { get; init; }

        public ICurrentUser User
        {
            get
            {
                var user = new Mock<ICurrentUser>();
                user.Setup(u => u.UserId).Returns(AdminId);
                return user.Object;
            }
        }

        public Task<SignGlossDto> CreateAsync(string gloss, string kind = SignLanguage.Kind.Word, Guid? video = null) =>
            new CreateSignGlossUseCase(Context, User).ExecuteAsync(new CreateSignGlossUseCaseInput
            {
                Gloss = gloss, Kind = kind, VideoAssetId = video, SourceName = "Từ điển thử", LicenseNote = "Được phép dùng thử",
                ConsentConfirmed = true,
            });

        public Task<SignGlossDto> SaveMotionAsync(Guid id, int frames = 10, short fps = 20, byte[]? data = null) =>
            new SaveSignGlossMotionUseCase(Context).ExecuteAsync(new SaveSignGlossMotionUseCaseInput
            {
                Id = id, Layout = SignLanguage.MotionLayoutV1, Fps = fps, Frames = frames, StartMs = 200, EndMs = 700,
                Data = data ?? new byte[frames * SignLanguage.BytesPerFrameV1],
            });

        public Task<SignGlossDto> PublishAsync(Guid id) =>
            new PublishSignGlossUseCase(Context, User, Mock.Of<IAuditService>(), TimeProvider.System).ExecuteAsync(new PublishSignGlossUseCaseInput { Id = id });

        public Task<List<SignGlossMotionDto>> MotionsAsync(bool publishedOnly, params Guid[] ids) =>
            new GetSignGlossMotionsUseCase(Context).ExecuteAsync(new GetSignGlossMotionsUseCaseInput { Ids = ids.ToList(), PublishedOnly = publishedOnly });

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private static async Task<World> CreateWorldAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        PlatformAsset Asset(string kind, string name) => new()
        {
            Kind = kind, FileName = name, ContentType = kind == PlatformCatalog.AssetKind.Video ? "video/mp4" : "image/png", SizeBytes = 100,
            StorageKey = $"signs/{Guid.NewGuid():N}-{name}",
        };
        var world = new World
        {
            Context = context,
            Video = Asset(PlatformCatalog.AssetKind.Video, "xin-chao.mp4"),
            OtherVideo = Asset(PlatformCatalog.AssetKind.Video, "xin-chao-2.mp4"),
            Image = Asset(PlatformCatalog.AssetKind.Image, "a.png"),
        };
        context.PlatformAssets.AddRange(world.Video, world.OtherVideo, world.Image);
        await context.SaveChangesAsync();
        return world;
    }

    [Fact]
    public void Normalize_TreatsDecomposedAccentsCaseAndSpacesAsTheSameWord()
    {
        var decomposed = "Xin  CHÀO ".Normalize(NormalizationForm.FormD); // as macOS file names arrive
        SignGlossRules.Normalize(decomposed).Should().Be("xin chào");
        SignGlossRules.Clean(decomposed).Should().Be("Xin CHÀO");
        SignLanguage.BytesPerFrameV1.Should().Be(650, "1 cờ + (33 + 33 + 21 + 21) điểm × 3 toạ độ, int16");
    }

    [Fact]
    public async Task Create_RejectsDuplicatesAndWrongKinds_ButAllowsTheSameTextAsAnotherKind()
    {
        await using var world = await CreateWorldAsync();
        var created = await world.CreateAsync("Xin chào", video: world.Video.Id);
        created.Status.Should().Be(GlossStatus.Draft);
        created.HasMotion.Should().BeFalse();
        created.Video!.AssetId.Should().Be(world.Video.Id);
        created.SourceName.Should().Be("Từ điển thử");

        var duplicate = () => world.CreateAsync(" xin   CHÀO".Normalize(NormalizationForm.FormD));
        await duplicate.Should().ThrowAsync<ConflictException>();
        (await world.CreateAsync("A", SignLanguage.Kind.Letter)).Kind.Should().Be(SignLanguage.Kind.Letter);
        (await world.CreateAsync("A", SignLanguage.Kind.Word)).Kind.Should().Be(SignLanguage.Kind.Word, "cùng chữ nhưng khác loại");

        var longLetter = () => world.CreateAsync("ABC", SignLanguage.Kind.Letter);
        (await longLetter.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_GLOSS");
        var digit = () => world.CreateAsync("bảy", SignLanguage.Kind.Digit);
        (await digit.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_GLOSS");
        var image = () => world.CreateAsync("Ảnh", video: world.Image.Id);
        (await image.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NOT_A_VIDEO");
    }

    [Fact]
    public async Task Motion_IsCheckedAgainstTheLayout_ThenPublished_AndANewVideoSendsTheSignBackToDraft()
    {
        await using var world = await CreateWorldAsync();
        var noVideo = await world.CreateAsync("Dữ liệu");
        var withoutVideo = () => world.SaveMotionAsync(noVideo.Id);
        (await withoutVideo.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NO_VIDEO");

        var sign = await world.CreateAsync("Xin chào", video: world.Video.Id);
        var unpublishable = () => world.PublishAsync(sign.Id);
        (await unpublishable.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NO_MOTION");
        var wrongSize = () => world.SaveMotionAsync(sign.Id, frames: 10, data: new byte[10 * SignLanguage.BytesPerFrameV1 - 2]);
        (await wrongSize.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_MOTION");
        var badFps = () => world.SaveMotionAsync(sign.Id, fps: 90);
        (await badFps.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_MOTION");

        var withMotion = await world.SaveMotionAsync(sign.Id, frames: 30, fps: 20);
        withMotion.HasMotion.Should().BeTrue();
        withMotion.DurationMs.Should().Be(1500);
        withMotion.MotionStartMs.Should().Be(200);

        var published = await world.PublishAsync(sign.Id);
        published.Status.Should().Be(GlossStatus.Published);
        published.PublishedAt.Should().NotBeNull();

        var renamed = await new UpdateSignGlossUseCase(world.Context).ExecuteAsync(new UpdateSignGlossUseCaseInput
        {
            Id = sign.Id, Gloss = "Xin chào bạn", Kind = SignLanguage.Kind.Word, VideoAssetId = world.Video.Id, Mirrored = true,
            SourceName = "Từ điển thử", LicenseNote = "Được phép dùng thử", ConsentConfirmed = true,
        });
        renamed.Status.Should().Be(GlossStatus.Published, "đổi chữ, giữ video thì giữ chuyển động");
        renamed.Mirrored.Should().BeTrue();

        var newVideo = await new UpdateSignGlossUseCase(world.Context).ExecuteAsync(new UpdateSignGlossUseCaseInput
        {
            Id = sign.Id, Gloss = "Xin chào bạn", Kind = SignLanguage.Kind.Word, VideoAssetId = world.OtherVideo.Id,
            SourceName = "Từ điển thử", LicenseNote = "Được phép dùng thử", ConsentConfirmed = true,
        });
        newVideo.Status.Should().Be(GlossStatus.Draft, "video mới thì chuyển động cũ không còn đúng");
        newVideo.HasMotion.Should().BeFalse();
    }

    [Fact]
    public async Task Motions_GiveLearnersOnlyPublishedSigns_AndArchivedSignsLeaveTheDictionary()
    {
        await using var world = await CreateWorldAsync();
        var hello = await world.CreateAsync("Xin chào", video: world.Video.Id);
        var data = Enumerable.Range(0, 5 * SignLanguage.BytesPerFrameV1).Select(i => (byte)(i % 251)).ToArray();
        await world.SaveMotionAsync(hello.Id, frames: 5, data: data);
        var draft = await world.CreateAsync("Bảng tính", video: world.OtherVideo.Id);
        await world.SaveMotionAsync(draft.Id, frames: 3);
        await world.PublishAsync(hello.Id);

        var learner = await world.MotionsAsync(true, hello.Id, draft.Id, Guid.NewGuid());
        learner.Should().ContainSingle().Which.Data.Should().Equal(data);
        (await world.MotionsAsync(false, hello.Id, draft.Id)).Should().HaveCount(2, "quản trị viên xem thử cả bản nháp");
        var tooMany = () => world.MotionsAsync(false, Enumerable.Range(0, SignLanguage.MaxMotionsPerRequest + 1).Select(_ => Guid.NewGuid()).ToArray());
        (await tooMany.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("TOO_MANY_SIGNS");

        await world.CreateAsync("Ă", SignLanguage.Kind.Letter);
        var list = await new GetSignGlossesUseCase(world.Context).ExecuteAsync(new GetSignGlossesUseCaseInput());
        list.Items.Select(i => i.Gloss).Should().Equal("Ă", "Bảng tính", "Xin chào");
        (await new GetSignGlossesUseCase(world.Context).ExecuteAsync(new GetSignGlossesUseCaseInput { Search = "BẢNG" })).Items
            .Should().ContainSingle().Which.Gloss.Should().Be("Bảng tính");
        (await new GetSignGlossesUseCase(world.Context).ExecuteAsync(new GetSignGlossesUseCaseInput { WithoutMotion = true })).Items
            .Should().ContainSingle().Which.Gloss.Should().Be("Ă");

        await new ArchiveSignGlossUseCase(world.Context, Mock.Of<IAuditService>()).ExecuteAsync(new ArchiveSignGlossUseCaseInput { Id = hello.Id });
        (await world.MotionsAsync(true, hello.Id)).Should().BeEmpty();
        (await new GetSignGlossesUseCase(world.Context).ExecuteAsync(new GetSignGlossesUseCaseInput())).Items.Should().NotContain(i => i.Id == hello.Id);
        (await world.CreateAsync("Xin chào")).Status.Should().Be(GlossStatus.Draft, "chữ của ký hiệu đã xóa được thêm lại");
        var editArchived = () => world.SaveMotionAsync(hello.Id);
        await editArchived.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task TheDictionaryTabs_FollowEachSignFromVideoToMotionToPublished_WithTheirCounts()
    {
        await using var world = await CreateWorldAsync();
        await world.CreateAsync("Bàn"); // no video
        await world.CreateAsync("Bạn", video: world.Video.Id); // video, no motion
        var ready = await world.CreateAsync("Chào", video: world.OtherVideo.Id);
        await world.SaveMotionAsync(ready.Id);
        var thirdVideo = new PlatformAsset { Kind = PlatformCatalog.AssetKind.Video, FileName = "d.mp4", ContentType = "video/mp4", SizeBytes = 1, StorageKey = "signs/d.mp4" };
        world.Context.PlatformAssets.Add(thirdVideo);
        await world.Context.SaveChangesAsync();
        var published = await world.CreateAsync("Dữ liệu", video: thirdVideo.Id);
        await world.SaveMotionAsync(published.Id);
        await world.PublishAsync(published.Id);
        var archived = await world.CreateAsync("Đỏ");
        await new ArchiveSignGlossUseCase(world.Context, Mock.Of<IAuditService>()).ExecuteAsync(new ArchiveSignGlossUseCaseInput { Id = archived.Id });

        async Task<string[]> Stage(string stage) =>
            (await new GetSignGlossesUseCase(world.Context).ExecuteAsync(new GetSignGlossesUseCaseInput { Stage = stage })).Items.Select(i => i.Gloss).ToArray();
        (await Stage(SignLanguage.Stage.NoVideo)).Should().Equal("Bàn");
        (await Stage(SignLanguage.Stage.NeedsMotion)).Should().Equal("Bạn");
        (await Stage(SignLanguage.Stage.Ready)).Should().Equal(new[] { "Chào" }, "đã xuất bản thì không còn chờ xuất bản");

        var summary = await new GetSignGlossSummaryUseCase(world.Context).ExecuteAsync(new GetSignGlossSummaryUseCaseInput());
        summary.Should().BeEquivalentTo(new SignGlossSummaryDto { Total = 4, NoVideo = 1, NeedsMotion = 1, Ready = 1, Published = 1, Archived = 1 });
        (await new GetSignGlossSummaryUseCase(world.Context).ExecuteAsync(new GetSignGlossSummaryUseCaseInput { Search = "B" })).Total
            .Should().Be(2, "cùng bộ lọc chữ với danh sách: “Bàn” và “Bạn”, số trên tab khớp danh sách");
        new GetSignGlossesUseCaseValidator().Validate(new GetSignGlossesUseCaseInput { Stage = "SOMETHING" }).IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task AVideo_NeedsItsSourceLicenceAndConsent_BeforeEnteringTheDictionary()
    {
        await using var world = await CreateWorldAsync();
        var noConsent = () => new CreateSignGlossUseCase(world.Context, world.User).ExecuteAsync(new CreateSignGlossUseCaseInput
        {
            Gloss = "Cảm ơn", Kind = SignLanguage.Kind.Word, VideoAssetId = world.Video.Id, SourceName = "Từ điển", LicenseNote = "CC BY",
        });
        (await noConsent.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be(SignVideo.Errors.LicenseMissing);
        var noLicence = () => new CreateSignGlossUseCase(world.Context, world.User).ExecuteAsync(new CreateSignGlossUseCaseInput
        {
            Gloss = "Cảm ơn", Kind = SignLanguage.Kind.Word, VideoAssetId = world.Video.Id, SourceName = "Từ điển", ConsentConfirmed = true,
        });
        await noLicence.Should().ThrowAsync<BadRequestException>();

        // A word without video (seeded from the standard) needs no licence yet.
        var word = await world.CreateAsync("Dữ liệu");
        word.UsableForVideo.Should().BeFalse();
        var withVideo = await world.CreateAsync("Cảm ơn", video: world.Video.Id);
        withVideo.UsableForVideo.Should().BeTrue();
        withVideo.ConsentConfirmed.Should().BeTrue();
    }

    [Fact]
    public async Task AWord_MayHaveRegionalVariants_WithOneDefault_AndSynonyms()
    {
        await using var world = await CreateWorldAsync();
        Task<SignGlossDto> Add(string region, bool preferred = false, string? variant = null, params string[] synonyms) =>
            new CreateSignGlossUseCase(world.Context, world.User).ExecuteAsync(new CreateSignGlossUseCaseInput
            {
                Gloss = "Cảm ơn", Kind = SignLanguage.Kind.Word, Region = region, Variant = variant, IsPreferred = preferred, Synonyms = synonyms.ToList(),
            });

        var north = await Add("vn-bac", true, null, "Cám ơn", " cảm  ơn ", "cám ơn");
        north.Region.Should().Be(SignLanguage.Region.North);
        north.Synonyms.Should().Equal(new[] { "cám ơn" }, "chuẩn hóa, bỏ trùng và bỏ chính chữ của ký hiệu");
        var south = await Add(SignLanguage.Region.South, true);
        world.Context.ChangeTracker.Clear();
        world.Context.SignGlosses.AsNoTracking().Single(g => g.Id == north.Id).IsPreferred.Should().BeFalse("chỉ một ký hiệu mặc định cho mỗi từ");
        south.IsPreferred.Should().BeTrue();

        var sameRegion = () => Add(SignLanguage.Region.South);
        (await sameRegion.Should().ThrowAsync<ConflictException>()).Which.Message.Should().Contain("cùng vùng miền");
        (await Add(SignLanguage.Region.South, false, "Người ra dấu B")).Variant.Should().Be("Người ra dấu B");
        var badRegion = () => Add("Miền Bắc");
        (await badRegion.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_GLOSS");
    }
}
