using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;
using SignLang = DigiTalent.Domain.Constants.SignLanguage;
using SignVideoLimits = DigiTalent.Domain.Constants.SignVideo;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>A sign of the dictionary as the matcher and the renderer see it (no motion bytes).</summary>
public sealed record SignDictionaryEntry
{
    public required Guid Id { get; init; }
    public required string Gloss { get; init; }
    /// <summary>Lookup key: words in lower case, qualifier in parentheses left out.</summary>
    public required string Key { get; init; }
    public string Kind { get; init; } = SignLang.Kind.Word;
    public string Status { get; init; } = GlossStatus.Draft;
    public string SignLanguage { get; init; } = SignLang.Code.Vsl;
    public string Region { get; init; } = SignLang.Region.National;
    public string? Variant { get; init; }
    public bool IsPreferred { get; init; }
    public short Priority { get; init; }
    public IReadOnlyList<string> SynonymKeys { get; init; } = Array.Empty<string>();
    public Guid? VideoAssetId { get; init; }
    public bool HasMotion { get; init; }
    /// <summary>Source, licence and the owner's consent are recorded: the video may be used in a rendered video.</summary>
    public bool Licensed { get; init; }
    public int? VideoDurationMs { get; init; }
    public int? TrimStartMs { get; init; }
    public int? TrimEndMs { get; init; }
    public bool Mirrored { get; init; }
    /// <summary>Who signs in the video ("" when not recorded): a CLIP video may show one person only.</summary>
    public string? Signer { get; init; }
    public int? MotionFps { get; init; }
    public int? MotionFrames { get; init; }

    public bool HasVideo => VideoAssetId != null;
    public bool IsArchived => Status == GlossStatus.Archived;

    /// <summary>Length of the sign in its clip: the part chosen when extracting the motion, else the measured video; null = unknown.</summary>
    public int? ClipDurationMs => TrimStartMs != null && TrimEndMs != null && TrimEndMs > TrimStartMs
        ? TrimEndMs - TrimStartMs
        : VideoDurationMs;
}

/// <summary>
/// The dictionary indexed for matching captions: exact keys, keys of signs typed without accents, every key without
/// accents (for captions typed without accents), synonyms. Only WORD and DIGIT signs say caption words; letters and
/// tone marks are for spelling.
/// </summary>
public sealed class SignDictionaryIndex
{
    private readonly Dictionary<string, List<SignDictionaryEntry>> _exact = new(StringComparer.Ordinal);
    private readonly Dictionary<string, List<SignDictionaryEntry>> _typedUnaccented = new(StringComparer.Ordinal);
    private readonly Dictionary<string, List<SignDictionaryEntry>> _folded = new(StringComparer.Ordinal);
    private readonly Dictionary<string, List<SignDictionaryEntry>> _synonyms = new(StringComparer.Ordinal);

    private SignDictionaryIndex(IReadOnlyCollection<SignDictionaryEntry> entries)
    {
        ById = entries.ToDictionary(e => e.Id);
        foreach (var entry in entries.Where(e => !e.IsArchived && e.Kind is SignLang.Kind.Word or SignLang.Kind.Digit && e.Key.Length > 0))
        {
            Add(_exact, entry.Key, entry);
            var folded = SignTextNormalizer.Fold(entry.Key);
            Add(_folded, folded, entry);
            if (folded == entry.Key) Add(_typedUnaccented, folded, entry);
            foreach (var synonym in entry.SynonymKeys.Where(k => k.Length > 0 && k != entry.Key)) Add(_synonyms, synonym, entry);
            MaxWords = Math.Max(MaxWords, Math.Max(WordCount(entry.Key), entry.SynonymKeys.Select(WordCount).DefaultIfEmpty(0).Max()));
        }

        MaxWords = Math.Clamp(MaxWords, 1, SignVideoLimits.MaxPhraseWords);
    }

    public IReadOnlyDictionary<Guid, SignDictionaryEntry> ById { get; }

    /// <summary>Longest phrase worth looking up, in words.</summary>
    public int MaxWords { get; }

    public int Count => ById.Count;

    public static SignDictionaryIndex Build(IEnumerable<SignDictionaryEntry> entries) => new(entries.ToList());

    public IReadOnlyList<SignDictionaryEntry> Exact(string key) => Get(_exact, key);

    /// <summary>Signs typed without accents whose key matches the caption phrase once its accents are folded.</summary>
    public IReadOnlyList<SignDictionaryEntry> TypedWithoutAccents(string foldedKey) => Get(_typedUnaccented, foldedKey);

    /// <summary>Every sign whose key without accents matches (for a caption phrase typed without accents).</summary>
    public IReadOnlyList<SignDictionaryEntry> AnyFolded(string foldedKey) => Get(_folded, foldedKey);

    public IReadOnlyList<SignDictionaryEntry> Synonyms(string key) => Get(_synonyms, key);

