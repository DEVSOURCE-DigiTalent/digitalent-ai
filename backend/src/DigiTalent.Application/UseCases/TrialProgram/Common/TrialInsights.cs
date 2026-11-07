using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Số liệu ẩn danh của báo cáo dùng thử (không tên, không email, không đáp án) — đầu vào của AI, của câu mẫu và của rào chắn.
/// </summary>
public sealed class TrialInsightFacts
{
    public int Assessed { get; init; }
    public int HighRisk { get; init; }
    public IReadOnlyList<TrialInsightDomainFacts> Domains { get; init; } = Array.Empty<TrialInsightDomainFacts>();
    public IReadOnlyList<TrialInsightDepartmentFacts> Departments { get; init; } = Array.Empty<TrialInsightDepartmentFacts>();

    /// <summary>Mọi con số có trong số liệu (dạng chuẩn hóa, xem <see cref="TrialInsightGuard.NormalizeNumber"/>).</summary>
    public IReadOnlySet<string> Numbers()
    {
        var numbers = new HashSet<string>();
        void Add(decimal value) => numbers.Add(TrialInsightGuard.NormalizeNumber(value.ToString(CultureInfo.InvariantCulture)));

        foreach (var constant in new[] { 0, 1, 2, 3, 70 })
        {
            Add(constant);
        }

        Add(Assessed);
        Add(HighRisk);
        Add(Domains.Count);
        foreach (var domain in Domains)
        {
            foreach (var value in new decimal[] { domain.Number, domain.People, domain.BelowBasic, domain.BelowSuggested, domain.Average, domain.MissedWrong, domain.MissedAnswered })
            {
                Add(value);
            }

            foreach (var count in domain.Counts)
            {
                Add(count);
            }

            foreach (var rate in domain.CorrectRates.Where(r => r.HasValue))
            {
                Add(rate!.Value);
            }
        }

        foreach (var department in Departments)
        {
            Add(department.People);
            foreach (var average in department.Averages)
            {
                Add(average);
            }
        }

        return numbers;
    }
}

public sealed class TrialInsightDomainFacts
{
    public int Number { get; init; }
    public string Name { get; init; } = string.Empty;
    public int People { get; init; }
    /// <summary>Số người ở mức 0 (chưa đạt Cơ bản), 1, 2, 3.</summary>
    public IReadOnlyList<int> Counts { get; init; } = Array.Empty<int>();
    public decimal Average { get; init; }
    /// <summary>% câu đúng của cả đội ở Cơ bản, Trung cấp, Nâng cao (null khi cấp đó không có câu).</summary>
    public IReadOnlyList<int?> CorrectRates { get; init; } = Array.Empty<int?>();
    /// <summary>Câu sai nhiều nhất (nội dung câu hỏi, không kèm đáp án) và số người sai / số người trả lời.</summary>
    public string? MissedQuestion { get; init; }
    /// <summary>Cấp của câu sai nhiều nhất (0 khi không có).</summary>
    public int MissedTier { get; init; }
    public int MissedWrong { get; init; }
    public int MissedAnswered { get; init; }
    /// <summary>Mức tối đa planner đề xuất (1–3) và mã lý do (<see cref="TrialCeilingPlanner"/>).</summary>
    public int SuggestedLevel { get; init; }
    public string Reason { get; init; } = string.Empty;
    public int BelowBasic { get; init; }
    public int Median { get; init; }
    /// <summary>Số người dưới mức tối đa đề xuất (còn cần học).</summary>
    public int BelowSuggested { get; init; }
}

public sealed class TrialInsightDepartmentFacts
{
    public string Name { get; init; } = string.Empty;
    public int People { get; init; }
    public IReadOnlyList<decimal> Averages { get; init; } = Array.Empty<decimal>();
}

/// <summary>Bản nháp AI trả về (chưa qua rào chắn).</summary>
public sealed class TrialInsightDraft
{
    public List<TrialInsightDraftItem> Priorities { get; init; } = new();
    public List<TrialInsightDraftItem> CeilingReasons { get; init; } = new();
    public string Model { get; init; } = string.Empty;
}

public sealed record TrialInsightDraftItem(int Domain, string Text);

/// <summary>
/// Gợi ý hiện trên báo cáo (jsonb <c>trial_reports.insights</c>): tối đa 3 lĩnh vực ưu tiên và lý do mức tối đa của từng lĩnh
/// vực, mỗi câu ≤ <see cref="TrialInsightGuard.MaxWords"/> từ. <see cref="TrialInsightItemDto.Source"/> cho biết câu của AI hay câu mẫu.
/// </summary>
public class TrialInsightsDto
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public List<TrialInsightItemDto> Priorities { get; set; } = new();
    public List<TrialInsightItemDto> CeilingReasons { get; set; } = new();

    public string ToJson() => JsonSerializer.Serialize(this, Json);

    public static TrialInsightsDto FromJson(string? json) =>
        string.IsNullOrWhiteSpace(json) ? new TrialInsightsDto() : JsonSerializer.Deserialize<TrialInsightsDto>(json, Json) ?? new TrialInsightsDto();
}

