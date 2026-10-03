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

    // D-B7: mỗi vị trí chọn năng lực phù hợp công việc; bắt buộc = mức Nâng cao + năng lực lõi 4.1, 4.2
    [Theory]
    [InlineData("CEO", 21, 15)]
    [InlineData("HR", 23, 7)]
    [InlineData("MARKETING", 22, 16)]
    [InlineData("SALES_CRM", 20, 7)]
    [InlineData("ACCOUNTANT", 21, 5)]
    public async Task DevelopmentSeed_EachPositionSelectsItsCompetenciesWeighted100(string positionCode, int lineCount, int mandatoryCount)
    {
        using var context = await SeededTwiceAsync();

        var position = await context.JobPositions.SingleAsync(p => p.Code == positionCode);
        var set = await context.PositionRequirementSets
            .Include(s => s.Items)
            .SingleAsync(s => s.JobPositionId == position.Id && s.Status == Statuses.PositionRequirementSet.Active);

        set.Items.Should().HaveCount(lineCount);
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

        // Kế toán (ma trận §4 của tài liệu TT02): mức theo từng năng lực, 3.2 / 3.3 / 4.4 không yêu cầu
        var levels = items.ToDictionary(i => i.SourceCode, i => i.RequiredLevel);
        levels.Should().NotContainKeys("3.2", "3.3", "4.4");
        levels.Should().Contain(new Dictionary<string, int>
        {
            ["1.1"] = 2, ["1.2"] = 3, ["1.3"] = 3,
            ["2.3"] = 3, ["2.5"] = 1,   // thuế / hóa đơn điện tử cao hơn mức chung của miền 2
            ["3.1"] = 1, ["3.4"] = 2,
            ["4.1"] = 2, ["4.2"] = 3, ["4.3"] = 1,
            ["6.1"] = 1, ["6.3"] = 2,
        });
        items.Where(i => i.IsMandatory).Select(i => i.SourceCode).Should().BeEquivalentTo(new[] { "1.2", "1.3", "2.3", "4.1", "4.2" });

        // Trọng số chia đều theo miền rồi trong miền (chỉ trên các dòng có yêu cầu), phần dư dồn vào dòng cuối
        items.GroupBy(i => i.SourceAreaCode).ToDictionary(g => g.Key!, g => g.Sum(i => i.WeightPercent))
            .Should().BeEquivalentTo(new Dictionary<string, decimal>
            {
                ["1"] = 16.67m, ["2"] = 16.67m, ["3"] = 16.67m, ["4"] = 16.67m, ["5"] = 16.67m, ["6"] = 16.65m,
            });
        items.Single(i => i.SourceCode == "4.2").WeightPercent.Should().Be(5.56m);
        items.Single(i => i.SourceCode == "3.1").WeightPercent.Should().Be(8.34m);
        items.Single(i => i.SourceCode == "3.4").WeightPercent.Should().Be(8.33m);
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
