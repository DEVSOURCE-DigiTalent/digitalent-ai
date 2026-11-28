using DigiTalent.Domain.Constants;
using SignLang = DigiTalent.Domain.Constants.SignLanguage;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>Which variant to prefer when a word has several signs.</summary>
public sealed record SignMatchPreferences(string SignLanguage, string Region, string? Variant)
{
    public static readonly SignMatchPreferences Default = new(SignLang.Code.Vsl, SignLang.Region.National, null);
}

/// <summary>One piece of a caption and the sign chosen for it (Entry null = missing or several signs tie).</summary>
public sealed record SignMatch
{
    public required string SourceText { get; init; }
    public required string NormalizedText { get; init; }
    public SignDictionaryEntry? Entry { get; init; }
    public required string MatchType { get; init; }
    public double Confidence { get; init; }
    /// <summary>Every sign that fits, best first (more than one = the reviewer may pick another variant).</summary>
    public IReadOnlyList<SignDictionaryEntry> Candidates { get; init; } = Array.Empty<SignDictionaryEntry>();
    /// <summary>FUNCTION_WORD when a missing word is one sign languages often leave out.</summary>
    public string? Hint { get; init; }

    public bool IsMissing => Entry == null;
}

/// <summary>
/// Matches caption text to signs of the dictionary (docs/specs/2026-11-24-sign-language-video.md §7). Order, at each
/// position of the sentence: the whole sentence, then the longest phrase, then the single word (all on the exact
/// normalized text); then without accents; then synonyms; then a singular of a foreign word or a number digit by
/// digit; else the word is reported missing — never dropped. A sign that can be shown (video + rights) is chosen
/// before one that cannot (a dictionary entry still waiting for its video); then region, variant, default sign and
/// priority; when they all tie none is picked: the reviewer chooses. A word written in capitals ("AI") only matches a
/// sign written the same way, and a sign written in capitals only matches that spelling ("ai" the pronoun ≠ "AI").
/// The result is a suggestion: sign languages have their own grammar and word order, a person must review it.
/// </summary>
public interface ISignGlossMatcher
{
    IReadOnlyList<SignMatch> MatchSentence(string text, SignDictionaryIndex index, SignMatchPreferences preferences);

    /// <summary>The text as one sign (used when the admin joins or edits words of the map).</summary>
    SignMatch MatchPhrase(string text, SignDictionaryIndex index, SignMatchPreferences preferences);
}

public sealed class SignGlossMatcher : ISignGlossMatcher
{
    public const double ExactSentenceConfidence = 1.0;
    public const double PhraseConfidence = 0.95;
    public const double WordConfidence = 0.9;
    public const double DigitsConfidence = 0.8;
    public const double SynonymConfidence = 0.75;
    public const double NormalizedConfidence = 0.7;
    public const double UnaccentedConfidence = 0.6;

    public IReadOnlyList<SignMatch> MatchSentence(string text, SignDictionaryIndex index, SignMatchPreferences preferences)
    {
        var tokens = SignTextNormalizer.Tokenize(text);
        var caseSensitive = !WrittenInCapitals(tokens);
        var result = new List<SignMatch>();
        var i = 0;
        while (i < tokens.Count)
        {
            var (match, used) = Longest(tokens, i, index, preferences, wholeSentence: i == 0, caseSensitive: caseSensitive);
            if (match != null)
            {
                result.Add(match);
                i += used;
                continue;
            }

            var token = tokens[i];
            var single = Single(token, index, preferences);
            if (single != null)
            {
                result.AddRange(single);
            }
            else
            {
                result.Add(Missing(token.Surface, token.Key));
            }

            i++;
        }

        return result;
    }

    public SignMatch MatchPhrase(string text, SignDictionaryIndex index, SignMatchPreferences preferences)
    {
        var tokens = SignTextNormalizer.Tokenize(text);
        var surface = string.Join(' ', tokens.Select(t => t.Surface));
        if (tokens.Count == 0) return Missing(text.Trim(), string.Empty);

        var (match, used) = Longest(tokens, 0, index, preferences, wholeSentence: false, caseSensitive: !WrittenInCapitals(tokens), onlyLength: tokens.Count);
        if (match != null && used == tokens.Count) return match;
        if (tokens.Count == 1)
        {
            var single = Single(tokens[0], index, preferences);
            if (single is { Count: 1 }) return single[0];
        }

        return Missing(surface, string.Join(' ', tokens.Select(t => t.Key)));
    }

