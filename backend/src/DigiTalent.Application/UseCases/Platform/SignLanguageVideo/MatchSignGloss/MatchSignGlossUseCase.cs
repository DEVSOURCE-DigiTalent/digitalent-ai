using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// The sign of the dictionary for a text as one sign (sign map editor: words joined or edited by the admin), with the
/// other variants that fit. Same rules as the analysis: exact, without accents, synonyms; a tie picks none.
/// </summary>
public class MatchSignGlossUseCase : IUseCase<MatchSignGlossUseCaseInput, SignMatchDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ISignGlossMatcher _matcher;

    public MatchSignGlossUseCase(IApplicationDbContext context, ISignGlossMatcher matcher)
    {
        _context = context;
        _matcher = matcher;
    }

    public async Task<SignMatchDto> ExecuteAsync(MatchSignGlossUseCaseInput input)
    {
        var signLanguage = SignLanguage.Code.IsValid(input.SignLanguage) ? input.SignLanguage! : SignLanguage.Code.Vsl;
        var region = SignLanguage.Region.IsValid(input.Region) ? input.Region! : SignLanguage.Region.National;
        var dictionary = SignDictionaryIndex.Build(await SignDictionaryLoader.InUseAsync(_context, signLanguage));
        var match = _matcher.MatchPhrase(input.Text ?? string.Empty, dictionary, new SignMatchPreferences(signLanguage, region, string.IsNullOrWhiteSpace(input.Variant) ? null : input.Variant.Trim()));
        return new SignMatchDto
        {
            Text = match.SourceText,
            NormalizedText = match.NormalizedText,
            GlossId = match.Entry?.Id,
            Gloss = match.Entry?.Gloss,
            MatchType = match.MatchType,
            Confidence = match.Confidence,
            Hint = match.Hint,
            Candidates = match.Candidates.Select(SignVideoRules.Candidate).ToList(),
        };
    }
}
