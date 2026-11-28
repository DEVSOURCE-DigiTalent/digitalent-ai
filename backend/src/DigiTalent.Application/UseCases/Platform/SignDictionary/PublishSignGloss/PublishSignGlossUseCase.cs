using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>A checked sign becomes usable: the AI may put it in sign sequences and learners see the avatar sign it.</summary>
public class PublishSignGlossUseCase : IUseCase<PublishSignGlossUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _audit;
    private readonly TimeProvider _time;
    private readonly IPlatformAssetUrlSigner? _urls;

    public PublishSignGlossUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService audit, TimeProvider time, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _currentUser = currentUser;
        _audit = audit;
        _time = time;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(PublishSignGlossUseCaseInput input)
    {
        var gloss = await SignGlossRules.FindAsync(_context, input.Id);
        SignGlossRules.EnsureNotArchived(gloss);
        if (gloss.MotionData == null)
        {
            throw new BadRequestException("Ký hiệu chưa có chuyển động. Lấy chuyển động từ video trước khi xuất bản.", "motion", "NO_MOTION");
        }

        gloss.Status = GlossStatus.Published;
        gloss.PublishedAt = _time.GetUtcNow();
        gloss.PublishedByUserId = _currentUser.UserId;
        await _context.SaveChangesAsync();
        await _audit.LogAsync("SIGN_GLOSS_PUBLISHED", "sign_glosses", gloss.Id,
            newValues: new { gloss = gloss.Gloss, kind = gloss.Kind, source = gloss.SourceName }, entityLabel: $"Ký hiệu {gloss.Gloss}");
        return SignGlossRules.Dto(gloss, await SignGlossRules.VideoAsync(_context, gloss.VideoAssetId), _urls);
    }
}
