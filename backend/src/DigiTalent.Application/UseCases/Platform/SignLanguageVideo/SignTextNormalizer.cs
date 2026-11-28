using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>A word of a caption: as written (<see cref="Surface"/>) and as looked up (<see cref="Key"/>, NFC lower case).</summary>
public readonly record struct SignToken(string Surface, string Key);

/// <summary>
/// Text normalization for matching captions to the sign dictionary: Unicode NFC (macOS and some editors send
/// decomposed accents), lower case, punctuation and extra spaces dropped, [sounds that are not speech] dropped,
/// Vietnamese accents folded when asked.
/// </summary>
public static partial class SignTextNormalizer
{
    /// <summary>
    /// Grammatical words sign languages often leave out (tense, plural and possessive markers, particles). They are
    /// only flagged for the reviewer, never skipped automatically.
    /// </summary>
    public static readonly IReadOnlySet<string> FunctionWords = new HashSet<string>(StringComparer.Ordinal)
    {
        "thì", "là", "mà", "của", "về", "các", "những", "sẽ", "đã", "đang", "rằng", "nhé", "ạ", "à", "ơi", "nhỉ", "vậy", "cái", "chiếc",
    };

    /// <summary>
    /// Words of a caption as spoken: sounds in square brackets ("[nhạc nền]"), the speaker in round brackets
    /// ("(Giảng viên)", how the captions name who speaks) and punctuation left out, each word NFC.
    /// </summary>
    public static List<SignToken> Tokenize(string? text)
    {
        var spoken = NonSpeech().Replace((text ?? string.Empty).Normalize(NormalizationForm.FormC), " ");
        return Word().Matches(spoken).Select(m => new SignToken(m.Value, m.Value.ToLowerInvariant())).ToList();
    }

    /// <summary>Lookup key of a text: its words in lower case joined by one space ("Xin  chào!" → "xin chào").</summary>
    public static string Key(string? text) => string.Join(' ', Tokenize(text).Select(t => t.Key));

    /// <summary>
    /// Lookup key of a dictionary entry: the qualifier in parentheses is left out ("cạnh (môn Toán)" → "cạnh") — it
    /// tells two signs of the same word apart for the reviewer, the caption never says it.
    /// </summary>
    public static string DictionaryKey(string? gloss) => Key(Qualifier().Replace(gloss ?? string.Empty, " "));

    /// <summary>Words of a dictionary entry as written, without the qualifier ("AI (trí tuệ nhân tạo)" → ["AI"]).</summary>
    public static List<string> DictionaryWords(string? gloss) =>
        Tokenize(Qualifier().Replace(gloss ?? string.Empty, " ")).Select(t => t.Surface).ToList();

    /// <summary>
    /// A word written in capitals, at least two letters ("AI", "CRM", "B2B"): an abbreviation, not the ordinary word with
    /// the same letters. "Học" (capital at the start of a sentence) is not.
    /// </summary>
    public static bool IsCapitalized(string word) =>
        word.Count(char.IsLetter) >= 2 && word.All(c => !char.IsLetter(c) || char.IsUpper(c));

    /// <summary>The qualifier in parentheses of a dictionary entry ("môn Toán"), or null.</summary>
    public static string? QualifierOf(string? gloss)
    {
        var match = Qualifier().Match(gloss ?? string.Empty);
        return match.Success ? match.Value.Trim('(', ')', ' ') : null;
    }

    /// <summary>Without Vietnamese accents: "dữ liệu" → "du lieu", "Đ" → "D".</summary>
    public static string Fold(string text)
    {
        var decomposed = text.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark) continue;
            builder.Append(c switch { 'đ' => 'd', 'Đ' => 'D', _ => c });
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    public static bool HasAccents(string text) => !string.Equals(Fold(text), text, StringComparison.Ordinal);

    public static bool IsNumber(string key) => key.Length > 0 && key.All(char.IsAsciiDigit);

    /// <summary>Singular of a foreign word written without accents ("emails" → "email", "classes" → "class"); null when none.</summary>
    public static IEnumerable<string> Singulars(string key)
    {
        if (key.Length <= 3 || HasAccents(key) || !key.EndsWith('s')) yield break;
        if (key.EndsWith("es", StringComparison.Ordinal) && key.Length > 4) yield return key[..^2];
        yield return key[..^1];
    }

    [GeneratedRegex(@"\[[^\]]*\]|\([^)]*\)")]
    private static partial Regex NonSpeech();

    [GeneratedRegex(@"[\p{L}\p{M}\p{N}]+")]
    private static partial Regex Word();

    [GeneratedRegex(@"\([^)]*\)")]
    private static partial Regex Qualifier();
}
