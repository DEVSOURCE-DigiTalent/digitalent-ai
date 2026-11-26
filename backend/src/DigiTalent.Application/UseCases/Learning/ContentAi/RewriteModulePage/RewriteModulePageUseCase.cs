using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

/// <summary>
/// "Viết lại bằng AI" on one page of a module: Gemini rewrites that page for the module's competency at the course
/// level (Circular 02/2025), fixing the notes given (usually the last check). Nothing is saved — the author compares and
/// replaces the page or keeps it.
/// </summary>
public class RewriteModulePageUseCase : IUseCase<RewriteModulePageUseCaseInput, RewrittenPageOutput>
{
    private readonly IGeminiService _gemini;
    private readonly ITt02Framework _framework;
    private readonly IHtmlContentSanitizer _sanitizer;

    public RewriteModulePageUseCase(IGeminiService gemini, ITt02Framework framework, IHtmlContentSanitizer sanitizer)
    {
        _gemini = gemini;
        _framework = framework;
        _sanitizer = sanitizer;
    }

    public async Task<RewrittenPageOutput> ExecuteAsync(RewriteModulePageUseCaseInput input)
    {
        if (!_gemini.IsConfigured)
        {
            throw new BadRequestException("Chưa cấu hình khóa AI (Gemini).", "ai", "AI_NOT_CONFIGURED");
        }

        var (request, competencies) = ContentAiRequests.Build(input, _framework, _sanitizer);
        if (input.PageNumber > request.Lessons.Count)
        {
            throw new BadRequestException("Không có trang này trong mô-đun.", "pageNumber", "PAGE_NOT_FOUND");
        }

        var notes = input.Notes.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim()).ToList();
        var result = await _gemini.RewriteModulePageAsync(request, input.PageNumber, notes)
                     ?? throw new BadRequestException("AI chưa trả lời được, thử lại sau ít phút.", "ai", "AI_UNAVAILABLE");

        var html = _sanitizer.Sanitize(result.Html);
        if (_sanitizer.PlainText(html).Trim().Length == 0)
        {
            throw new BadRequestException("AI chưa trả lời được, thử lại sau ít phút.", "ai", "AI_UNAVAILABLE");
        }

        var known = competencies.SelectMany(c => c.Outcomes).Select(o => o.Id).ToHashSet();
        result.PageNumber = input.PageNumber;
        result.Html = ContentAiRequests.Clean(html);
        result.Title = ContentAiRequests.Clean(result.Title, title: true);
        result.Covers = result.Covers.Where(known.Contains).Distinct().ToList();
        return result;
    }
}
