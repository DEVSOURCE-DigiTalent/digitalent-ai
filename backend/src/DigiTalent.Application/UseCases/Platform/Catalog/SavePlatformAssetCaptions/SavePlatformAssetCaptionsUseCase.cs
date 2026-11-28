using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves the transcript of a lesson video edited (or typed from scratch) by the Platform Admin ("Lưu lời thoại"): the
/// input of its sign-language video, not shown to learners. Refused while the AI is working on it.
/// </summary>
public class SavePlatformAssetCaptionsUseCase : IUseCase<SavePlatformAssetCaptionsUseCaseInput, PlatformAssetCaptionsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICaptionTranscriber _transcriber;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;

    public SavePlatformAssetCaptionsUseCase(IApplicationDbContext context, ICaptionTranscriber transcriber, ICurrentUser currentUser, TimeProvider time)
    {
        _context = context;
        _transcriber = transcriber;
        _currentUser = currentUser;
        _time = time;
    }

    public async Task<PlatformAssetCaptionsDto> ExecuteAsync(SavePlatformAssetCaptionsUseCaseInput input)
    {
        var asset = await PlatformCaptionStore.VideoAsync(_context, input.AssetId);
        var cues = PlatformCaptionRules.CheckSaved(input.Cues);
        var caption = await PlatformCaptionStore.FindAsync(_context, asset.Id);
        PlatformCaptionStore.EnsureNotProcessing(caption, _time.GetUtcNow());

        if (caption == null)
        {
            caption = new PlatformAssetCaption
            {
                AssetId = asset.Id,
                Language = PlatformCatalog.Captions.Vietnamese,
                Source = PlatformCatalog.Captions.SourceManual,
            };
            _context.PlatformAssetCaptions.Add(caption);
        }
        else if (!PlatformCaptionRules.SameCues(PlatformCaptionRules.Parse(caption.DraftCues), cues))
        {
            caption.Source = PlatformCatalog.Captions.SourceManual;
        }

        caption.DraftCues = PlatformCaptionRules.Serialize(cues);
        caption.Status = CaptionStatus.Ready;
        caption.ErrorCode = null;
        caption.RequestedByUserId = _currentUser.UserId;
        await _context.SaveChangesAsync();
        return PlatformCaptionRules.Dto(asset.Id, caption, _transcriber.IsConfigured);
    }
}
