using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>Sign-language dictionary rules (schema v3.12): text normalization, motion checks, loading and DTOs.</summary>
public static partial class SignGlossRules
{
    /// <summary>The gloss as shown: NFC (macOS file names arrive decomposed), spaces collapsed, trimmed.</summary>
    public static string Clean(string? text) => Spaces().Replace((text ?? string.Empty).Normalize(NormalizationForm.FormC), " ").Trim();

    /// <summary>Lookup key: <see cref="Clean"/> in lower case.</summary>
    public static string Normalize(string? text) => Clean(text).ToLowerInvariant();

    /// <summary>Checks the gloss text against its kind; returns the cleaned text or throws 400 INVALID_GLOSS.</summary>
    public static string CheckGloss(string? gloss, string kind)
    {
        var text = Clean(gloss);
        if (text.Length == 0) throw Invalid("Chưa nhập chữ của ký hiệu.");
        if (text.Length > SignLanguage.MaxGlossLength) throw Invalid($"Chữ của ký hiệu tối đa {SignLanguage.MaxGlossLength} ký tự.");
        if (!SignLanguage.Kind.IsValid(kind)) throw new BadRequestException("Loại ký hiệu không hợp lệ.", "kind", "INVALID_GLOSS_KIND");
        if (kind == SignLanguage.Kind.Letter && text.Length > 2) throw Invalid("Chữ cái ngón tay chỉ gồm một chữ (ví dụ A, Ă, Đ).");
        if (kind == SignLanguage.Kind.Digit && !text.All(char.IsDigit)) throw Invalid("Chữ số chỉ gồm các số 0–9.");
        return text;
    }

    /// <summary>Checks a motion of layout 1 (int16 landmarks per frame); throws 400 INVALID_MOTION.</summary>
    public static void CheckMotion(short layout, short fps, int frames, byte[]? data, int? startMs, int? endMs)
    {
        if (layout != SignLanguage.MotionLayoutV1) throw InvalidMotion("Bố cục chuyển động không được hỗ trợ.");
        if (fps < SignLanguage.MinFps || fps > SignLanguage.MaxFps) throw InvalidMotion($"Số khung hình mỗi giây phải từ {SignLanguage.MinFps} đến {SignLanguage.MaxFps}.");
        if (frames < 1 || frames > SignLanguage.MaxFrames) throw InvalidMotion($"Chuyển động có từ 1 đến {SignLanguage.MaxFrames} khung hình.");
        if (data == null || data.Length != frames * SignLanguage.BytesPerFrameV1) throw InvalidMotion("Dữ liệu chuyển động không khớp số khung hình.");
        if (startMs is < 0 || endMs is < 0 || (startMs != null && endMs != null && endMs <= startMs)) throw InvalidMotion("Đoạn video đã chọn không hợp lệ.");
    }

    public static async Task<SignGloss> FindAsync(IApplicationDbContext context, Guid id) =>
        await context.SignGlosses.FirstOrDefaultAsync(g => g.Id == id) ?? throw new NotFoundException("Không tìm thấy ký hiệu.");

    public static void EnsureNotArchived(SignGloss gloss)
    {
        if (gloss.Status == GlossStatus.Archived) throw new ConflictException("Ký hiệu này đã bị xóa khỏi từ điển.");
    }

    /// <summary>409 when another sign in use has the same text, kind, sign language, region and variant.</summary>
    public static async Task EnsureUniqueAsync(IApplicationDbContext context, string normalized, string kind, SignVariant variant, Guid? exceptId)
    {
        var taken = await context.SignGlosses.AnyAsync(g =>
            g.Normalized == normalized && g.Kind == kind && g.SignLanguage == variant.SignLanguage && g.Region == variant.Region
            && g.Variant == variant.Variant && g.Status != GlossStatus.Archived && g.Id != exceptId);
        if (taken)
        {
            throw new ConflictException(variant.Variant == null && variant.Region == SignLanguage.Region.National
                ? "Từ điển đã có ký hiệu này. Muốn thêm cách ra dấu khác, ghi vùng miền hoặc tên biến thể."
                : "Từ điển đã có ký hiệu này cho cùng vùng miền và biến thể.");
        }
    }

