using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// "Tạo phụ đề bằng AI" — only when the Platform Admin asks, so the AI is paid for only the videos that need it.
/// Marks the draft PROCESSING and hands the job to the background worker; the answer comes back at once and the
/// builder asks again until the draft is READY or FAILED. The published captions are not touched.
/// </summary>
public class GeneratePlatformAssetCaptionsUseCase : IUseCase<GeneratePlatformAssetCaptionsUseCaseInput, PlatformAssetCaptionsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICaptionTranscriber _transcriber;
    private readonly ICaptionJobQueue _queue;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _time;

    public GeneratePlatformAssetCaptionsUseCase(
        IApplicationDbContext context,
        ICaptionTranscriber transcriber,
        ICaptionJobQueue queue,
        ICurrentUser currentUser,
        TimeProvider time)
    {
        _context = context;
        _transcriber = transcriber;
        _queue = queue;
        _currentUser = currentUser;
        _time = time;
    }

    public async Task<PlatformAssetCaptionsDto> ExecuteAsync(GeneratePlatformAssetCaptionsUseCaseInput input)
    {
        var asset = await PlatformCaptionStore.VideoAsync(_context, input.AssetId);
        if (!_transcriber.IsConfigured)
        {
            throw new BadRequestException(PlatformCaptionRules.ErrorMessage("AI_NOT_CONFIGURED")!, "assetId", "AI_NOT_CONFIGURED");
        }

        var caption = await PlatformCaptionStore.FindAsync(_context, asset.Id);
        PlatformCaptionStore.EnsureNotProcessing(caption, _time.GetUtcNow());
        if (caption == null)
        {
            caption = new PlatformAssetCaption
            {
                AssetId = asset.Id,
                Language = PlatformCatalog.Captions.Vietnamese,
                Source = PlatformCatalog.Captions.SourceAi,
                DraftCues = "[]",
            };
            _context.PlatformAssetCaptions.Add(caption);
        }

        caption.Status = CaptionStatus.Processing;
        caption.ErrorCode = null;
        caption.RequestedByUserId = _currentUser.UserId;
        // Restarting a lost job changes no column: touch UpdatedAt so it is saved and no longer looks lost.
        caption.UpdatedAt = _time.GetUtcNow();
        await _context.SaveChangesAsync();

        _queue.Enqueue(caption.Id);
        return PlatformCaptionRules.Dto(asset.Id, caption, true);
    }
}
