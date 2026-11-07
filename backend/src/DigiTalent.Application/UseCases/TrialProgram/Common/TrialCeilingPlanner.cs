using DigiTalent.Application.UseCases.Pulse;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Mức của một người đã làm bài, theo thứ tự lĩnh vực của báo cáo.</summary>
public sealed record TrialPlanPerson(Guid DepartmentId, IReadOnlyList<int> Levels);

/// <summary>
/// Đề xuất phạm vi đào tạo (mức tối đa mỗi lĩnh vực, ma trận <c>capability_ceilings</c>) từ kết quả trắc nghiệm — luật thuần,
/// AI không đổi con số. Mỗi lĩnh vực: quá nửa đội chưa đạt Cơ bản hoặc trung vị = 0 → giữ Cơ bản; còn lại mở thêm một cấp so
/// với trung vị (tối đa Nâng cao). Phòng ban chỉ có mức riêng khi thấp hơn doanh nghiệp (phòng ban ≤ doanh nghiệp ≤ 3).
/// </summary>
public static class TrialCeilingPlanner
{
    public const string OptionSaving = "SAVING";
    public const string OptionBalanced = "BALANCED";
    public const string OptionFull = "FULL";

    public const string ReasonBelowBasic = "BELOW_BASIC";
    public const string ReasonMedianZero = "MEDIAN_ZERO";
    public const string ReasonRaise = "RAISE";
    public const string ReasonAtMax = "AT_MAX";

    /// <summary>Phương án Tiết kiệm chỉ mở Trung cấp cho số lĩnh vực này (lĩnh vực đề xuất ≥ Trung cấp, trung bình thấp nhất).</summary>
    public const int SavingRaisedDomains = 2;

    private const int MinLevel = 1;

    public static TrialPlanDto Plan(IReadOnlyList<TrialPlanPerson> people, int domainCount)
    {
        var domains = Enumerable.Range(0, domainCount).Select(index => DomainOf(people, index)).ToList();
        var organization = domains.Select(d => d.SuggestedLevel).ToList();

        var departments = people
            .GroupBy(p => p.DepartmentId)
            .Select(group => new TrialPlanDepartmentDto
            {
                DepartmentId = group.Key,
                Levels = Enumerable.Range(0, domainCount)
                    .Select(index =>
                    {
                        var own = DomainOf(group.ToList(), index).SuggestedLevel;
                        return own < organization[index] ? own : (int?)null;
                    })
                    .ToList(),
            })
            .Where(d => d.Levels.Any(level => level != null))
            .OrderBy(d => d.DepartmentId)
            .ToList();

        var saving = domains
            .Where(d => d.SuggestedLevel >= 2)
            .OrderBy(d => d.Average).ThenBy(d => d.Index)
            .Take(SavingRaisedDomains)
            .Select(d => d.Index)
            .ToHashSet();

        return new TrialPlanDto
        {
            Domains = domains,
            Options = new List<TrialPlanOptionDto>
            {
                new() { Kind = OptionSaving, Organization = domains.Select(d => saving.Contains(d.Index) ? 2 : MinLevel).ToList() },
                new() { Kind = OptionBalanced, Organization = organization, Departments = departments },
                new() { Kind = OptionFull, Organization = domains.Select(_ => PulseRules.MaxLevel).ToList() },
            },
        };
    }

    /// <summary>Trung vị dưới (phần tử thứ ⌊(n−1)/2⌋ sau khi sắp xếp) — với số người chẵn không vượt lên mức chưa ai giữ vững.</summary>
    public static int LowerMedian(IEnumerable<int> values)
    {
        var sorted = values.OrderBy(v => v).ToList();
        return sorted.Count == 0 ? 0 : sorted[(sorted.Count - 1) / 2];
    }

    private static TrialPlanDomainDto DomainOf(IReadOnlyList<TrialPlanPerson> people, int index)
    {
        var levels = people.Select(p => p.Levels[index]).ToList();
        var belowBasic = levels.Count(level => level == 0);
        var median = LowerMedian(levels);
        var (level, reason) =
            levels.Count == 0 || belowBasic * 2 > levels.Count ? (MinLevel, ReasonBelowBasic)
            : median == 0 ? (MinLevel, ReasonMedianZero)
            : median >= PulseRules.MaxLevel ? (PulseRules.MaxLevel, ReasonAtMax)
            : (median + 1, ReasonRaise);

        return new TrialPlanDomainDto
        {
            Index = index,
            People = levels.Count,
            BelowBasic = belowBasic,
            Median = median,
            Average = levels.Count == 0 ? 0m : Math.Round((decimal)levels.Average(), 1, MidpointRounding.AwayFromZero),
            SuggestedLevel = level,
            Reason = reason,
        };
    }
}

public class TrialPlanDto
{
    public List<TrialPlanDomainDto> Domains { get; set; } = new();
    /// <summary>SAVING · BALANCED (đề xuất) · FULL.</summary>
    public List<TrialPlanOptionDto> Options { get; set; } = new();

    public TrialPlanOptionDto Balanced => Options.First(o => o.Kind == TrialCeilingPlanner.OptionBalanced);
}

/// <summary>Số liệu planner của một lĩnh vực (theo thứ tự lĩnh vực của báo cáo).</summary>
public class TrialPlanDomainDto
{
    public int Index { get; set; }
    public int People { get; set; }
    public int BelowBasic { get; set; }
    public int Median { get; set; }
    public decimal Average { get; set; }
    /// <summary>Mức tối đa đề xuất cho doanh nghiệp (1–3).</summary>
    public int SuggestedLevel { get; set; }
    /// <summary>BELOW_BASIC | MEDIAN_ZERO | RAISE | AT_MAX.</summary>
    public string Reason { get; set; } = string.Empty;
}

/// <summary>Một phương án phạm vi đào tạo: mức tối đa của doanh nghiệp mỗi lĩnh vực và mức riêng của phòng ban (nếu thấp hơn).</summary>
public class TrialPlanOptionDto
{
    public string Kind { get; set; } = string.Empty;
    public List<int> Organization { get; set; } = new();
    public List<TrialPlanDepartmentDto> Departments { get; set; } = new();
}

public class TrialPlanDepartmentDto
{
    public Guid DepartmentId { get; set; }
    /// <summary>Mức riêng mỗi lĩnh vực; null = theo doanh nghiệp.</summary>
    public List<int?> Levels { get; set; } = new();
}