public class TrialInsightItemDto
{
    public int DomainNumber { get; set; }
    public string Text { get; set; } = string.Empty;
    /// <summary>AI | TEMPLATE.</summary>
    public string Source { get; set; } = TrialInsightSource.Template;
}

public static class TrialInsightSource
{
    public const string Ai = "AI";
    public const string Template = "TEMPLATE";
}

/// <summary>Câu mẫu — cùng vị trí, cùng giới hạn với câu AI; dùng khi không có khóa AI, AI lỗi hoặc câu AI bị rào chắn loại.</summary>
public static class TrialInsightTemplate
{
    public const int MaxPriorities = 3;

    private static readonly string[] Levels = { "chưa đạt", "Cơ bản", "Trung cấp", "Nâng cao" };

    public static TrialInsightsDto Build(TrialInsightFacts facts) => new()
    {
        Priorities = Eligible(facts)
            .Take(MaxPriorities)
            .Select(d => Item(d.Number, PriorityText(d)))
            .ToList(),
        CeilingReasons = facts.Domains.Select(d => Item(d.Number, CeilingReasonText(d))).ToList(),
    };

    /// <summary>Lĩnh vực còn người dưới mức tối đa đề xuất, xếp theo nhu cầu: nhiều người chưa đạt Cơ bản, nhiều người cần học, trung bình thấp.</summary>
    public static IEnumerable<TrialInsightDomainFacts> Eligible(TrialInsightFacts facts) =>
        facts.Domains
            .Where(d => d.BelowSuggested > 0)
            .OrderByDescending(d => d.BelowBasic)
            .ThenByDescending(d => d.BelowSuggested)
            .ThenBy(d => d.Average)
            .ThenBy(d => d.Number);

    public static string PriorityText(TrialInsightDomainFacts d) =>
        d.BelowBasic > 0
            ? $"{d.BelowBasic}/{d.People} chưa đạt Cơ bản"
            : $"{d.BelowSuggested}/{d.People} chưa tới {Levels[d.SuggestedLevel]}";

    public static string CeilingReasonText(TrialInsightDomainFacts d) => d.People == 0
        ? "Chưa có bài làm → giữ Cơ bản"
        : d.Reason switch
        {
            TrialCeilingPlanner.ReasonBelowBasic => $"{d.BelowBasic}/{d.People} chưa đạt Cơ bản → giữ Cơ bản",
            TrialCeilingPlanner.ReasonMedianZero => "Trung vị chưa đạt → giữ Cơ bản",
            TrialCeilingPlanner.ReasonAtMax => "Trung vị Nâng cao → giữ Nâng cao",
            _ => $"Trung vị {Levels[d.Median]} → mở {Levels[d.SuggestedLevel]}",
        };

    private static TrialInsightItemDto Item(int domain, string text) =>
        new() { DomainNumber = domain, Text = text, Source = TrialInsightSource.Template };
}

/// <summary>
/// Rào chắn cho câu AI (không có người duyệt, checklist docs/specs/2026-11-05-trial-ai-effectiveness-checklist.md §3): câu
/// rỗng, dài quá <see cref="MaxWords"/> từ, có số không nằm trong số liệu, dùng từ bị cấm hoặc ký tự định dạng → thay bằng câu
/// mẫu. Ưu tiên phải là lĩnh vực còn người cần học và không trùng; thiếu thì bù bằng câu mẫu. Lý do mức tối đa còn phải dẫn
/// số liệu của luật (không phải lợi ích chung chung). Mỗi câu bị thay kèm lý do (<see cref="TrialInsightRejection"/>) để đo
/// hiệu quả AI.
/// </summary>
public static partial class TrialInsightGuard
{
    /// <summary>Prompt yêu cầu ≤ <see cref="PromptWords"/> từ; rào chắn chấp nhận tới <see cref="MaxWords"/> (âm tiết tiếng Việt).</summary>
    public const int PromptWords = 8;
    public const int MaxWords = 10;
    public const int MaxLength = 80;

    public const string RuleEmpty = "EMPTY";
    public const string RuleFormat = "FORMAT";
    public const string RuleBannedTerm = "BANNED_TERM";
    public const string RuleTooLong = "TOO_LONG";
    public const string RuleUnknownNumber = "UNKNOWN_NUMBER";
    public const string RuleNoData = "NO_DATA";
    public const string RuleNotEligible = "NOT_ELIGIBLE";
    public const string RuleDuplicate = "DUPLICATE";
    public const string RuleMissing = "MISSING";

    /// <summary>Thuật ngữ không dùng trên UI (docs/specs/2026-10-31-trial-ai-report-roadmap.md §0).</summary>
    private static readonly string[] BannedTerms = { "trần", "mục tiêu", "mentor", "http", "@" };