    /// <summary>The longest phrase starting at <paramref name="start"/> that the dictionary knows, in order of the tiers.</summary>
    private static (SignMatch? Match, int Used) Longest(
        IReadOnlyList<SignToken> tokens, int start, SignDictionaryIndex index, SignMatchPreferences preferences, bool wholeSentence, bool caseSensitive,
        int? onlyLength = null)
    {
        var longest = Math.Min(index.MaxWords, tokens.Count - start);
        var shortest = 1;
        if (onlyLength != null)
        {
            if (onlyLength > index.MaxWords) return (null, 0);
            longest = shortest = onlyLength.Value;
        }

        // Tier 1–3: exact normalized text, longest first (the whole sentence, a phrase, a word).
        for (var length = longest; length >= shortest; length--)
        {
            var (surface, key) = Phrase(tokens, start, length);
            var found = SameCapitals(index.Exact(key), tokens, start, length, caseSensitive);
            if (found.Count == 0) continue;
            var type = wholeSentence && length == tokens.Count && length > 1
                ? SignVideo.Match.ExactSentence
                : length > 1 ? SignVideo.Match.Phrase : SignVideo.Match.Word;
            var confidence = type == SignVideo.Match.ExactSentence ? ExactSentenceConfidence : length > 1 ? PhraseConfidence : WordConfidence;
            return (Resolve(surface, key, found, type, confidence, preferences), length);
        }

        // Tier 4: without accents — a sign typed without accents, or a caption typed without them. A sign of several
        // words all without accents ("xin chao", from a file name) was typed without them; a single word without
        // accents is usually a real word ("to", "ba", "con") and must never stand for an accented one ("tổ", "bà").
        for (var length = longest; length >= shortest; length--)
        {
            var (surface, key) = Phrase(tokens, start, length);
            var folded = SignTextNormalizer.Fold(key);
            var candidates = SignTextNormalizer.HasAccents(key)
                ? index.TypedWithoutAccents(folded).Where(e => e.Key.Contains(' ')).ToList()
                : index.AnyFolded(folded);
            var found = SameCapitals(candidates, tokens, start, length, caseSensitive);
            if (found.Count == 0) continue;
            return (Resolve(surface, key, found, SignVideo.Match.Unaccented, UnaccentedConfidence, preferences), length);
        }

        // Tier 5: synonyms declared on a sign.
        for (var length = longest; length >= shortest; length--)
        {
            var (surface, key) = Phrase(tokens, start, length);
            var found = index.Synonyms(key);
            if (found.Count == 0) continue;
            return (Resolve(surface, key, found, SignVideo.Match.Synonym, SynonymConfidence, preferences), length);
        }

        return (null, 0);
    }

    /// <summary>A single word the tiers did not find: singular of a foreign word, or a number signed digit by digit.</summary>
    private static List<SignMatch>? Single(SignToken token, SignDictionaryIndex index, SignMatchPreferences preferences)
    {
        foreach (var singular in SignTextNormalizer.Singulars(token.Key))
        {
            var found = index.Exact(singular);
            if (found.Count > 0) return new List<SignMatch> { Resolve(token.Surface, token.Key, found, SignVideo.Match.Normalized, NormalizedConfidence, preferences) };
        }

        if (SignTextNormalizer.IsNumber(token.Key) && token.Key.Length <= 12)
        {
            var digits = token.Key.Select(c => c.ToString()).ToList();
            var signs = digits.Select(d => index.Exact(d).Where(e => e.Kind == SignLang.Kind.Digit).ToList()).ToList();
            if (signs.All(s => s.Count > 0))
            {
                return digits.Select((digit, i) => Resolve(digit, digit, signs[i], SignVideo.Match.Digits, DigitsConfidence, preferences)).ToList();
            }
        }

        return null;
    }

    /// <summary>
    /// Keeps the signs whose words are written like the caption wherever one side is in capitals: "AI" (artificial
    /// intelligence) is not "ai" (who), a sign "AI" is not the pronoun at the start of a sentence ("Ai biết?").
    /// </summary>
    private static IReadOnlyList<SignDictionaryEntry> SameCapitals(
        IReadOnlyList<SignDictionaryEntry> found, IReadOnlyList<SignToken> tokens, int start, int length, bool caseSensitive)
    {
        if (!caseSensitive || found.Count == 0) return found;
        var words = tokens.Skip(start).Take(length).Select(t => t.Surface).ToList();
        return found.Where(entry =>
        {
            var signWords = SignTextNormalizer.DictionaryWords(entry.Gloss);
            if (signWords.Count != words.Count) return true;
            for (var i = 0; i < words.Count; i++)
            {
                if ((SignTextNormalizer.IsCapitalized(words[i]) || SignTextNormalizer.IsCapitalized(signWords[i]))
                    && !string.Equals(SignTextNormalizer.Fold(words[i]), SignTextNormalizer.Fold(signWords[i]), StringComparison.Ordinal))
                {
                    return false;
                }
            }

            return true;
        }).ToList();
    }

