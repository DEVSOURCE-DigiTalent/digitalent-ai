using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// Builds the course-builder view of the sign-language video of a lesson video: prerequisites, the sign map with the
/// live state of every sign (a sign may have gained or lost its video since the analysis), outputs and blockers.
/// </summary>
public sealed class SignLanguageVideoReader
{
    private readonly IApplicationDbContext _context;
    private readonly IEnumerable<ISignVideoRenderer> _renderers;
    private readonly TimeProvider _time;
    private readonly IPlatformAssetUrlSigner? _urls;

    public SignLanguageVideoReader(IApplicationDbContext context, IEnumerable<ISignVideoRenderer> renderers, TimeProvider time, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _renderers = renderers;
        _time = time;
        _urls = urls;
    }

    public async Task<SignLanguageVideoDto> ReadAsync(Guid assetId, string signLanguage = SignLanguage.Code.Vsl, CancellationToken cancellationToken = default)
    {
        var prerequisites = await PrerequisitesAsync(assetId, signLanguage, cancellationToken);
        var track = await _context.PlatformSignLanguageTracks.AsNoTracking()
            .FirstOrDefaultAsync(t => t.SourceAssetId == assetId && t.SignLanguage == signLanguage, cancellationToken);
        if (track == null)
        {
            return SignVideoRules.Dto(new SignVideoView { AssetId = assetId, Prerequisites = prerequisites, Now = _time.GetUtcNow(), Urls = _urls });
        }

        var segments = (await _context.PlatformSignLanguageSegments.AsNoTracking()
                .Where(s => s.TrackId == track.Id)
                .OrderBy(s => s.SegmentIndex)
                .ToListAsync(cancellationToken))
            .Select(SignVideoRules.State)
            .ToList();
        var glossIds = segments.SelectMany(s => s.Items)
            .SelectMany(i => (i.CandidateIds ?? new List<Guid>()).Concat(i.GlossId is { } id ? new[] { id } : Array.Empty<Guid>()));
        var entries = await SignDictionaryLoader.ByIdsAsync(_context, glossIds, cancellationToken);

        var assetIds = new[] { track.OutputAssetId, track.PublishedOutputAssetId }.Where(id => id != null).Select(id => id!.Value).Distinct().ToList();
        var assets = await _context.PlatformAssets.AsNoTracking().Where(a => assetIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, cancellationToken);
        var reviewerIds = segments.Where(s => s.Row.ReviewedByUserId != null).Select(s => s.Row.ReviewedByUserId!.Value).Distinct().ToList();
        var reviewers = reviewerIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.Users.AsNoTracking().Where(u => reviewerIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.DisplayName, cancellationToken);
        var warnings = SignTimelinePlanner.Plan(SignVideoRules.PlanInput(
            segments, item => SignVideoRules.NaturalLength(item.GlossId is { } id ? entries.GetValueOrDefault(id) : null).Ms)).Warnings;

        return SignVideoRules.Dto(new SignVideoView
        {
            AssetId = assetId,
            Track = track,
            Segments = segments,
            Entries = entries,
            Prerequisites = prerequisites,
            OutputAsset = track.OutputAssetId is { } output ? assets.GetValueOrDefault(output) : null,
            PublishedAsset = track.PublishedOutputAssetId is { } published ? assets.GetValueOrDefault(published) : null,
            Reviewers = reviewers,
            // Compared with the transcript last saved, whatever the track was analysed from: it is what the next analysis reads
            // (a track analysed from the old published captions shows "Lời thoại đã thay đổi" once they differ).
            CurrentCaptionFingerprint = await SignVideoStore.CurrentCaptionFingerprintAsync(_context, assetId, SignVideo.CaptionSource.Draft, cancellationToken),
            Warnings = warnings,
            Now = _time.GetUtcNow(),
            Urls = _urls,
        });
    }

    public async Task<SignVideoPrerequisitesDto> PrerequisitesAsync(Guid assetId, string signLanguage, CancellationToken cancellationToken = default)
    {
        var caption = await _context.PlatformAssetCaptions.AsNoTracking()
            .Where(c => c.AssetId == assetId && c.Language == PlatformCatalog.Captions.Vietnamese)
            .Select(c => new { c.Status, c.DraftCues, c.PublishedCues })
            .FirstOrDefaultAsync(cancellationToken);
        var hasPublished = caption?.PublishedCues != null && PlatformCaptionRules.Parse(caption.PublishedCues).Count > 0;
        var hasDraft = caption != null && PlatformCaptionRules.Parse(caption.DraftCues).Count > 0;
        var clip = await StatusAsync(SignVideo.Renderer.Clip, cancellationToken);
        var avatar = await StatusAsync(SignVideo.Renderer.Avatar, cancellationToken);

        return new SignVideoPrerequisitesDto
        {
            IsLessonVideo = await SignVideoStore.IsLessonVideoAsync(_context, assetId, cancellationToken),
            HasCaptions = hasPublished || hasDraft,
            HasPublishedCaptions = hasPublished,
            HasDraftCaptions = hasDraft,
            CaptionsProcessing = caption?.Status == CaptionStatus.Processing,
            DictionarySigns = await _context.SignGlosses.AsNoTracking()
                .CountAsync(g => g.Status != GlossStatus.Archived && g.SignLanguage == signLanguage, cancellationToken),
            UsableSigns = await SignDictionaryLoader.UsableClipCountAsync(_context, signLanguage, cancellationToken),
            UsableMotionSigns = await SignDictionaryLoader.UsableMotionCountAsync(_context, signLanguage, cancellationToken),
            RendererAvailable = clip.Available,
            RendererMessage = clip.Message,
            AvatarRendererAvailable = avatar.Available,
            AvatarRendererMessage = avatar.Message,
        };
    }

    private async Task<SignRendererStatus> StatusAsync(string kind, CancellationToken cancellationToken)
    {
        var renderer = SignVideoStore.Renderer(_renderers, kind);
        return renderer == null
            ? new SignRendererStatus(false, SignVideoRules.ErrorMessage(SignVideo.Errors.RendererNotConfigured))
            : await renderer.CheckAsync(cancellationToken);
    }
}
