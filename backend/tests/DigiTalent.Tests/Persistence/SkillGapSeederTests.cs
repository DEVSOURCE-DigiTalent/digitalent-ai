using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

/// <summary>
/// Seed demo theo Thông tư 02/2025 (docs/specs/2026-09-29-tt02-position-competency-matrix.md §3–§8).
/// </summary>
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

    private static async Task<AppDbContext> SeededTwiceAsync()
    {
        var context = CreateContext();
        await DbSeeder.SeedAsync(context, Hasher());
        await DbSeeder.SeedAsync(context, Hasher());
        return context;
    }

    [Fact]
    public async Task DevelopmentSeed_CreatesCircular02FrameworkOnce()
    {
        using var context = await SeededTwiceAsync();

        var framework = await context.CompetencyFrameworks.SingleAsync();
        framework.Code.Should().Be("TT02_2025");
        framework.Version.Should().Be("02/2025/TT-BGDĐT");
        framework.Jurisdiction.Should().Be("VN");
        framework.IsActive.Should().BeTrue();

        (await context.CompetencyCategories.CountAsync()).Should().Be(6);
        (await context.Competencies.CountAsync()).Should().Be(24);
        (await context.CompetencyLevelCriteria.CountAsync()).Should().Be(72);

        var mappings = await context.CompetencyFrameworkMappings.ToListAsync();
        mappings.Should().HaveCount(24);
        mappings.Select(m => m.SourceCode).Should().BeEquivalentTo(Tt02Catalog.CompetencyCodes);
        mappings.Should().OnlyContain(m => m.Relationship == "DIRECT" && m.IsPrimary && m.FrameworkId == framework.Id);
        mappings.Single(m => m.SourceCode == "6.3").SourceAreaCode.Should().Be("6");
    }

    [Theory]
    [InlineData("CEO", 20)]
    [InlineData("HR", 10)]
    [InlineData("MARKETING", 24)]
    [InlineData("SALES_CRM", 10)]
    [InlineData("ACCOUNTANT", 7)]
    public async Task DevelopmentSeed_EachPositionHasAll24CompetenciesWeighted100(string positionCode, int mandatoryCount)
    {
        using var context = await SeededTwiceAsync();

        var position = await context.JobPositions.SingleAsync(p => p.Code == positionCode);
        var set = await context.PositionRequirementSets
            .Include(s => s.Items)
            .SingleAsync(s => s.JobPositionId == position.Id && s.Status == Statuses.PositionRequirementSet.Active);

        set.Items.Should().HaveCount(24);
        set.Items.Sum(i => i.WeightPercent).Should().Be(100.00m);
        set.Items.Count(i => i.IsMandatory).Should().Be(mandatoryCount);
        set.Items.Should().OnlyContain(i => i.RequiredLevel >= 1 && i.RequiredLevel <= 3);
    }

    [Fact]
    public async Task DevelopmentSeed_AccountantRequirementsFollowTheMatrix()
    {
        using var context = await SeededTwiceAsync();

        var items = await (from s in context.PositionRequirementSets
                           join p in context.JobPositions on s.JobPositionId equals p.Id
                           join i in context.PositionRequirementItems on s.Id equals i.RequirementSetId
                           join c in context.Competencies on i.CompetencyId equals c.Id
                           join m in context.CompetencyFrameworkMappings on c.Id equals m.CompetencyId
                           where p.Code == "ACCOUNTANT"
                           select new { m.SourceAreaCode, m.SourceCode, i.RequiredLevel, i.WeightPercent, i.IsMandatory })
            .ToListAsync();

        // Kế toán: miền 1 Nâng cao, 2 Trung bình, 3 Cơ bản, 4 Nâng cao, 5 Trung bình, 6 Trung bình; bắt buộc miền 1 và 4
        var expectedLevel = new Dictionary<string, int> { ["1"] = 3, ["2"] = 2, ["3"] = 1, ["4"] = 3, ["5"] = 2, ["6"] = 2 };
        items.Should().OnlyContain(i => i.RequiredLevel == expectedLevel[i.SourceAreaCode!]);
        items.Where(i => i.IsMandatory).Select(i => i.SourceAreaCode).Distinct().Should().BeEquivalentTo(new[] { "1", "4" });

        // Trọng số chia đều theo miền: 16.67 × 5 + 16.65, phần dư dồn vào dòng cuối của miền
        items.GroupBy(i => i.SourceAreaCode).ToDictionary(g => g.Key!, g => g.Sum(i => i.WeightPercent))
            .Should().BeEquivalentTo(new Dictionary<string, decimal>
            {
                ["1"] = 16.67m, ["2"] = 16.67m, ["3"] = 16.67m, ["4"] = 16.67m, ["5"] = 16.67m, ["6"] = 16.65m,
            });
        items.Single(i => i.SourceCode == "4.2").WeightPercent.Should().Be(4.17m);
        items.Single(i => i.SourceCode == "4.4").WeightPercent.Should().Be(4.16m);
    }

    [Fact]
    public async Task DevelopmentSeed_Creates18PublishedCoursesChainedByPrerequisites()
    {
        using var context = await SeededTwiceAsync();

        var courses = await context.Courses.ToListAsync();
        courses.Count(c => c.Status == Statuses.Course.Published).Should().Be(18);
        courses.Should().ContainSingle(c => c.Status == Statuses.Course.Draft);

        var a4i = courses.Single(c => c.Code == "A4-I");
        a4i.EntryLevel.Should().Be((short)1);
        a4i.EstimatedDurationMinutes.Should().Be(600);
        courses.Single(c => c.Code == "A2-A").EstimatedDurationMinutes.Should().Be(1080);
        courses.Single(c => c.Code == "M6-A").EntryLevel.Should().Be((short)2);

        var teaches = await context.CourseCompetencies.Where(cc => cc.CourseId == a4i.Id).ToListAsync();
        teaches.Should().HaveCount(4);
        teaches.Should().OnlyContain(t => t.TargetLevel == 2 && t.CoverageType == Statuses.CourseCoverageType.Primary);

        var prerequisites = await context.CoursePrerequisites.ToListAsync();
        prerequisites.Should().HaveCount(12);
        var byId = courses.ToDictionary(c => c.Id, c => c.Code);
        prerequisites.Select(p => $"{byId[p.PrerequisiteCourseId]}->{byId[p.CourseId]}")
            .Should().Contain(new[] { "A1-F->A1-I", "A1-I->A1-A", "M6-F->M6-I", "M6-I->M6-A" });
    }

    [Fact]
    public async Task DevelopmentSeed_DemoEmployeeIsAnAccountantConfirmedBasicEverywhere()
    {
        using var context = await SeededTwiceAsync();

        var accountant = await context.JobPositions.SingleAsync(p => p.Code == "ACCOUNTANT");
        var employee = await context.Employees.SingleAsync(e => e.WorkEmail == "employee@digitalent.ai");
        employee.JobPositionId.Should().Be(accountant.Id);

        var profiles = await context.EmployeeCompetencyProfiles.Where(p => p.EmployeeId == employee.Id).ToListAsync();
        profiles.Should().HaveCount(24);
        profiles.Should().OnlyContain(p => p.ConfirmedLevel == 1);
        (await context.CompetencyEvidences.CountAsync(e =>
            e.EmployeeId == employee.Id && e.SourceType == Statuses.EvidenceSourceType.Migration && e.IsLevelConfirming))
            .Should().Be(24);

        var salesCrm = await context.JobPositions.SingleAsync(p => p.Code == "SALES_CRM");
        (await context.Employees.SingleAsync(e => e.WorkEmail == "manager@digitalent.ai")).JobPositionId.Should().Be(salesCrm.Id);
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
