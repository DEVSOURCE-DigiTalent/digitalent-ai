using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using GlossStatus = DigiTalent.Domain.Constants.Statuses.SignGloss;

namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>"Xóa" a sign = ARCHIVED (no hard delete): it leaves the dictionary, its text can be added again.</summary>
public class ArchiveSignGlossUseCase : IUseCase<ArchiveSignGlossUseCaseInput, SignGlossDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _audit;
    private readonly IPlatformAssetUrlSigner? _urls;

    public ArchiveSignGlossUseCase(IApplicationDbContext context, IAuditService audit, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _audit = audit;
        _urls = urls;
    }

    public async Task<SignGlossDto> ExecuteAsync(ArchiveSignGlossUseCaseInput input)
    {
        var gloss = await SignGlossRules.FindAsync(_context, input.Id);
        SignGlossRules.EnsureNotArchived(gloss);
        gloss.Status = GlossStatus.Archived;
        await _context.SaveChangesAsync();
        await _audit.LogAsync("SIGN_GLOSS_ARCHIVED", "sign_glosses", gloss.Id, newValues: new { gloss = gloss.Gloss, kind = gloss.Kind },
            entityLabel: $"Ký hiệu {gloss.Gloss}");
        return SignGlossRules.Dto(gloss, await SignGlossRules.VideoAsync(_context, gloss.VideoAssetId), _urls);
    }
}
