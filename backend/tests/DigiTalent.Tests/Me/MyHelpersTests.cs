using DigiTalent.Application.UseCases.Me;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Me;

public class MyHelpersTests
{
    [Fact]
    public void RubricParser_ReadsCriteriaArrayFromJsonb()
    {
        var rubric = TaskRubricParser.Parse("""[{"id":"rc-1","label":"Đúng nghiệp vụ","description":"Mô tả","maxPoints":40},{"label":"Trình bày","maxPoints":"20"}]""");

        rubric.Select(r => (r.Id, r.Label, r.MaxPoints)).Should().Equal(("rc-1", "Đúng nghiệp vụ", 40m), ("rc-2", "Trình bày", 20m));
    }

    [Theory]
    [InlineData("Tiêu chí viết tay không phải JSON")]
    [InlineData("\"Tiêu chí viết tay không phải JSON\"")]
    public void RubricParser_TreatsPlainTextAsOneGeneralCriterion(string raw)
    {
        var rubric = TaskRubricParser.Parse(raw);

        rubric.Should().ContainSingle().Which.Description.Should().Be("Tiêu chí viết tay không phải JSON");
    }

    [Fact]
    public void RubricParser_ReturnsEmptyForMissingRubric()
    {
        TaskRubricParser.Parse(null).Should().BeEmpty();
        TaskRubricParser.Parse("{}").Should().BeEmpty();
    }

    [Fact]
    public void SubmissionLinks_RoundTrip()
    {
        var stored = SubmissionLinks.Join(new[] { " https://a.test/x ", "", "https://b.test/y" });

        SubmissionLinks.Split(stored).Should().Equal("https://a.test/x", "https://b.test/y");
        SubmissionLinks.Join(Array.Empty<string>()).Should().BeNull();
    }

    [Fact]
    public void LearningPath_PutsPrerequisitesBeforeDependentCourses()
    {
        static MyLearningPathStepDto Step(string code, params string[] prerequisites) => new()
        {
            CourseCode = code,
            Prerequisites = prerequisites.Select(p => new MyPrerequisiteDto { Code = p }).ToList(),
        };

        var ordered = GetMyLearningPathUseCase.OrderByPrerequisites(new List<MyLearningPathStepDto>
        {
            Step("A-ADV", "A-INT"),
            Step("B"),
            Step("A-INT", "A-BASIC"),
            Step("A-BASIC"),
        });

        ordered.Select(s => s.CourseCode).Should().Equal("A-BASIC", "A-INT", "A-ADV", "B");
    }

    [Fact]
    public void LearningPath_IgnoresPrerequisiteCycles()
    {
        var ordered = GetMyLearningPathUseCase.OrderByPrerequisites(new List<MyLearningPathStepDto>
        {
            new() { CourseCode = "X", Prerequisites = new() { new MyPrerequisiteDto { Code = "Y" } } },
            new() { CourseCode = "Y", Prerequisites = new() { new MyPrerequisiteDto { Code = "X" } } },
        });

        ordered.Select(s => s.CourseCode).Should().BeEquivalentTo("X", "Y");
    }
}
