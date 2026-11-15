using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Issues a short-lived direct Object Storage upload URL (when MinIO/S3 is active) plus a signed ticket,
/// or returns Mode = "PROXY" so clients fall back to multipart upload through the API.
/// </summary>
public class PresignPlatformAssetUseCase : IUseCase<PresignPlatformAssetUseCaseInput, PresignPlatformAssetUseCaseOutput>
{
    private static readonly TimeSpan UploadLifetime = TimeSpan.FromMinutes(30);

    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _clock;
    private readonly IDirectFileStorageService? _directStorage;
    private readonly IPlatformAssetUploadSigner? _uploadSigner;

    public PresignPlatformAssetUseCase(
        ICurrentUser currentUser,
        TimeProvider clock,
        IDirectFileStorageService? directStorage = null,
        IPlatformAssetUploadSigner? uploadSigner = null)
    {
        _currentUser = currentUser;
        _clock = clock;
        _directStorage = directStorage;
        _uploadSigner = uploadSigner;
    }

    public async Task<PresignPlatformAssetUseCaseOutput> ExecuteAsync(PresignPlatformAssetUseCaseInput input)
    {
        var (kind, fileName, contentType) = PlatformCatalogAssetRules.Validate(input.FileName, input.ContentType, input.SizeBytes);

        if (_directStorage is not { SupportsDirectAccess: true } || _uploadSigner == null)
        {
            return new PresignPlatformAssetUseCaseOutput { Mode = "PROXY" };
        }

        var storageKey = PlatformCatalogAssetRules.BuildDirectStorageKey(fileName);
        var uploadUrl = await _directStorage.GetPresignedUploadUrlAsync(storageKey, contentType, UploadLifetime);
        if (string.IsNullOrEmpty(uploadUrl))
        {
            return new PresignPlatformAssetUseCaseOutput { Mode = "PROXY" };
        }

        var expiresAt = _clock.GetUtcNow().Add(UploadLifetime).ToUnixTimeSeconds();
        var uploadToken = _uploadSigner.Sign(new PlatformAssetUploadTicketPayload(
            _currentUser.UserId,
            storageKey,
            fileName,
            contentType,
            kind,
            input.SizeBytes,
            expiresAt));

        return new PresignPlatformAssetUseCaseOutput
        {
            Mode = "DIRECT",
            UploadUrl = uploadUrl,
            UploadToken = uploadToken,
            Method = "PUT",
            ExpiresAtUnixSeconds = expiresAt,
        };
    }
}
