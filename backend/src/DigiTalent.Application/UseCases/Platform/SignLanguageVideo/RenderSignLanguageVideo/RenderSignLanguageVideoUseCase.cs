using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.SignLanguageVideo;

/// <summary>
/// "Tạo video ký hiệu" / "Tạo lại video" (202): checks every sign (video, rights) and queues the render; the builder
/// polls the status. Learners keep the published video until the new one is published.
/// </summary>
public class RenderSignLanguageVideoUseCase : IUseCase<RenderSignLanguageVideoUseCaseInput, SignLanguageVideoDto>
{
    private readonly IApplicationDbContext _context;
    private readonly SignVideoRenderStarter _starter;
    private readonly SignLanguageVideoReader _reader;

    public RenderSignLanguageVideoUseCase(IApplicationDbContext context, SignVideoRenderStarter starter, SignLanguageVideoReader reader)
    {
        _context = context;
        _starter = starter;
        _reader = reader;
    }

    public async Task<SignLanguageVideoDto> ExecuteAsync(RenderSignLanguageVideoUseCaseInput input)
    {
        var track = await SignVideoStore.TrackAsync(_context, input.TrackId);
        await _starter.StartAsync(track, input.Force);
        return await _reader.ReadAsync(track.SourceAssetId, track.SignLanguage);
    }
}
