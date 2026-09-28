using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

public class SkillGapSeederTests
{
    private static AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static IPasswordHasher Hasher()
    {
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        return hasher.Object;
    }

    [Fact]
    public async Task DevelopmentSeed_CreatesSpecExampleDataOnce()
    {
        using var context = CreateContext();

        await DbSeeder.SeedAsync(context, Hasher());
        await DbSeeder.SeedAsync(context, Hasher());

        (await context.Competencies.CountAsync()).Should().Be(5);
        (await context.CompetencyLevelCriteria.CountAsync()).Should().Be(15);
        (await context.Courses.CountAsync()).Should().Be(4);
        (await context.Courses.CountAsync(c => c.Status == Statuses.Course.Published)).Should().Be(3);

        var activeSet = await context.PositionRequirementSets
            .Include(s => s.Items)
            .SingleAsync(s => s.Status == Statuses.PositionRequirementSet.Active);
        activeSet.Items.Should().HaveCount(5);
        activeSet.Items.Sum(i => i.WeightPercent).Should().Be(100m);

        var employee = await context.Employees.SingleAsync(e => e.WorkEmail == "employee@digitalent.ai");
        employee.JobPositionId.Should().Be(activeSet.JobPositionId);
        (await context.EmployeeCompetencyProfiles.CountAsync(p => p.EmployeeId == employee.Id)).Should().Be(4);
        (await context.CompetencyEvidences.CountAsync(e =>
            e.EmployeeId == employee.Id && e.SourceType == Statuses.EvidenceSourceType.Migration && e.IsLevelConfirming))
            .Should().Be(4);
    }

    [Fact]
    public async Task ReferenceSeed_CreatesSkillGapSettingAndRecommendationWeightsSummingTo100()
    {
        using var context = CreateContext();

        await DbSeeder.SeedAsync(context, Hasher());
        await DbSeeder.SeedReferenceDataAsync(context);

        (await context.SystemSettings.CountAsync(s => s.OrganizationId == null && s.Key == SkillGapSeeder.SkillGapSettingKey))
            .Should().Be(1);

        var config = await context.ScoringConfigs.SingleAsync(c =>
            c.ConfigType == Statuses.ScoringConfigType.RecommendationWeights && c.IsActive);
        var weights = await context.ScoringConfigItems.Where(i => i.ScoringConfigId == config.Id).ToListAsync();
        weights.Should().HaveCount(3);
        weights.Sum(w => w.Weight).Should().Be(100m);
    }
}