    private static IReadOnlyList<SignDictionaryEntry> Get(Dictionary<string, List<SignDictionaryEntry>> map, string key) =>
        map.TryGetValue(key, out var list) ? list : Array.Empty<SignDictionaryEntry>();

    private static void Add(Dictionary<string, List<SignDictionaryEntry>> map, string key, SignDictionaryEntry entry)
    {
        if (!map.TryGetValue(key, out var list)) map[key] = list = new List<SignDictionaryEntry>();
        if (!list.Contains(entry)) list.Add(entry);
    }

    private static int WordCount(string key) => key.Length == 0 ? 0 : key.Count(c => c == ' ') + 1;
}

/// <summary>Reads the dictionary for matching and rendering (light projection: the motion bytes are never loaded).</summary>
public static class SignDictionaryLoader
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <summary>Signs in use (not archived) of one sign language.</summary>
    public static Task<List<SignDictionaryEntry>> InUseAsync(IApplicationDbContext context, string signLanguage, CancellationToken cancellationToken = default) =>
        LoadAsync(context.SignGlosses.AsNoTracking().Where(g => g.Status != GlossStatus.Archived && g.SignLanguage == signLanguage), cancellationToken);

    /// <summary>The signs with these ids, archived ones included (to say a mapped sign was removed).</summary>
    public static async Task<Dictionary<Guid, SignDictionaryEntry>> ByIdsAsync(IApplicationDbContext context, IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var list = ids.Distinct().ToList();
        if (list.Count == 0) return new Dictionary<Guid, SignDictionaryEntry>();
        var entries = await LoadAsync(context.SignGlosses.AsNoTracking().Where(g => list.Contains(g.Id)), cancellationToken);
        return entries.ToDictionary(e => e.Id);
    }

    /// <summary>Signs the 3D avatar can perform: in use, with a motion taken from a video whose rights are recorded.</summary>
    public static Task<int> UsableMotionCountAsync(IApplicationDbContext context, string signLanguage, CancellationToken cancellationToken = default) =>
        context.SignGlosses.AsNoTracking().CountAsync(g =>
            g.Status != GlossStatus.Archived && g.SignLanguage == signLanguage && g.MotionData != null
            && g.ConsentConfirmed && g.SourceName != null && g.LicenseNote != null, cancellationToken);

    /// <summary>Signs usable for a clip video: in use, with a video and recorded rights.</summary>
    public static Task<int> UsableClipCountAsync(IApplicationDbContext context, string signLanguage, CancellationToken cancellationToken = default) =>
        context.SignGlosses.AsNoTracking().CountAsync(g =>
            g.Status != GlossStatus.Archived && g.SignLanguage == signLanguage && g.VideoAssetId != null
            && g.ConsentConfirmed && g.SourceName != null && g.LicenseNote != null, cancellationToken);

    public static List<string> ParseSynonyms(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json, Json) ?? new();
        }
        catch (JsonException)
        {
            return new();
        }
    }

    private static async Task<List<SignDictionaryEntry>> LoadAsync(IQueryable<Domain.Entities.SignGloss> query, CancellationToken cancellationToken)
    {
        var rows = await query
            .Select(g => new
            {
                g.Id, g.Gloss, g.Kind, g.Status, g.SignLanguage, g.Region, g.Variant, g.IsPreferred, g.Priority, g.Synonyms,
                g.VideoAssetId, HasMotion = g.MotionData != null, g.SourceName, g.LicenseNote, g.ConsentConfirmed,
                g.VideoDurationMs, g.MotionStartMs, g.MotionEndMs, g.Mirrored, g.SignerName, g.MotionFps, g.MotionFrames,
            })
            .ToListAsync(cancellationToken);
        return rows.Select(g => new SignDictionaryEntry
        {
            Id = g.Id,
            Gloss = g.Gloss,
            Key = SignTextNormalizer.DictionaryKey(g.Gloss),
            Kind = g.Kind,
            Status = g.Status,
            SignLanguage = g.SignLanguage,
            Region = g.Region,
            Variant = g.Variant,
            IsPreferred = g.IsPreferred,
            Priority = g.Priority,
            SynonymKeys = ParseSynonyms(g.Synonyms).Select(SignTextNormalizer.Key).Where(k => k.Length > 0).Distinct().ToList(),
            VideoAssetId = g.VideoAssetId,
            HasMotion = g.HasMotion,
            Licensed = g.ConsentConfirmed && !string.IsNullOrWhiteSpace(g.SourceName) && !string.IsNullOrWhiteSpace(g.LicenseNote),
            VideoDurationMs = g.VideoDurationMs,
            TrimStartMs = g.MotionStartMs,
            TrimEndMs = g.MotionEndMs,
            Mirrored = g.Mirrored,
            Signer = string.IsNullOrWhiteSpace(g.SignerName) ? null : g.SignerName.Trim(),
            MotionFps = g.MotionFps,
            MotionFrames = g.MotionFrames,
        }).ToList();
    }
}
