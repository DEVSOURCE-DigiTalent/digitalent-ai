using DigiTalent.Application.UseCases.TrialProgram;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Trial;

/// <summary>
/// Rào chắn câu AI của báo cáo dùng thử (checklist docs/specs/2026-11-05-trial-ai-effectiveness-checklist.md §3): số phải có
/// trong số liệu, ≤ 8 từ, không thuật ngữ cấm, ưu tiên hợp lệ, lý do mức tối đa dẫn số liệu; câu bị loại thay bằng câu mẫu.
/// </summary>
public class TrialInsightGuardTests
{
    private static TrialInsightFacts Facts() => new()
    {
        Assessed = 12,
        HighRisk = 2,
        Domains = new[]
        {
            Domain(1, belowBasic: 1, belowSuggested: 8, average: 1.2m, suggested: 2, TrialCeilingPlanner.ReasonRaise, median: 1),
            Domain(2, belowBasic: 0, belowSuggested: 0, average: 2.4m, suggested: 3, TrialCeilingPlanner.ReasonAtMax, median: 3),
            Domain(3, belowBasic: 0, belowSuggested: 5, average: 1.5m, suggested: 2, TrialCeilingPlanner.ReasonRaise, median: 1),
            Domain(4, belowBasic: 7, belowSuggested: 7, average: 0.4m, suggested: 1, TrialCeilingPlanner.ReasonBelowBasic, median: 0, missedWrong: 9),
        },
    };

    private static TrialInsightDomainFacts Domain(
        int number, int belowBasic, int belowSuggested, decimal average, int suggested, string reason, int median, int missedWrong = 0) => new()
    {
        Number = number,
        Name = $"Lĩnh vực {number}",
        People = 12,
        Counts = new[] { belowBasic, 12 - belowBasic, 0, 0 },
        Average = average,
        CorrectRates = new int?[] { 42, 17, null },
        MissedQuestion = missedWrong > 0 ? "Nhận diện thư lừa đảo" : null,
        MissedWrong = missedWrong,
        MissedAnswered = missedWrong > 0 ? 12 : 0,
        SuggestedLevel = suggested,
        Reason = reason,
        BelowBasic = belowBasic,
        Median = median,
        BelowSuggested = belowSuggested,
    };

    [Theory]
    [InlineData("9/12 sai câu nhận diện lừa đảo", true)]
    [InlineData("Chỉ 42% đúng ở Cơ bản", true)]
    [InlineData("Trung bình 1,2 thấp nhất đội", true)]
    [InlineData("Trung bình 1.2 thấp nhất đội", true)]
    [InlineData("13/12 sai câu nhận diện lừa đảo", false)]
    [InlineData("Chỉ 55% đúng ở Cơ bản", false)]
    [InlineData("7/12 chưa đạt Cơ bản, 42% đúng Cơ bản", true)]
    [InlineData("Quá nửa đội chưa đạt mức nền, cần học ngay từ đầu", false)]
    [InlineData("Giữ trần Cơ bản", false)]
    [InlineData("Đạt mục tiêu Trung cấp", false)]
    [InlineData("**Ưu tiên** học ngay", false)]
    [InlineData("   ", false)]
    public void Text_must_be_short_and_use_only_numbers_from_the_data(string text, bool valid)
    {
        TrialInsightGuard.IsValidText(text, Facts().Numbers()).Should().Be(valid);
    }

    [Fact]
    public void Symbols_do_not_count_as_words()
    {
        TrialInsightGuard.WordCount("7/12 chưa đạt Cơ bản → giữ Cơ bản").Should().Be(8);
        TrialInsightGuard.WordCount("Trung vị Cơ bản → mở Trung cấp").Should().Be(7);
    }

