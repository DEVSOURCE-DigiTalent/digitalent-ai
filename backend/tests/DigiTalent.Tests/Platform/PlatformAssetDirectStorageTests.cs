using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.FileStorage;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Platform;

public class PlatformAssetDirectStorageTests
{
    private static readonly JwtSettings TestJwt = new()
    {
        SigningKey = "unit-test-signing-key-with-more-than-32-chars",
        Issuer = "DigiTalent.Tests",
        Audience = "DigiTalent.Tests",
    };

    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"direct-storage-{Guid.NewGuid():N}")
            .Options;
        return new AppDbContext(options);
    }

    private static ICurrentUser FakeUser(Guid userId)
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(u => u.UserId).Returns(userId);
        return mock.Object;
    }

    [Fact]
    public async Task Presign_ReturnsProxy_WhenDirectStorageIsUnavailable()
    {
        var clock = TimeProvider.System;
        var user = FakeUser(Guid.NewGuid());
        var useCase = new PresignPlatformAssetUseCase(user, clock, directStorage: null, uploadSigner: null);

        var result = await useCase.ExecuteAsync(new PresignPlatformAssetUseCaseInput
        {
            FileName = "slides.pdf",
            ContentType = "application/pdf",
            SizeBytes = 1024,
        });

        result.Mode.Should().Be("PROXY");
        result.UploadUrl.Should().BeNull();
        result.UploadToken.Should().BeNull();
    }

    [Fact]
    public async Task Presign_AndComplete_PersistAsset_WhenDirectObjectExistsWithMatchingSize()
    {
        await using var db = CreateDb();

        var userId = Guid.NewGuid();
        var clock = TimeProvider.System;
        var uploadSigner = new PlatformAssetUploadSigner(TestJwt, clock);
        var urlSigner = new PlatformAssetUrlSigner(TestJwt, clock);
        var reader = new PlatformCourseContentReader(db, urlSigner);

        var directStorage = new Mock<IDirectFileStorageService>();
        directStorage.Setup(s => s.SupportsDirectAccess).Returns(true);
        directStorage
            .Setup(s => s.GetPresignedUploadUrlAsync(It.IsAny<string>(), "video/mp4", It.IsAny<TimeSpan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string key, string _, TimeSpan _, CancellationToken _) => $"https://digitalent-ai.duckdns.org/storage/digitalent-ai/{key}?sig=1");

        var presignUseCase = new PresignPlatformAssetUseCase(FakeUser(userId), clock, directStorage.Object, uploadSigner);
        var presigned = await presignUseCase.ExecuteAsync(new PresignPlatformAssetUseCaseInput
        {
            FileName = "course-intro.mp4",
            ContentType = "video/mp4",
            SizeBytes = 2_500_000,
        });

        presigned.Mode.Should().Be("DIRECT");
        presigned.Method.Should().Be("PUT");
        presigned.UploadUrl.Should().StartWith("https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/");
        presigned.UploadToken.Should().NotBeNullOrWhiteSpace();

        uploadSigner.TryVerify(presigned.UploadToken!, out var payload).Should().BeTrue();
        payload.Should().NotBeNull();

        directStorage
            .Setup(s => s.GetMetadataAsync(payload!.StorageKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StoredObjectMetadata(2_500_000, "video/mp4"));

        var completeUseCase = new CompletePlatformAssetUploadUseCase(db, FakeUser(userId), reader, uploadSigner, directStorage.Object);
        var dto = await completeUseCase.ExecuteAsync(new CompletePlatformAssetUploadUseCaseInput
        {
            UploadToken = presigned.UploadToken!,
        });

        dto.Kind.Should().Be(PlatformCatalog.AssetKind.Video);
        dto.FileName.Should().Be("course-intro.mp4");
        dto.SizeBytes.Should().Be(2_500_000);
        dto.Url.Should().Contain($"platform/assets/{dto.AssetId}/content?exp=");

        var saved = await db.PlatformAssets.SingleAsync(a => a.Id == dto.AssetId);
        saved.StorageKey.Should().Be(payload!.StorageKey);
        saved.UploadedByUserId.Should().Be(userId);
    }

    [Fact]
    public async Task Complete_RejectsTamperedToken_OrMissingStorageObject()
    {
        await using var db = CreateDb();

        var userId = Guid.NewGuid();
        var clock = TimeProvider.System;
        var uploadSigner = new PlatformAssetUploadSigner(TestJwt, clock);
        var reader = new PlatformCourseContentReader(db, new PlatformAssetUrlSigner(TestJwt, clock));

        var directStorage = new Mock<IDirectFileStorageService>();
        directStorage.Setup(s => s.SupportsDirectAccess).Returns(true);
        directStorage
            .Setup(s => s.GetPresignedUploadUrlAsync(It.IsAny<string>(), "application/pdf", It.IsAny<TimeSpan>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://digitalent-ai.duckdns.org/storage/bucket/key");
        directStorage
            .Setup(s => s.GetMetadataAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((StoredObjectMetadata?)null);

        var presignUseCase = new PresignPlatformAssetUseCase(FakeUser(userId), clock, directStorage.Object, uploadSigner);
        var presigned = await presignUseCase.ExecuteAsync(new PresignPlatformAssetUseCaseInput
        {
            FileName = "deck.pdf",
            ContentType = "application/pdf",
            SizeBytes = 12_000,
        });

        var completeUseCase = new CompletePlatformAssetUploadUseCase(db, FakeUser(userId), reader, uploadSigner, directStorage.Object);

        await FluentActions.Invoking(() => completeUseCase.ExecuteAsync(new CompletePlatformAssetUploadUseCaseInput
        {
            UploadToken = presigned.UploadToken + "tampered",
        })).Should().ThrowAsync<BadRequestException>();

        await FluentActions.Invoking(() => completeUseCase.ExecuteAsync(new CompletePlatformAssetUploadUseCaseInput
        {
            UploadToken = presigned.UploadToken!,
        })).Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GetPlatformAssetContent_ReturnsRedirectUrl_WhenDirectStorageIsSupported()
    {
        await using var db = CreateDb();

        var asset = new PlatformAsset
        {
            Id = Guid.NewGuid(),
            Kind = PlatformCatalog.AssetKind.Pdf,
            FileName = "slides.pdf",
            ContentType = "application/pdf",
            SizeBytes = 4096,
            StorageKey = "platform-assets/202611/slides.pdf",
        };
        db.PlatformAssets.Add(asset);
        await db.SaveChangesAsync();

        var clock = TimeProvider.System;
        var urlSigner = new PlatformAssetUrlSigner(TestJwt, clock);
        var path = urlSigner.ContentPath(asset.Id);
        var query = System.Web.HttpUtility.ParseQueryString(path[(path.IndexOf('?') + 1)..]);
        var exp = long.Parse(query["exp"]!);
        var sig = query["sig"]!;

        var storage = new Mock<IFileStorageService>();
        var directStorage = new Mock<IDirectFileStorageService>();
        directStorage.Setup(s => s.SupportsDirectAccess).Returns(true);
        directStorage
            .Setup(s => s.GetPresignedDownloadUrlAsync(asset.StorageKey, It.IsAny<TimeSpan>(), asset.FileName, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/202611/slides.pdf?X-Amz-Signature=ok");

        var useCase = new GetPlatformAssetContentUseCase(db, storage.Object, urlSigner, directStorage.Object);
        var output = await useCase.ExecuteAsync(new GetPlatformAssetContentUseCaseInput
        {
            AssetId = asset.Id,
            ExpiresAt = exp,
            Signature = sig,
        });

        output.RedirectUrl.Should().Be("https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/202611/slides.pdf?X-Amz-Signature=ok");
        storage.Verify(s => s.DownloadAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task MinioFileStorageService_GeneratesPresignedUrls_UnderConfiguredPublicPath()
    {
        using var internalOnlyService = new MinioFileStorageService(new FileStorageSettings
        {
            Provider = "Minio",
            MinioEndpoint = "minio:9000",
            MinioPublicEndpoint = "",
            MinioAccessKey = "digitalent_minio",
            MinioSecretKey = "secret-key-for-test",
            MinioBucketName = "digitalent-ai",
        });
        internalOnlyService.SupportsDirectAccess.Should().BeFalse();

        using var service = new MinioFileStorageService(new FileStorageSettings
        {
            Provider = "Minio",
            MinioEndpoint = "minio:9000",
            MinioPublicEndpoint = "https://digitalent-ai.duckdns.org/storage",
            MinioAccessKey = "digitalent_minio",
            MinioSecretKey = "secret-key-for-test",
            MinioBucketName = "digitalent-ai",
            MinioRegion = "us-east-1",
            MinioUseSsl = false,
        });

        service.SupportsDirectAccess.Should().BeTrue();

        var getUrl = await service.GetPresignedDownloadUrlAsync("platform-assets/202611/video.mp4", TimeSpan.FromMinutes(15), "video.mp4", inline: true);
        getUrl.Should().StartWith("https://digitalent-ai.duckdns.org/storage/digitalent-ai/platform-assets/202611/video.mp4");
        getUrl.Should().Contain("X-Amz-Signature=");
    }
}
