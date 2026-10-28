using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Một lĩnh vực của Khung TT02 trong doanh nghiệp (thứ tự hiển thị 1..6).</summary>
public sealed record TrialDomainInfo(Guid CategoryId, int Number, string Code, string Name);

/// <summary>Một câu của đề tổng hợp, kèm lĩnh vực và cấp của khóa đã cho câu hỏi.</summary>
public sealed record TrialPaperItem(Guid CategoryId, int Tier, PulseQuizQuestion Question);

public sealed record TrialPaper(IReadOnlyList<TrialDomainInfo> Domains, IReadOnlyList<TrialPaperItem> Items);

/// <summary>
/// Đề đánh giá tổng hợp dùng thử: với mỗi cấp (Cơ bản → Trung cấp → Nâng cao) và mỗi lĩnh vực, rút
/// <see cref="TrialProgramRules.ChoicePerCell"/> câu từ ngân hàng ôn tập của khóa chuẩn ở ô đó (<see cref="PulseCatalogReader"/>).
/// Thứ tự câu và phương án cố định cho mỗi nhân viên, nên lúc bắt đầu phiên và lúc nộp thấy đúng một đề.
/// </summary>
public class TrialAssessmentPaper
{
    private const int SeedSalt = 104729;

    private readonly IApplicationDbContext _context;
    private readonly PulseCatalogReader _catalog;
    private readonly PulseModuleReader _modules;

    public TrialAssessmentPaper(IApplicationDbContext context, PulseCatalogReader catalog, PulseModuleReader modules)
    {
        _context = context;
        _catalog = catalog;
        _modules = modules;
    }

    /// <summary>Các lĩnh vực có khóa chuẩn của doanh nghiệp, theo thứ tự của khung.</summary>
    public async Task<List<TrialDomainInfo>> LoadDomainsAsync(Guid organizationId)
    {
        var courses = await _catalog.LoadAsync(organizationId);
        return await DomainsOfAsync(courses);
    }

    public async Task<TrialPaper> BuildAsync(Guid organizationId, Guid employeeId)
    {
        var courses = await _catalog.LoadAsync(organizationId);
        var domains = await DomainsOfAsync(courses);
        var modules = await _modules.LoadModulesAsync(courses.Select(c => c.CourseId).ToList(), includeContent: false);
        var quizIds = modules.Values.SelectMany(m => m).Where(m => m.QuizAssessmentId.HasValue)
            .Select(m => m.QuizAssessmentId!.Value).Distinct().ToList();
        var pools = await LoadPoolsAsync(quizIds);

        var items = new List<TrialPaperItem>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var tier = 1; tier <= PulseRules.MaxLevel; tier++)
        {
            foreach (var domain in domains)
            {
                var course = courses.FirstOrDefault(c => c.CategoryId == domain.CategoryId && c.Tier == tier);
                if (course == null)
                {
                    continue;
                }

                var pool = (modules.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>())
                    .Where(m => m.QuizAssessmentId.HasValue)
                    .SelectMany(m => pools.GetValueOrDefault(m.QuizAssessmentId!.Value) ?? new List<PulseQuizQuestion>())
                    .OrderBy(q => q.QuestionId)
                    .ToList();
                var random = new Random(PulseQuizReader.Seed(employeeId, course.CourseId, SeedSalt));
                var picked = PulseQuizReader.Shuffle(pool, random)
                    .Where(q => q.Options.Count > 1 && seen.Add(q.Content.Trim()))
                    .Take(TrialProgramRules.ChoicePerCell)
                    .Select(q => q with { Options = PulseQuizReader.Shuffle(q.Options.ToList(), random) });
                items.AddRange(picked.Select(q => new TrialPaperItem(domain.CategoryId, tier, q)));
            }
        }

        return new TrialPaper(domains, items);
    }

    private async Task<List<TrialDomainInfo>> DomainsOfAsync(IReadOnlyCollection<PulseCourseRef> courses)
    {
        var categoryIds = courses.Select(c => c.CategoryId).Distinct().ToList();
        var categories = await _context.CompetencyCategories.AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new { c.Id, c.Code, c.Name })
            .ToListAsync();
        return categories
            .Select((c, index) => new TrialDomainInfo(c.Id, index + 1, c.Code, PulseLearnerReader.DisplayName(c.Name)))
            .ToList();
    }

    /// <summary>Ngân hàng câu hỏi của nhiều bài ôn tập trong hai truy vấn.</summary>
    private async Task<Dictionary<Guid, List<PulseQuizQuestion>>> LoadPoolsAsync(IReadOnlyCollection<Guid> quizIds)
    {
        if (quizIds.Count == 0)
        {
            return new Dictionary<Guid, List<PulseQuizQuestion>>();
        }

        var questions = await (
                from link in _context.AssessmentQuestions.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                where quizIds.Contains(link.AssessmentId)
                select new { link.AssessmentId, question.Id, question.Content, question.Explanation, link.SortOrder })
            .ToListAsync();
        var ids = questions.Select(q => q.Id).Distinct().ToList();
        var options = (await _context.QuestionOptions.AsNoTracking()
                .Where(o => ids.Contains(o.QuestionId))
                .OrderBy(o => o.SortOrder)
                .Select(o => new { o.Id, o.QuestionId, o.Content, o.IsCorrect })
                .ToListAsync())
            .GroupBy(o => o.QuestionId)
            .ToDictionary(g => g.Key, g => g.Select(o => new PulseQuizOption(o.Id, o.Content, o.IsCorrect)).ToList());

        return questions
            .GroupBy(q => q.AssessmentId)
            .ToDictionary(g => g.Key, g => g
                .OrderBy(q => q.SortOrder)
                .Select(q => new PulseQuizQuestion(q.Id, q.Content, q.Explanation, q.SortOrder,
                    options.GetValueOrDefault(q.Id) ?? new List<PulseQuizOption>()))
                .ToList());
    }

    /// <summary>Đề phát cho nhân viên (không kèm đáp án), đánh số liên tục qua ba cấp.</summary>
    public static List<TrialExamQuestionDto> ToDto(TrialPaper paper) =>
        paper.Items.Select((item, index) => new TrialExamQuestionDto
        {
            QuestionId = item.Question.QuestionId,
            Number = index + 1,
            Tier = item.Tier,
            DomainNumber = paper.Domains.First(d => d.CategoryId == item.CategoryId).Number,
            DomainName = paper.Domains.First(d => d.CategoryId == item.CategoryId).Name,
            Content = item.Question.Content,
            Options = item.Question.Options.Select(o => new PulseOptionDto { OptionId = o.OptionId, Content = o.Content }).ToList(),
        }).ToList();
}

/// <summary>Một câu trắc nghiệm của đề tổng hợp.</summary>
public class TrialExamQuestionDto
{
    public Guid QuestionId { get; set; }
    public int Number { get; set; }
    /// <summary>Cấp của câu: 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.</summary>
    public int Tier { get; set; }
    public int DomainNumber { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<PulseOptionDto> Options { get; set; } = new();
}
