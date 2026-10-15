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
    private static readonly Dictionary<string, string> Kinds = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = PlatformCatalog.AssetKind.Image,
        ["image/png"] = PlatformCatalog.AssetKind.Image,
        ["image/webp"] = PlatformCatalog.AssetKind.Image,
        ["image/gif"] = PlatformCatalog.AssetKind.Image,
        ["video/mp4"] = PlatformCatalog.AssetKind.Video,
        ["video/webm"] = PlatformCatalog.AssetKind.Video,
        ["video/quicktime"] = PlatformCatalog.AssetKind.Video,
    };

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
        if (!Kinds.TryGetValue(input.ContentType, out var kind))
        {
            throw new BadRequestException("Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc video MP4, WebM, MOV.", "file", "UNSUPPORTED_FILE_TYPE");
        }

        if (input.Length <= 0 || input.Length > PlatformCatalog.AssetKind.MaxBytes(kind))
        {
            throw new BadRequestException(
                kind == PlatformCatalog.AssetKind.Video ? "Video tối đa 500 MB." : "Ảnh tối đa 10 MB.", "file", "FILE_TOO_LARGE");
        }

        var fileName = Path.GetFileName(input.FileName).Trim();
        if (fileName.Length > 255) fileName = fileName[^255..];
        var key = await _storage.UploadAsync(input.Content, fileName, input.ContentType, "platform-assets");
        var asset = new PlatformAsset
        {
            Kind = kind,
            FileName = fileName,
            ContentType = input.ContentType.ToLowerInvariant(),
            SizeBytes = input.Length,
            StorageKey = key,
            UploadedByUserId = _currentUser.UserId,
        };
        _context.PlatformAssets.Add(asset);
        await _context.SaveChangesAsync();
        return _reader.Asset(asset);
    }
}
