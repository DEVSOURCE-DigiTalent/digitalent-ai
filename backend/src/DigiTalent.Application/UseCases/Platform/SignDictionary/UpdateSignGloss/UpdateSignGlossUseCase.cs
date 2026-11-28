using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>
/// Edits a sign. A new video makes the old motion meaningless: the motion and the measured length are cleared and the
/// sign goes back to DRAFT (learners stop seeing it until it is extracted and published again). A sign with a video
/// keeps its source, licence and the owner's consent recorded.
/// </summary>
public class UpdateSignGlossUseCase : IUseCase<UpdateSignGlossUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner? _urls;

    public UpdateSignGlossUseCase(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(UpdateSignGlossUseCaseInput input)
    {
        var gloss = await SignGlossRules.FindAsync(_context, input.Id);
        SignGlossRules.EnsureNotArchived(gloss);
        var text = SignGlossRules.CheckGloss(input.Gloss, input.Kind);
        var normalized = SignGlossRules.Normalize(text);
        var variant = SignGlossRules.CheckVariant(input.SignLanguage, input.Region, input.Variant, input.Synonyms, input.SignerName, text);
        await SignGlossRules.EnsureUniqueAsync(_context, normalized, input.Kind, variant, gloss.Id);
        var video = await SignGlossRules.VideoAsync(_context, input.VideoAssetId);
        SignGlossRules.EnsureRights(video != null, input.SourceName, input.LicenseNote, input.ConsentConfirmed);

        if (video?.Id != gloss.VideoAssetId)
        {
            gloss.VideoAssetId = video?.Id;
            gloss.MotionData = null;
            gloss.MotionLayout = null;
            gloss.MotionFps = null;
            gloss.MotionFrames = null;
            gloss.MotionStartMs = null;
            gloss.MotionEndMs = null;
            gloss.VideoDurationMs = null;
            gloss.Status = GlossStatus.Draft;
        }

        gloss.Gloss = text;
        gloss.Normalized = normalized;
        gloss.Kind = input.Kind;
        gloss.SourceName = CreateSignGlossUseCase.Optional(input.SourceName);
        gloss.SourceUrl = CreateSignGlossUseCase.Optional(input.SourceUrl);
        gloss.LicenseNote = CreateSignGlossUseCase.Optional(input.LicenseNote);
        gloss.Mirrored = input.Mirrored;
        SignGlossRules.ApplyVariant(gloss, variant, input.IsPreferred, input.Priority, input.ConsentConfirmed);

        await _context.ExecuteInTransactionAsync(async () =>
        {
            if (gloss.IsPreferred)
            {
                // Unset the old default first: at most one default per word (ux_sign_glosses_preferred).
                gloss.IsPreferred = false;
                await SignGlossRules.ClearOtherPreferredAsync(_context, gloss);
                await _context.SaveChangesAsync();
                gloss.IsPreferred = true;
            }

            await _context.SaveChangesAsync();
        });
        return SignGlossRules.Dto(gloss, video, _urls);
    }
}
