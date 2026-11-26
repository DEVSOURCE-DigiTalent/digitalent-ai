using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.ContentAi;
using DigiTalent.Infrastructure.AI.Frameworks;
using DigiTalent.Infrastructure.Content;
using FluentAssertions;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Learning;

/// <summary>
/// The course builder's AI help sends Gemini only the Circular 02/2025 requirements of the module's competency at the
/// course level, cleans what comes back and never makes up a result.
/// </summary>
public class ContentAiTests
{
    private readonly Tt02Framework _framework = new();
    private readonly HtmlContentSanitizer _sanitizer = new();

    [Fact]
    public void The_framework_file_has_the_24_competencies_with_8_levels_each()
    {
        var all = Enumerable.Range(1, 6).SelectMany(_framework.OfDomain).ToList();
        all.Should().HaveCount(24);
        all.Should().OnlyContain(c => c.Levels.Count == 8 && c.Levels.All(l => l.Outcomes.Count > 0));
        Enumerable.Range(1, 6).Select(d => _framework.OfDomain(d).Count).Should().Equal(3, 6, 4, 4, 4, 3);
        _framework.Find("4.2")!.ForSystemLevel(2).Select(l => l.Bac).Should().Equal(3, 4);
        _framework.DomainName(6).Should().Be("Ứng dụng trí tuệ nhân tạo");
    }

    [Fact]
    public async Task Suggest_sends_the_module_competency_at_the_course_level_and_cleans_the_answer()
    {
        ModuleContentAiRequest? sent = null;
        var gemini = new Mock<IGeminiService>();
        gemini.Setup(g => g.IsConfigured).Returns(true);
        gemini.Setup(g => g.SuggestModuleContentAsync(It.IsAny<ModuleContentAiRequest>(), It.IsAny<CancellationToken>()))
            .Callback<ModuleContentAiRequest, CancellationToken>((r, _) => sent = r)
            .ReturnsAsync(new ModuleContentSuggestionOutput
            {
                Lessons = { new SuggestedLessonDto { Title = "Chọn giải pháp", Html = "<p>Nội dung</p><script>alert(1)</script>" } },
                Questions =
                {
                    new SuggestedQuestionDto { Text = "Câu 1?", OutcomeId = "5.2-b3-1", Options = { new() { Text = "A", IsCorrect = true }, new() { Text = "B" } } },
                    new SuggestedQuestionDto { Text = "Câu 2?", OutcomeId = "9.9-b1-1", Options = { new() { Text = "A", IsCorrect = true }, new() { Text = "B" } } },
                },
            });

        var result = await new SuggestModuleContentUseCase(gemini.Object, _framework, _sanitizer).ExecuteAsync(new SuggestModuleContentUseCaseInput
        {
            CourseCode = "A5-I", // historical alias of M5-I
            ModuleIndex = 1,
            ModuleTitle = "Xác định nhu cầu",
            Lessons = { new ModuleContentLessonInput { Title = "Trang 1", Html = "<p>Đã có <b>nội dung</b></p>" } },
        });

        sent!.CourseCode.Should().Be("M5-I");
        sent.Level.Should().Be(2);
        sent.LevelName.Should().Be("Trung cấp");
        sent.Competencies.Select(c => c.Code).Should().Equal("5.2");
        sent.Lessons.Single().Should().Contain("Đã có nội dung").And.NotContain("<b>");
        result.Competencies.Single().Bac.Should().Be("3–4");
        result.Competencies.Single().Outcomes.Should().OnlyContain(o => o.Bac == 3 || o.Bac == 4);
        result.Lessons.Single().Html.Should().Contain("Nội dung").And.NotContain("script");
        result.Questions.Select(q => q.OutcomeId).Should().Equal("5.2-b3-1", null);
    }

