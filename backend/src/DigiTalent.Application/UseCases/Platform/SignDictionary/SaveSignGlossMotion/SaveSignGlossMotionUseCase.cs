using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>
/// Stores the motion the browser took from the sign's video (MediaPipe Holistic landmarks). A published sign keeps
/// its status: learners get the new motion at once.
/// </summary>
public class SaveSignGlossMotionUseCase : IUseCase<SaveSignGlossMotionUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner? _urls;

    public SaveSignGlossMotionUseCase(IApplicationDbContext context, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(SaveSignGlossMotionUseCaseInput input)
    {
        var gloss = await SignGlossRules.FindAsync(_context, input.Id);
        SignGlossRules.EnsureNotArchived(gloss);
        if (gloss.VideoAssetId == null)
        {
            throw new BadRequestException("Ký hiệu chưa có video để lấy chuyển động.", "videoAssetId", "NO_VIDEO");
        }

        SignGlossRules.CheckMotion(input.Layout, input.Fps, input.Frames, input.Data, input.StartMs, input.EndMs);
        gloss.MotionLayout = input.Layout;
        gloss.MotionFps = input.Fps;
        gloss.MotionFrames = input.Frames;
        gloss.MotionData = input.Data;
        gloss.MotionStartMs = input.StartMs;
        gloss.MotionEndMs = input.EndMs;
        await _context.SaveChangesAsync();
        return SignGlossRules.Dto(gloss, await SignGlossRules.VideoAsync(_context, gloss.VideoAssetId), _urls);
    }
}
