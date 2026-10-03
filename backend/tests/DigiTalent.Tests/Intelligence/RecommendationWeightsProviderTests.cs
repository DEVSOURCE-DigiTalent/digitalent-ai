using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// InMemory không ép unique index → dựng được cấu hình hỏng (component trùng) mà PostgreSQL sẽ chặn (spec §5.6 R7).
/// </summary>
public class RecommendationWeightsProviderTests
{
    private static readonly Guid OrganizationId = Guid.NewGuid();

    private static AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static RecommendationWeightsProvider Provider(AppDbContext context) =>
        new(context, NullLogger<RecommendationWeightsProvider>.Instance);

    private static void AddConfig(AppDbContext context, int version, params (string Code, decimal Weight)[] items)
    {
        var config = new ScoringConfig
        {
            OrganizationId = OrganizationId,
            ConfigType = Statuses.ScoringConfigType.RecommendationWeights,
            Version = version,
            IsActive = true,
        };
        context.ScoringConfigs.Add(config);
        context.ScoringConfigItems.AddRange(items.Select(i => new ScoringConfigItem
        {
            ScoringConfigId = config.Id,
            ComponentCode = i.Code,
            Weight = i.Weight,
        }));
    }

    [Fact]
    public async Task GetAsync_WithoutConfig_ReturnsDefault()
    {
        using var context = CreateContext();

        var weights = await Provider(context).GetAsync(OrganizationId);

        weights.Should().Be(RecommendationWeights.Default);
    }

    [Fact]
    public async Task GetAsync_WithValidConfig_ReturnsItsWeightsAndVersion()
    {
        using var context = CreateContext();
        AddConfig(context, 4,
            (RecommendationComponents.GapPriorityCoverage, 60m),
            (RecommendationComponents.MandatoryCoverage, 30m),
            (RecommendationComponents.EntryLevelFit, 10m));
        await context.SaveChangesAsync();

        var weights = await Provider(context).GetAsync(OrganizationId);

        weights.Should().Be(new RecommendationWeights(60m, 30m, 10m, "4"));
    }

    [Fact]
    public async Task GetAsync_WithDuplicateComponent_FallsBackToDefaultInsteadOfThrowing()
    {
        using var context = CreateContext();
        AddConfig(context, 2,
            (RecommendationComponents.GapPriorityCoverage, 70m),
            (RecommendationComponents.GapPriorityCoverage, 0m),
            (RecommendationComponents.MandatoryCoverage, 20m),
            (RecommendationComponents.EntryLevelFit, 10m));
        await context.SaveChangesAsync();

        var weights = await Provider(context).GetAsync(OrganizationId);

        weights.Should().Be(RecommendationWeights.Default);
    }

    [Fact]
    public async Task GetAsync_WithUnknownComponent_FallsBackToDefault()
    {
        using var context = CreateContext();
        AddConfig(context, 2,
            (RecommendationComponents.GapPriorityCoverage, 70m),
            (RecommendationComponents.MandatoryCoverage, 20m),
            ("POPULARITY", 10m));
        await context.SaveChangesAsync();

        var weights = await Provider(context).GetAsync(OrganizationId);

        weights.Should().Be(RecommendationWeights.Default);
    }
}