    /// <summary>A caption typed all in capitals ("XIN CHÀO CÁC BẠN") says ordinary words: capitals mean nothing there.</summary>
    private static bool WrittenInCapitals(IReadOnlyList<SignToken> tokens)
    {
        var words = tokens.Where(t => t.Surface.Any(char.IsLetter)).ToList();
        return words.Count >= 3 && words.All(t => SignTextNormalizer.IsCapitalized(t.Surface));
    }

    private static (string Surface, string Key) Phrase(IReadOnlyList<SignToken> tokens, int start, int length)
    {
        var slice = tokens.Skip(start).Take(length).ToList();
        return (string.Join(' ', slice.Select(t => t.Surface)), string.Join(' ', slice.Select(t => t.Key)));
    }

    /// <summary>
    /// Picks the variant: a sign that can be shown (video + rights) before one waiting for its video, then the region
    /// of the track, its variant, the default sign, priority. A tie picks none.
    /// </summary>
    public static SignMatch Resolve(
        string surface, string key, IReadOnlyList<SignDictionaryEntry> found, string matchType, double confidence, SignMatchPreferences preferences)
    {
        var candidates = found
            .Where(e => e.SignLanguage == preferences.SignLanguage && !e.IsArchived)
            .DistinctBy(e => e.Id)
            .OrderByDescending(e => Rank(e, preferences))
            .ThenBy(e => e.Gloss, StringComparer.Ordinal)
            .ToList();
        if (candidates.Count == 0) return Missing(surface, key);

        var tie = candidates.Count > 1 && Rank(candidates[0], preferences) == Rank(candidates[1], preferences);
        if (!tie && NeedsSenseCheck(candidates[0], matchType))
        {
            // "hiệu" of "hiệu quả" is not "hiệu (môn Toán)": a sign kept for one meaning is offered, not chosen.
            return new SignMatch
            {
                SourceText = surface,
                NormalizedText = key,
                MatchType = SignVideo.Match.Ambiguous,
                Confidence = 0,
                Candidates = candidates,
                Hint = SenseCheckHint,
            };
        }

        return new SignMatch
        {
            SourceText = surface,
            NormalizedText = key,
            Entry = tie ? null : candidates[0],
            MatchType = tie ? SignVideo.Match.Ambiguous : matchType,
            Confidence = tie ? 0 : confidence,
            Candidates = candidates,
        };
    }

    /// <summary>The only sign found is kept for one meaning ("hiệu (môn Toán)"): the reviewer confirms it fits the sentence.</summary>
    public const string SenseCheckHint = "SENSE_CHECK";

    /// <summary>
    /// A sign whose text carries a meaning in parentheses is used automatically only when the admin made it the default
    /// sign of the word, declared the caption's word as one of its synonyms, or when it is an abbreviation in capitals
    /// ("AI (trí tuệ nhân tạo)"): the caption wrote it the same way, so the meaning is the same.
    /// </summary>
    private static bool NeedsSenseCheck(SignDictionaryEntry entry, string matchType) =>
        matchType != SignVideo.Match.Synonym
        && !entry.IsPreferred
        && SignTextNormalizer.QualifierOf(entry.Gloss) != null
        && !SignTextNormalizer.DictionaryWords(entry.Gloss).Any(SignTextNormalizer.IsCapitalized);

    private static (int Usable, int Region, int Variant, int Preferred, short Priority) Rank(SignDictionaryEntry entry, SignMatchPreferences preferences) =>
    (
        entry.HasVideo && entry.Licensed ? 1 : 0,
        entry.Region == preferences.Region ? 2 : entry.Region == SignLang.Region.National ? 1 : 0,
        preferences.Variant != null && string.Equals(entry.Variant, preferences.Variant, StringComparison.OrdinalIgnoreCase) ? 1 : 0,
        entry.IsPreferred ? 1 : 0,
        entry.Priority
    );

    private static SignMatch Missing(string surface, string key) => new()
    {
        SourceText = surface,
        NormalizedText = key,
        MatchType = SignVideo.Match.Missing,
        Confidence = 0,
        Hint = SignTextNormalizer.FunctionWords.Contains(key) ? "FUNCTION_WORD" : null,
    };
}
