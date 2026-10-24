using DigiTalent.Infrastructure.PersonalLearning;
using Xunit;

namespace DigiTalent.Tests.PersonalLearning;

public sealed class PersonalLearningRulesTests
{
    private static Dictionary<string, int> AllRight() =>
        PersonalLearningCatalog.EntryQuestions.ToDictionary(q => q.Id, q => q.CorrectIndex);

    private static int Wrong(string id) => (PersonalLearningCatalog.QuestionById[id].CorrectIndex + 1) % 4;

    [Fact]
    public void EntryBank_HasTwoQuestionsPerLevelAndDomain()
    {
        Assert.Equal(36, PersonalLearningCatalog.EntryQuestions.Count);
        foreach (var domain in PersonalLearningCatalog.Domains)
        {
            for (var level = 1; level <= 3; level++)
            {
                Assert.Equal(2, PersonalLearningCatalog.EntryPair(domain.Number, level).Count);
            }
            Assert.Equal(4, PersonalLearningCatalog.CourseQuestions(domain.Number).Count);
        }
    }

    [Fact]
    public void EntryBank_SpreadsTheRightAnswersOverTheOptions()
    {
        var byIndex = PersonalLearningCatalog.EntryQuestions.GroupBy(q => q.CorrectIndex).ToDictionary(g => g.Key, g => g.Count());
        Assert.Equal(4, byIndex.Count);
        Assert.All(byIndex.Values, count => Assert.True(count <= 14));
    }

    [Fact]
    public void PlanEntry_AsksPairByPair_AndStopsADomainAtTheFirstMissedLevel()
    {
        var first = PersonalLearningRules.PlanEntry(new Dictionary<string, int>());
        Assert.False(first.Done);
        Assert.Equal(2, first.AskedIds.Count);

        var answers = AllRight();
        var missed = PersonalLearningCatalog.EntryPair(4, 2)[0].Id;
        answers[missed] = Wrong(missed);

        var plan = PersonalLearningRules.PlanEntry(answers);

        Assert.True(plan.Done);
        Assert.Equal(new[] { 3, 3, 3, 1, 3, 3 }, plan.Levels);
        Assert.Equal(34, plan.AskedIds.Count);
        Assert.DoesNotContain(PersonalLearningCatalog.EntryPair(4, 3)[0].Id, plan.AskedIds);
    }

    [Fact]
    public void PlanEntry_NeedsBothQuestionsOfALevelRight()
    {
        var answers = AllRight();
        var basic = PersonalLearningCatalog.EntryPair(1, 1)[1].Id;
        answers[basic] = Wrong(basic);

        Assert.Equal(0, PersonalLearningRules.PlanEntry(answers).Levels[0]);
    }

    [Fact]
    public void GradeTask_ApprovesOnlyWithLinkEveryCriterionAndAFullExplanation()
    {
        var rubric = new[] { "A", "B", "C" };
        var explanation = new string('x', PersonalLearningRules.TaskExplanationMinLength);

        Assert.Equal("APPROVED", PersonalLearningRules.GradeTask(rubric, "https://x.y/doc", explanation, new[] { 0, 1, 2 }).Status);
        Assert.Equal("REVISION_REQUESTED", PersonalLearningRules.GradeTask(rubric, "", explanation, new[] { 0, 1, 2 }).Status);
        Assert.Equal("REVISION_REQUESTED", PersonalLearningRules.GradeTask(rubric, "https://x.y/doc", "ngắn", new[] { 0, 1, 2 }).Status);

        var partial = PersonalLearningRules.GradeTask(rubric, "https://x.y/doc", explanation, new[] { 0 });
        Assert.Equal("REVISION_REQUESTED", partial.Status);
        Assert.Contains("B; C", partial.Feedback);
    }

    [Fact]
    public void AttemptsLeft_CountsOnlyTheLast24Hours()
    {
        var now = new DateTimeOffset(2026, 10, 9, 12, 0, 0, TimeSpan.Zero);
        var history = new[] { now.AddHours(-30), now.AddHours(-2), now.AddHours(-1) };

        Assert.Equal(1, PersonalLearningRules.AttemptsLeft(history, now));
    }

    [Fact]
    public void Question_pq_6_2_MarksTheRiskyActionAsTheAnswer()
    {
        var question = PersonalLearningCatalog.QuestionById["pq-6-2"];
        Assert.StartsWith("Nhập số liệu tài chính nhạy cảm", question.Options[question.CorrectIndex]);
    }
}