    /// <summary>
    /// Variant fields of a sign (schema v3.13), cleaned; throws 400 INVALID_GLOSS. Synonyms are stored as lookup keys.
    /// </summary>
    public static SignVariant CheckVariant(string? signLanguage, string? region, string? variant, IEnumerable<string>? synonyms, string? signerName, string gloss)
    {
        var language = string.IsNullOrWhiteSpace(signLanguage) ? SignLanguage.Code.Vsl : signLanguage.Trim().ToUpperInvariant();
        if (!SignLanguage.Code.IsValid(language)) throw Invalid("Mã ngôn ngữ ký hiệu không hợp lệ (ví dụ VSL).");
        var regionCode = string.IsNullOrWhiteSpace(region) ? SignLanguage.Region.National : region.Trim().ToUpperInvariant();
        if (!SignLanguage.Region.IsValid(regionCode)) throw Invalid("Mã vùng không hợp lệ (ví dụ VN, VN-BAC, VN-NAM).");
        var variantName = string.IsNullOrWhiteSpace(variant) ? null : Clean(variant);
        if (variantName is { Length: > SignLanguage.MaxVariantLength }) throw Invalid($"Tên biến thể tối đa {SignLanguage.MaxVariantLength} ký tự.");
        var signer = string.IsNullOrWhiteSpace(signerName) ? null : Clean(signerName);
        if (signer is { Length: > SignLanguage.MaxSignerNameLength }) throw Invalid($"Tên người ra dấu tối đa {SignLanguage.MaxSignerNameLength} ký tự.");

        var own = SignLanguageVideo.SignTextNormalizer.DictionaryKey(gloss);
        var keys = (synonyms ?? Array.Empty<string>())
            .Select(s => Clean(s))
            .Where(s => s.Length > 0)
            .Select(s => s.Length > SignLanguage.MaxGlossLength ? throw Invalid($"Mỗi từ đồng nghĩa tối đa {SignLanguage.MaxGlossLength} ký tự.") : s)
            .Select(SignLanguageVideo.SignTextNormalizer.Key)
            .Where(k => k.Length > 0 && k != own)
            .Distinct()
            .ToList();
        if (keys.Count > SignLanguage.MaxSynonyms) throw Invalid($"Tối đa {SignLanguage.MaxSynonyms} từ đồng nghĩa cho một ký hiệu.");
        return new SignVariant(language, regionCode, variantName, keys, signer);
    }

    /// <summary>
    /// A video of a person signing may enter the dictionary only with its source, its licence and the confirmation
    /// that the owner (and the signer) allowed its use in DigiTalent; 400 SIGN_LICENSE_MISSING otherwise.
    /// </summary>
    public static void EnsureRights(bool hasVideo, string? sourceName, string? licenseNote, bool consentConfirmed)
    {
        if (!hasVideo) return;
        if (string.IsNullOrWhiteSpace(sourceName) || string.IsNullOrWhiteSpace(licenseNote) || !consentConfirmed)
        {
            throw new BadRequestException(
                "Ghi nguồn, giấy phép và xác nhận bên sở hữu đã cho phép trước khi thêm video ký hiệu.", "licenseNote", SignVideo.Errors.LicenseMissing);
        }
    }

    /// <summary>Makes this sign the only default one among the signs of the same text, kind and sign language.</summary>
    public static async Task ClearOtherPreferredAsync(IApplicationDbContext context, Domain.Entities.SignGloss gloss)
    {
        var others = await context.SignGlosses
            .Where(g => g.Id != gloss.Id && g.IsPreferred && g.Normalized == gloss.Normalized && g.Kind == gloss.Kind
                        && g.SignLanguage == gloss.SignLanguage && g.Status != GlossStatus.Archived)
            .ToListAsync();
        foreach (var other in others) other.IsPreferred = false;
    }

