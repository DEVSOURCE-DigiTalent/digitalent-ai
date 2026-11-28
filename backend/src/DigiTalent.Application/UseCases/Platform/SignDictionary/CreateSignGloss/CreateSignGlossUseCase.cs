using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>
/// Adds a sign to the dictionary as DRAFT (it is published once its motion is taken and checked). A video needs its
/// source, licence and the owner's consent; a word may have several signs (region, variant), one of them the default.
/// </summary>
public class CreateSignGlossUseCase : IUseCase<CreateSignGlossUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPlatformAssetUrlSigner? _urls;

    public CreateSignGlossUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _currentUser = currentUser;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(CreateSignGlossUseCaseInput input)
    {
        var text = SignGlossRules.CheckGloss(input.Gloss, input.Kind);
        var normalized = SignGlossRules.Normalize(text);
        var variant = SignGlossRules.CheckVariant(input.SignLanguage, input.Region, input.Variant, input.Synonyms, input.SignerName, text);
        await SignGlossRules.EnsureUniqueAsync(_context, normalized, input.Kind, variant, null);
        var video = await SignGlossRules.VideoAsync(_context, input.VideoAssetId);
        SignGlossRules.EnsureRights(video != null, input.SourceName, input.LicenseNote, input.ConsentConfirmed);

        var gloss = new SignGloss
        {
            Gloss = text,
            Normalized = normalized,
            Kind = input.Kind,
            Status = GlossStatus.Draft,
            VideoAssetId = video?.Id,
            SourceName = Optional(input.SourceName),
            SourceUrl = Optional(input.SourceUrl),
            LicenseNote = Optional(input.LicenseNote),
            Mirrored = input.Mirrored,
            CreatedByUserId = _currentUser.UserId,
        };
        SignGlossRules.ApplyVariant(gloss, variant, input.IsPreferred, input.Priority, input.ConsentConfirmed);

        await _context.ExecuteInTransactionAsync(async () =>
        {
            if (gloss.IsPreferred)
            {
                // Unset the old default first: at most one default per word (ux_sign_glosses_preferred).
                await SignGlossRules.ClearOtherPreferredAsync(_context, gloss);
                await _context.SaveChangesAsync();
            }

            _context.SignGlosses.Add(gloss);
            await _context.SaveChangesAsync();
        });
        return SignGlossRules.Dto(gloss, video, _urls);
    }

    internal static string? Optional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