    /// <summary>Cách nói số liệu của luật <see cref="TrialCeilingPlanner"/> không cần con số.</summary>
    private static readonly string[] RuleTerms = { "trung vị", "quá nửa" };

    public static (TrialInsightsDto Insights, IReadOnlyList<TrialInsightRejection> Rejected) Apply(TrialInsightDraft draft, TrialInsightFacts facts)
    {
        var template = TrialInsightTemplate.Build(facts);
        var numbers = facts.Numbers();
        var rejected = new List<TrialInsightRejection>();

        var eligible = TrialInsightTemplate.Eligible(facts).Select(d => d.Number).ToHashSet();
        var priorities = new List<TrialInsightItemDto>();
        foreach (var item in draft.Priorities.Take(TrialInsightTemplate.MaxPriorities))
        {
            var rule = !eligible.Contains(item.Domain) ? RuleNotEligible
                : priorities.Any(p => p.DomainNumber == item.Domain) ? RuleDuplicate
                : Check(item.Text, numbers);
            if (rule == null)
            {
                priorities.Add(new TrialInsightItemDto { DomainNumber = item.Domain, Text = item.Text.Trim(), Source = TrialInsightSource.Ai });
            }
            else
            {
                rejected.Add(new TrialInsightRejection("priorities", item.Domain, rule, item.Text));
            }
        }

        foreach (var fallback in template.Priorities)
        {
            if (priorities.Count >= template.Priorities.Count)
            {
                break;
            }

            if (priorities.All(p => p.DomainNumber != fallback.DomainNumber))
            {
                priorities.Add(fallback);
            }
        }

        var reasons = facts.Domains.Select(domain =>
        {
            var candidate = draft.CeilingReasons.FirstOrDefault(r => r.Domain == domain.Number);
            var rule = candidate == null ? RuleMissing : CheckReason(candidate.Text, numbers);
            if (rule == null)
            {
                return new TrialInsightItemDto { DomainNumber = domain.Number, Text = candidate!.Text.Trim(), Source = TrialInsightSource.Ai };
            }

            rejected.Add(new TrialInsightRejection("ceilingReasons", domain.Number, rule, candidate?.Text));
            return template.CeilingReasons.First(r => r.DomainNumber == domain.Number);
        }).ToList();

        return (new TrialInsightsDto { Priorities = priorities, CeilingReasons = reasons }, rejected);
    }

    public static bool IsValidText(string? text, IReadOnlySet<string> numbers) => Check(text, numbers) == null;

    /// <summary>Lý do câu không dùng được (null = dùng được).</summary>
    public static string? Check(string? text, IReadOnlySet<string> numbers)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return RuleEmpty;
        }

        var value = text.Trim();
        if (value.Length > MaxLength || value.IndexOfAny(new[] { '\n', '\r', '*', '#', '`', '<', '>', '[', ']' }) >= 0)
        {
            return RuleFormat;
        }

        if (BannedTerms.Any(term => value.Contains(term, StringComparison.OrdinalIgnoreCase)))
        {
            return RuleBannedTerm;
        }

        if (WordCount(value) > MaxWords)
        {
            return RuleTooLong;
        }

        return NumberPattern().Matches(value).All(match => numbers.Contains(NormalizeNumber(match.Value))) ? null : RuleUnknownNumber;
    }

    /// <summary>
    /// Lý do của một mức tối đa: như <see cref="Check"/>, và phải dẫn số liệu (con số, "trung vị", "quá nửa") — câu như "Nâng
    /// cao giúp cộng tác bền vững" không giúp chủ doanh nghiệp quyết định (checklist §4 dòng 2.3).
    /// </summary>
    public static string? CheckReason(string? text, IReadOnlySet<string> numbers) =>
        Check(text, numbers) ?? (CitesData(text!) ? null : RuleNoData);

    private static bool CitesData(string text) =>
        NumberPattern().IsMatch(text) || RuleTerms.Any(term => text.Contains(term, StringComparison.OrdinalIgnoreCase));

    /// <summary>Số từ (âm tiết tiếng Việt cách nhau bởi khoảng trắng); ký hiệu đứng riêng như "→", "·" không tính.</summary>
    public static int WordCount(string text) =>
        text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Count(token => token.Any(char.IsLetterOrDigit));

    /// <summary>"1,5" và "1.5" là một số; "2.0" = "2".</summary>
    public static string NormalizeNumber(string token)
    {
        var value = decimal.Parse(token.Replace(',', '.'), NumberStyles.Number, CultureInfo.InvariantCulture);
        return value.ToString("0.#", CultureInfo.InvariantCulture);
    }

    [GeneratedRegex(@"\d+(?:[.,]\d+)?")]
    private static partial Regex NumberPattern();
}

/// <summary>Một câu AI bị rào chắn thay bằng câu mẫu: trường, lĩnh vực, luật vi phạm và câu gốc.</summary>
public sealed record TrialInsightRejection(string Field, int Domain, string Rule, string? Text);