    /// <summary>The source video: must be an uploaded VIDEO (400 NOT_A_VIDEO); null keeps no video.</summary>
    public static async Task<PlatformAsset?> VideoAsync(IApplicationDbContext context, Guid? assetId)
    {
        if (assetId == null) return null;
        var asset = await context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == assetId)
            ?? throw new NotFoundException("Không tìm thấy video.");
        if (asset.Kind != PlatformCatalog.AssetKind.Video) throw new BadRequestException("Ký hiệu cần một video.", "videoAssetId", "NOT_A_VIDEO");
        return asset;
    }

    public static SignGlossDto Dto(SignGloss gloss, PlatformAsset? video, IPlatformAssetUrlSigner? urls) => new()
    {
        Id = gloss.Id,
        Gloss = gloss.Gloss,
        Kind = gloss.Kind,
        Status = gloss.Status,
        Video = video == null ? null : new PlatformAssetDto
        {
            AssetId = video.Id, Kind = video.Kind, FileName = video.FileName, ContentType = video.ContentType, SizeBytes = video.SizeBytes,
            Url = urls?.ContentPath(video.Id) ?? string.Empty,
        },
        SourceName = gloss.SourceName,
        SourceUrl = gloss.SourceUrl,
        LicenseNote = gloss.LicenseNote,
        HasMotion = gloss.MotionData != null,
        MotionFps = gloss.MotionFps,
        MotionFrames = gloss.MotionFrames,
        DurationMs = gloss.MotionFps is > 0 && gloss.MotionFrames != null ? (int)Math.Round(gloss.MotionFrames.Value * 1000.0 / gloss.MotionFps.Value) : null,
        MotionStartMs = gloss.MotionStartMs,
        MotionEndMs = gloss.MotionEndMs,
        Mirrored = gloss.Mirrored,
        PublishedAt = gloss.PublishedAt,
        UpdatedAt = gloss.UpdatedAt,
        SignLanguage = gloss.SignLanguage,
        Region = gloss.Region,
        Variant = gloss.Variant,
        IsPreferred = gloss.IsPreferred,
        Priority = gloss.Priority,
        Synonyms = SignLanguageVideo.SignDictionaryLoader.ParseSynonyms(gloss.Synonyms),
        ConsentConfirmed = gloss.ConsentConfirmed,
        SignerName = gloss.SignerName,
        VideoDurationMs = gloss.VideoDurationMs,
        UsableForVideo = video != null && gloss.ConsentConfirmed && !string.IsNullOrWhiteSpace(gloss.SourceName) && !string.IsNullOrWhiteSpace(gloss.LicenseNote),
    };

    /// <summary>Writes the checked variant fields on the sign.</summary>
    public static void ApplyVariant(Domain.Entities.SignGloss gloss, SignVariant variant, bool isPreferred, short priority, bool consentConfirmed)
    {
        gloss.SignLanguage = variant.SignLanguage;
        gloss.Region = variant.Region;
        gloss.Variant = variant.Variant;
        gloss.Synonyms = JsonSerializer.Serialize(variant.SynonymKeys);
        gloss.SignerName = variant.SignerName;
        gloss.IsPreferred = isPreferred;
        gloss.Priority = priority;
        gloss.ConsentConfirmed = consentConfirmed;
    }

    private static BadRequestException Invalid(string message) => new(message, "gloss", "INVALID_GLOSS");

    private static BadRequestException InvalidMotion(string message) => new(message, "motion", "INVALID_MOTION");

    [GeneratedRegex(@"\s+")]
    private static partial Regex Spaces();
}

/// <summary>Checked variant fields of a sign (schema v3.13).</summary>
public sealed record SignVariant(string SignLanguage, string Region, string? Variant, IReadOnlyList<string> SynonymKeys, string? SignerName);
