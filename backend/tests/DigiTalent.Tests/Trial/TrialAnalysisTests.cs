using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Trial;
using DigiTalent.Infrastructure.Trial;
using Xunit;

namespace DigiTalent.Tests.Trial;

public sealed class TrialAnalysisTests
{
    [Fact]
    public void Frozen_standards_produce_different_gaps_from_same_evidence()
    {
        var bundle = DevelopmentTrialCatalog.CreateBundle();
        var answers = bundle.Questions.Select(q => new TrialAnswerDto(q.Id, q.Options.First().Id)).ToArray();
        var first = TrialAnalysis.Grade(Guid.NewGuid(), bundle, answers, DateTimeOffset.UtcNow);
        var stricter = bundle with { RequirementVersion = "v2", Requirements = bundle.Requirements.Select(r => r with { RequiredLevel = 3 }).ToArray() };
        var second = TrialAnalysis.Grade(Guid.NewGuid(), stricter, answers, DateTimeOffset.UtcNow);
        Assert.Equal("met", first.Items[0].Classification);
        Assert.Equal("gap", second.Items[0].Classification);
        Assert.Equal(1, second.Items[0].GapSteps);
        Assert.Null(second.Items[1].CurrentLevel);
        Assert.Equal("development-standard-v1", first.RequirementVersion);
    }

    [Fact]
    public void Coverage_requires_all_minimum_evidence_and_missing_content_is_per_gap()
    {
        var bundle = DevelopmentTrialCatalog.CreateBundle();
        var partial = TrialAnalysis.Grade(Guid.NewGuid(), bundle, [new("q1", "b")], DateTimeOffset.UtcNow);
        Assert.All(partial.Items, item => Assert.Equal("insufficient_data", item.Classification));
        var full = TrialAnalysis.Grade(Guid.NewGuid(), bundle, [new("q1", "b"), new("q2", "b")], DateTimeOffset.UtcNow);
        var missing = TrialAnalysis.BuildPath(full, bundle with { Content = [] });
        Assert.Equal("no_matching_content", missing.State);
        Assert.Contains("digital-safety", missing.MissingContentReasons.Single());
        var unpublished = TrialAnalysis.BuildPath(full, bundle with { Content = bundle.Content.Select(c => c with { Published = false }).ToArray() });
        Assert.Empty(unpublished.Items);
    }

    [Fact]
    public void Unknown_only_has_no_path_and_a_missing_prerequisite_disables_item()
    {
        var bundle = DevelopmentTrialCatalog.CreateBundle();
        var unknown = TrialAnalysis.Grade(Guid.NewGuid(), bundle, [], DateTimeOffset.UtcNow);
        Assert.Equal("insufficient_data", TrialAnalysis.BuildPath(unknown, bundle).State);
        var gap = TrialAnalysis.Grade(Guid.NewGuid(), bundle, [new("q1", "b"), new("q2", "b")], DateTimeOffset.UtcNow);
        var blocked = TrialAnalysis.BuildPath(gap, bundle with { Content = bundle.Content.Select(c => c with { Prerequisites = ["missing-item"] }).ToArray() });
        Assert.False(blocked.Items.Single().AllowedToStart);
        Assert.Contains("missing-item", blocked.Items.Single().Prerequisites);
    }

    [Theory]
    [InlineData(1, 0, 2, false)]
    [InlineData(1, 1, 2, true)]
    [InlineData(5, 0, 5, true)]
    public void Quota_counts_pending_seats_and_owner(int accounts, int pending, int max, bool denied)
    {
        if (denied) Assert.Throws<ConflictException>(() => TrialPolicy.EnsureSeat(accounts, pending, max));
        else TrialPolicy.EnsureSeat(accounts, pending, max);
    }

    [Fact]
    public void Published_prerequisite_not_completed_must_not_advertise_item_as_startable()
    {
        var bundle = DevelopmentTrialCatalog.CreateBundle();
        var content = bundle.Content[0] with { Prerequisites = ["prerequisite"] };
        var prerequisite = content with { Id = "prerequisite", Prerequisites = [], CompetencyId = "communication" };
        var result = TrialAnalysis.Grade(Guid.NewGuid(), bundle, [new("q1", "b"), new("q2", "b")], DateTimeOffset.UtcNow);
        var path = TrialAnalysis.BuildPath(result, bundle with { Content = [content, prerequisite] });
        Assert.False(path.Items.Single().AllowedToStart);
    }
}
