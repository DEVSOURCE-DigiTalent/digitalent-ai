using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

/// <summary>
/// "Gợi ý bằng AI" in the course builder (admin catalog draft or company R&amp;D draft): Gemini drafts lesson pages
/// and review questions for the module from the Circular 02/2025 requirements of its competency at the course level.
/// Nothing is saved — the author adds what they keep.
/// </summary>
public class SuggestModuleContentUseCase : IUseCase<SuggestModuleContentUseCaseInput, ModuleContentSuggestionOutput>
{
    private readonly IGeminiService _gemini;
    private readonly ITt02Framework _framework;
    private readonly IHtmlContentSanitizer _sanitizer;
    private readonly ContentAiAccess _access;

    public SuggestModuleContentUseCase(IGeminiService gemini, ITt02Framework framework, IHtmlContentSanitizer sanitizer, ContentAiAccess access)
    {
        _access = access;
        _gemini = gemini;
        _framework = framework;
        _sanitizer = sanitizer;
    }

    public async Task<ModuleContentSuggestionOutput> ExecuteAsync(SuggestModuleContentUseCaseInput input)
    {
        await _access.EnsureAsync();
        if (!_gemini.IsConfigured)
        {
            throw new BadRequestException("Chưa cấu hình khóa AI (Gemini).", "ai", "AI_NOT_CONFIGURED");
        }

        var (request, competencies) = ContentAiRequests.Build(input, _framework, _sanitizer);
        var result = await _gemini.SuggestModuleContentAsync(request)
                     ?? throw new BadRequestException("AI chưa trả lời được, thử lại sau ít phút.", "ai", "AI_UNAVAILABLE");

        result.Competencies = competencies;
        result.Lessons = result.Lessons
            .Select(l => new SuggestedLessonDto { Title = ContentAiRequests.Clean(l.Title, title: true), Html = ContentAiRequests.Clean(_sanitizer.Sanitize(l.Html)) })
            .Where(l => _sanitizer.PlainText(l.Html).Trim().Length > 0)
            .ToList();
        foreach (var question in result.Questions)
        {
            question.Text = ContentAiRequests.Clean(question.Text);
            question.Explanation = question.Explanation is null ? null : ContentAiRequests.Clean(question.Explanation);
            foreach (var option in question.Options) option.Text = ContentAiRequests.Clean(option.Text);
        }
        var known = competencies.SelectMany(c => c.Outcomes).Select(o => o.Id).ToHashSet();
        foreach (var question in result.Questions.Where(q => q.OutcomeId != null && !known.Contains(q.OutcomeId)))
        {
            question.OutcomeId = null;
        }

        return result;
    }
}
