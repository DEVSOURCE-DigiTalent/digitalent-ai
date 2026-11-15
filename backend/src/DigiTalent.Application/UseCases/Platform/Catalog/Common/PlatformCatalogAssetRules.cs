using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

public static class PlatformCatalogAssetRules
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
        ["application/pdf"] = PlatformCatalog.AssetKind.Pdf,
    };

    public static (string Kind, string FileName, string ContentType) Validate(string fileName, string contentType, long sizeBytes)
    {
        if (string.IsNullOrWhiteSpace(contentType) || !Kinds.TryGetValue(contentType.Trim(), out var kind))
        {
            throw new BadRequestException("Chỉ nhận ảnh JPG, PNG, WebP, GIF, video MP4, WebM, MOV hoặc PDF.", "file", "UNSUPPORTED_FILE_TYPE");
        }

        if (sizeBytes <= 0 || sizeBytes > PlatformCatalog.AssetKind.MaxBytes(kind))
        {
            var sizeMsg = kind switch
            {
                PlatformCatalog.AssetKind.Video => "Video tối đa 500 MB.",
                PlatformCatalog.AssetKind.Pdf => "PDF tối đa 50 MB.",
                _ => "Ảnh tối đa 10 MB.",
            };
            throw new BadRequestException(sizeMsg, "file", "FILE_TOO_LARGE");
        }

        var normalizedName = Path.GetFileName(fileName ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(normalizedName))
        {
            normalizedName = "asset";
        }
        if (normalizedName.Length > 255)
        {
            normalizedName = normalizedName[^255..];
        }

        return (kind, normalizedName, contentType.Trim().ToLowerInvariant());
    }

    public static string BuildDirectStorageKey(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return $"platform-assets/{DateTime.UtcNow:yyyyMM}/{Guid.NewGuid():N}{ext}";
    }
}