    [Fact]
    public void Template_sentences_always_pass_the_guard()
    {
        var facts = Facts();
        var template = TrialInsightTemplate.Build(facts);

        template.Priorities.Concat(template.CeilingReasons).Should().OnlyContain(item => TrialInsightGuard.IsValidText(item.Text, facts.Numbers()));
        template.CeilingReasons.Should().OnlyContain(item => TrialInsightGuard.CheckReason(item.Text, facts.Numbers()) == null);
        template.Priorities.Select(p => p.DomainNumber).Should().Equal(4, 1, 3);
        template.CeilingReasons.Select(r => r.Text).Should().Equal(
            "Trung vị Cơ bản → mở Trung cấp", "Trung vị Nâng cao → giữ Nâng cao", "Trung vị Cơ bản → mở Trung cấp", "7/12 chưa đạt Cơ bản → giữ Cơ bản");
    }

    [Fact]
    public void Invalid_ai_items_are_replaced_by_templates_and_counted()
    {
        var draft = new TrialInsightDraft
        {
            Priorities = new()
            {
                new(4, "9/12 sai câu nhận diện lừa đảo"),
                new(2, "Đã giỏi, không cần học"),       // không còn ai cần học → loại
                new(4, "Trùng lĩnh vực"),                // trùng → loại
            },
            CeilingReasons = new()
            {
                new(1, "Trung vị Cơ bản, mở thêm một cấp"),
                new(2, "Nâng cao giúp cộng tác bền vững"), // không dẫn số liệu → câu mẫu
                new(3, "99% đúng ở Trung cấp"),          // số không có trong số liệu → câu mẫu
                new(4, "Quá nửa chưa đạt Cơ bản"),
            },
            Model = "test",
        };

        var (insights, rejected) = TrialInsightGuard.Apply(draft, Facts());

        insights.Priorities.Select(p => (p.DomainNumber, p.Source)).Should().Equal(
            (4, TrialInsightSource.Ai), (1, TrialInsightSource.Template), (3, TrialInsightSource.Template));
        insights.Priorities[0].Text.Should().Be("9/12 sai câu nhận diện lừa đảo");
        insights.CeilingReasons.Select(r => r.Source).Should().Equal(
            TrialInsightSource.Ai, TrialInsightSource.Template, TrialInsightSource.Template, TrialInsightSource.Ai);
        insights.CeilingReasons[1].Text.Should().Be("Trung vị Nâng cao → giữ Nâng cao");
        // 2 ưu tiên + lý do của lĩnh vực 2 (chung chung) và 3 (số sai), mỗi câu kèm luật vi phạm.
        rejected.Select(r => (r.Field, r.Domain, r.Rule)).Should().Equal(
            ("priorities", 2, TrialInsightGuard.RuleNotEligible),
            ("priorities", 4, TrialInsightGuard.RuleDuplicate),
            ("ceilingReasons", 2, TrialInsightGuard.RuleNoData),
            ("ceilingReasons", 3, TrialInsightGuard.RuleUnknownNumber));
    }

    [Theory]
    [InlineData("Trung vị Cơ bản, 42% đúng Trung cấp", null)]
    [InlineData("Quá nửa chưa đạt Cơ bản", null)]
    [InlineData("7/12 chưa đạt Cơ bản", null)]
    [InlineData("Nâng cao giúp cộng tác bền vững", TrialInsightGuard.RuleNoData)]
    [InlineData("Cần củng cố nền tảng trước", TrialInsightGuard.RuleNoData)]
    [InlineData("Trung vị Cơ bản, 55% đúng Trung cấp", TrialInsightGuard.RuleUnknownNumber)]
    public void Ceiling_reasons_must_cite_the_rule_data(string text, string? rule)
    {
        TrialInsightGuard.CheckReason(text, Facts().Numbers()).Should().Be(rule);
    }

    [Fact]
    public void Missing_reasons_fall_back_to_templates()
    {
        var draft = new TrialInsightDraft { Priorities = new() { new(4, "9/12 sai câu nhận diện lừa đảo") }, Model = "test" };

        var (insights, rejected) = TrialInsightGuard.Apply(draft, Facts());

        insights.CeilingReasons.Should().OnlyContain(r => r.Source == TrialInsightSource.Template);
        rejected.Should().HaveCount(4).And.OnlyContain(r => r.Field == "ceilingReasons" && r.Rule == TrialInsightGuard.RuleMissing);
    }
}
