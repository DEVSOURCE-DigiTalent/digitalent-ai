using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

/// <summary>
/// "Kiểm tra theo Thông tư" in the course builder: Gemini checks the module's lessons and review questions against
/// each requirement of its competency at the course level (Circular 02/2025) and lists issues and fixes. The answer
/// only advises the author; a requirement the AI skipped stays UNCHECKED rather than being guessed.
/// </summary>
public class CheckModuleContentUseCase : IUseCase<CheckModuleContentUseCaseInput, ModuleContentCheckOutput>
{
    private readonly IGeminiService _gemini;
    private readonly ITt02Framework _framework;
    private readonly IHtmlContentSanitizer _sanitizer;

    public CheckModuleContentUseCase(IGeminiService gemini, ITt02Framework framework, IHtmlContentSanitizer sanitizer)
    {
        _gemini = gemini;
        _framework = framework;
        _sanitizer = sanitizer;
    }

    public async Task<ModuleContentCheckOutput> ExecuteAsync(CheckModuleContentUseCaseInput input)
    {
        if (!_gemini.IsConfigured)
        {
            throw new BadRequestException("Chưa cấu hình khóa AI (Gemini).", "ai", "AI_NOT_CONFIGURED");
        }

        var (request, competencies) = ContentAiRequests.Build(input, _framework, _sanitizer);
        if (!ContentAiRequests.HasText(request) && request.Questions.Count == 0)
        {
            throw new BadRequestException("Mô-đun chưa có nội dung để kiểm tra.", "lessons", "NOTHING_TO_CHECK");
        }

        var result = await _gemini.CheckModuleContentAsync(request)
                     ?? throw new BadRequestException("AI chưa trả lời được, thử lại sau ít phút.", "ai", "AI_UNAVAILABLE");

        var answered = result.Outcomes
            .Where(o => !string.IsNullOrWhiteSpace(o.Id))
            .GroupBy(o => o.Id.Trim())
            .ToDictionary(g => g.Key, g => g.First());
        result.Outcomes = competencies
            .SelectMany(c => c.Outcomes.Select(o =>
            {
                var answer = answered.GetValueOrDefault(o.Id);
                var status = answer?.Status?.Trim().ToUpperInvariant();
                return new CheckedOutcomeDto
                {
                    Id = o.Id,
                    CompetencyCode = c.Code,
                    Bac = o.Bac,
                    Text = o.Text,
                    Status = status is ContentOutcomeStatus.Met or ContentOutcomeStatus.Partial or ContentOutcomeStatus.Missing
                        ? status
                        : ContentOutcomeStatus.Unchecked,
                    Evidence = answer?.Evidence?.Trim(),
                };
            }))
            .ToList();
        result.QuestionProblems = result.QuestionProblems
            .Where(p => p.Number >= 1 && p.Number <= request.Questions.Count && !string.IsNullOrWhiteSpace(p.Problem))
            .ToList();
        var known = competencies.SelectMany(c => c.Outcomes).Select(o => o.Id).ToHashSet();
        result.Pages = result.Pages
            .Where(p => p.Number >= 1 && p.Number <= request.Lessons.Count && request.Lessons[p.Number - 1] != ContentAiRequests.EmptyPage)
            .GroupBy(p => p.Number)
            .Select(g => g.First())
            .Select(p => new PageReviewDto
            {
                Number = p.Number,
                Status = p.Status?.Trim().ToUpperInvariant() switch
                {
                    PageReviewStatus.Ok => PageReviewStatus.Ok,
                    PageReviewStatus.Problem => PageReviewStatus.Problem,
                    _ => PageReviewStatus.Weak,
                },
                Covers = p.Covers.Where(known.Contains).Distinct().ToList(),
                Notes = p.Notes.Where(n => !string.IsNullOrWhiteSpace(n)).Select(n => n.Trim()).ToList(),
            })
            .OrderBy(p => p.Number)
            .ToList();
        result.Verdict = result.Verdict?.Trim().ToUpperInvariant() switch
        {
            ContentCheckVerdict.Met => ContentCheckVerdict.Met,
            ContentCheckVerdict.NotMet => ContentCheckVerdict.NotMet,
            _ => ContentCheckVerdict.NeedsWork,
        };
        result.Competencies = competencies;
        return result;
    }
}