    [Fact]
    public async Task Check_lists_every_requirement_and_leaves_unanswered_ones_unchecked()
    {
        var gemini = new Mock<IGeminiService>();
        gemini.Setup(g => g.IsConfigured).Returns(true);
        gemini.Setup(g => g.CheckModuleContentAsync(It.IsAny<ModuleContentAiRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ModuleContentCheckOutput
            {
                Verdict = "dat",
                Summary = "Ổn",
                Outcomes = { new CheckedOutcomeDto { Id = "1.1-b1-1", Status = "met", Evidence = "tìm kiếm đơn giản" } },
                QuestionProblems = { new QuestionProblemDto { Number = 1, Problem = "Hai đáp án đúng" }, new QuestionProblemDto { Number = 9, Problem = "Không có câu này" } },
            });

        var result = await new CheckModuleContentUseCase(gemini.Object, _framework, _sanitizer).ExecuteAsync(new CheckModuleContentUseCaseInput
        {
            CourseCode = "M1-F",
            ModuleIndex = 0,
            Lessons = { new ModuleContentLessonInput { Html = "<p>Cách tìm kiếm thông tin</p>" } },
            Questions = { new ModuleContentQuestionInput { Text = "Câu hỏi?", Options = { new() { Text = "A", IsCorrect = true }, new() { Text = "B" } } } },
        });

        var expected = _framework.Find("1.1")!.ForSystemLevel(1).Sum(l => l.Outcomes.Count);
        result.Outcomes.Should().HaveCount(expected);
        result.Outcomes.Single(o => o.Id == "1.1-b1-1").Status.Should().Be(ContentOutcomeStatus.Met);
        result.Outcomes.Where(o => o.Id != "1.1-b1-1").Should().OnlyContain(o => o.Status == ContentOutcomeStatus.Unchecked);
        result.Outcomes.Should().OnlyContain(o => o.Text.Length > 0 && o.CompetencyCode == "1.1");
        result.Verdict.Should().Be(ContentCheckVerdict.Met);
        result.QuestionProblems.Select(p => p.Number).Should().Equal(1);
    }

    [Fact]
    public async Task Page_reviews_map_to_the_pages_sent_and_a_rewrite_comes_back_clean()
    {
        var gemini = new Mock<IGeminiService>();
        gemini.Setup(g => g.IsConfigured).Returns(true);
        gemini.Setup(g => g.CheckModuleContentAsync(It.IsAny<ModuleContentAiRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ModuleContentCheckOutput
            {
                Pages =
                {
                    new PageReviewDto { Number = 1, Status = "problem", Covers = { "2.1-b1-1", "9.9-b1-1" }, Notes = { "Sai cách chọn kênh." } },
                    new PageReviewDto { Number = 2, Status = "OK" }, // the empty page: dropped
                    new PageReviewDto { Number = 7, Status = "WEAK" }, // no such page
                },
            });
        var input = new CheckModuleContentUseCaseInput
        {
            CourseCode = "M2-F",
            ModuleIndex = 0,
            Lessons = { new() { Html = "<p>Trang có chữ</p>" }, new() { Html = "<p> </p>" } },
        };
        var check = await new CheckModuleContentUseCase(gemini.Object, _framework, _sanitizer).ExecuteAsync(input);
        var page = check.Pages.Should().ContainSingle().Subject;
        page.Number.Should().Be(1);
        page.Status.Should().Be(PageReviewStatus.Problem);
        page.Covers.Should().Equal("2.1-b1-1");

        ModuleContentAiRequest? sent = null;
        int? pageSent = null;
        gemini.Setup(g => g.RewriteModulePageAsync(It.IsAny<ModuleContentAiRequest>(), It.IsAny<int>(), It.IsAny<IReadOnlyList<string>>(), It.IsAny<CancellationToken>()))
            .Callback<ModuleContentAiRequest, int, IReadOnlyList<string>, CancellationToken>((r, n, _, _) => { sent = r; pageSent = n; })
            .ReturnsAsync(new RewrittenPageOutput { Title = "Chọn kênh giao tiếp", Html = "<h3>Chọn kênh</h3><p>Ví dụ</p><img src=x onerror=alert(1)>", Covers = { "2.1-b1-2", "x" } });
        var rewrite = new RewriteModulePageUseCase(gemini.Object, _framework, _sanitizer);
        var rewritten = await rewrite.ExecuteAsync(new RewriteModulePageUseCaseInput
        {
            CourseCode = "M2-F", ModuleIndex = 0, Lessons = input.Lessons, PageNumber = 1, Notes = { "Sai cách chọn kênh." },
        });
        pageSent.Should().Be(1);
        sent!.Lessons.Should().HaveCount(2, "trang trống vẫn giữ chỗ để số trang không lệch");
        sent.Lessons[1].Should().Be(ContentAiRequests.EmptyPage);
        rewritten.Html.Should().Contain("Chọn kênh").And.NotContain("onerror");
        rewritten.Covers.Should().Equal("2.1-b1-2");

        var missing = () => rewrite.ExecuteAsync(new RewriteModulePageUseCaseInput { CourseCode = "M2-F", Lessons = input.Lessons, PageNumber = 3 });
        (await missing.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("PAGE_NOT_FOUND");
    }

    [Fact]
    public async Task No_key_no_content_or_a_non_standard_course_is_refused()
    {
        var offline = new Mock<IGeminiService>();
        offline.Setup(g => g.IsConfigured).Returns(false);
        var noKey = () => new CheckModuleContentUseCase(offline.Object, _framework, _sanitizer)
            .ExecuteAsync(new CheckModuleContentUseCaseInput { CourseCode = "M1-F", Lessons = { new() { Html = "<p>x</p>" } } });
        (await noKey.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("AI_NOT_CONFIGURED");

        var online = new Mock<IGeminiService>();
        online.Setup(g => g.IsConfigured).Returns(true);
        var empty = () => new CheckModuleContentUseCase(online.Object, _framework, _sanitizer)
            .ExecuteAsync(new CheckModuleContentUseCaseInput { CourseCode = "M1-F", Lessons = { new() { Html = "<p> </p>" } } });
        (await empty.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NOTHING_TO_CHECK");

        var custom = () => new SuggestModuleContentUseCase(online.Object, _framework, _sanitizer)
            .ExecuteAsync(new SuggestModuleContentUseCaseInput { CourseCode = "NOIBO-01" });
        (await custom.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("COURSE_NOT_STANDARD");

        var noAnswer = () => new SuggestModuleContentUseCase(online.Object, _framework, _sanitizer)
            .ExecuteAsync(new SuggestModuleContentUseCaseInput { CourseCode = "M6-A", ModuleIndex = 2 });
        (await noAnswer.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("AI_UNAVAILABLE");
    }
}
