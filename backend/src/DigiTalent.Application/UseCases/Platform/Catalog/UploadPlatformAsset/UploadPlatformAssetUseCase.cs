using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Stores an image (JPG, PNG, WebP, GIF — 10 MB) or a video (MP4, WebM, MOV — 500 MB) for the course builder.
/// The kind comes from the content type; the file is then attached to a block or a slide.
/// </summary>
public class UploadPlatformAssetUseCase : IUseCase<UploadPlatformAssetUseCaseInput, PlatformAssetDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _storage;
    private readonly ICurrentUser _currentUser;
    private readonly PlatformCourseContentReader _reader;

    public UploadPlatformAssetUseCase(IApplicationDbContext context, IFileStorageService storage, ICurrentUser currentUser, PlatformCourseContentReader reader)
    {
        _context = context;
        _storage = storage;
        _currentUser = currentUser;
        _reader = reader;
    }

    public async Task<PlatformAssetDto> ExecuteAsync(UploadPlatformAssetUseCaseInput input)
    {
        var (kind, fileName, contentType) = PlatformCatalogAssetRules.Validate(input.FileName, input.ContentType, input.Length);
        var key = await _storage.UploadAsync(input.Content, fileName, contentType, "platform-assets");
        var asset = new PlatformAsset
        {
            Kind = kind,
            FileName = fileName,
            ContentType = contentType,
            SizeBytes = input.Length,
            StorageKey = key,
            UploadedByUserId = _currentUser.UserId,
        };
        _context.PlatformAssets.Add(asset);
        await _context.SaveChangesAsync();
        return _reader.Asset(asset);
    }
}
