using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Pulse;

/// <summary>AI review results stored in pulse_ai_reviews: only real AI results, one row per submission, reused while the inputs are unchanged.</summary>
public class PulseAiReviewStoreTests
{
    private const string Final = "FINAL";

    private static readonly IReadOnlyList<PulseCriterionDto> Rubric = PulseRules.FinalCriteria;

    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static string Hash(string evidence = "Bài làm", params string[] criteria) =>
        PulseAiReviewStore.InputHash(evidence, "<p>Đề</p>", criteria.Length > 0 ? criteria : new[] { "Nguồn có thể truy vết" }, "Mô đun 1", "Khai thác dữ liệu", 1, Rubric, null);

    private static PulseAiHintDto Hint(string source, string summary = "Bài làm có nguồn rõ ràng.") =>
        new(new[] { true, false, true }, summary) { Source = source, Model = source == "GEMINI" ? "gemini-test" : null };

    private static PulseAiReviewStore.Entry Entry(Guid submissionId, string hash, PulseAiHintDto hint) =>
        new(Guid.NewGuid(), Final, submissionId, hash, hint);

    [Fact]
    public void InputHash_IsStable_AndChangesWithTheInputs()
    {
        Hash().Should().HaveLength(64).And.Be(Hash());
        Hash(evidence: "Bài làm khác").Should().NotBe(Hash());
        Hash("Bài làm", "Tiêu chí khác").Should().NotBe(Hash());
    }

    [Fact]
    public async Task Save_KeepsOnlyRealAiResults()
    {
        await using var context = NewContext();

        await PulseAiReviewStore.SaveAsync(context, new[]
        {
            Entry(Guid.NewGuid(), Hash(), Hint("GEMINI")),
            Entry(Guid.NewGuid(), Hash(), Hint("KEYWORD_FALLBACK")),
        });

        var rows = await context.PulseAiReviews.ToListAsync();
        rows.Should().ContainSingle();
        rows[0].Model.Should().Be("gemini-test");
        rows[0].Result.Should().Contain("Bài làm có nguồn rõ ràng.");
    }

    [Fact]
    public async Task Save_UpdatesTheSubmissionRowInPlace()
    {
        await using var context = NewContext();
        var submission = Guid.NewGuid();
        await PulseAiReviewStore.SaveAsync(context, new[] { Entry(submission, Hash(), Hint("GEMINI", "Lần chấm đầu.")) });

        var newHash = Hash(evidence: "Bài làm đã sửa");
        await PulseAiReviewStore.SaveAsync(context, new[] { Entry(submission, newHash, Hint("GEMINI", "Lần chấm lại.")) });

        var row = await context.PulseAiReviews.SingleAsync();
        row.InputHash.Should().Be(newHash);
        row.Result.Should().Contain("Lần chấm lại.").And.NotContain("Lần chấm đầu.");
    }

    [Fact]
    public async Task Reuse_ReturnsTheStoredHint_OnlyWhileTheInputsAreUnchanged()
    {
        await using var context = NewContext();
        var submission = Guid.NewGuid();
        await PulseAiReviewStore.SaveAsync(context, new[] { Entry(submission, Hash(), Hint("GEMINI")) });
        var stored = await PulseAiReviewStore.LoadAsync(context, new[] { submission });

        var reused = PulseAiReviewStore.Reuse(stored, Final, submission, Hash());
        reused.Should().NotBeNull();
        reused!.Checks.Should().Equal(true, false, true);
        reused.Source.Should().Be("GEMINI");
        reused.ReviewedAt.Should().Be(stored[(Final, submission)].UpdatedAt);

        PulseAiReviewStore.Reuse(stored, Final, submission, Hash(evidence: "Bài làm khác")).Should().BeNull();
        PulseAiReviewStore.Reuse(stored, "PRE_ASSESSMENT", submission, Hash()).Should().BeNull();
        PulseAiReviewStore.Reuse(stored, Final, Guid.NewGuid(), Hash()).Should().BeNull();
    }
}
