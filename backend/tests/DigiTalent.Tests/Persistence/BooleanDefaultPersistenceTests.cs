using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Persistence;

/// <summary>
/// Bẫy EF: cột bool có DEFAULT true + HasDefaultValue(true) → giá trị false (= CLR default) bị bỏ qua khi INSERT
/// và DB tự điền true. Chỉ Postgres thật mới lộ lỗi này (InMemory không dùng default của DB).
/// </summary>
[Collection("PostgresIntegration")]
public class BooleanDefaultPersistenceTests
{
    [Fact]
    [Trait("Category", "Integration")]
    public async Task FalseValuesOnTrueDefaultColumns_ArePersistedAsFalse()
    {
        Guid itemId;
        Guid courseId;
        await using (var context = PostgresTestDatabase.CreateContext())
        {
            await PostgresTestDatabase.MigrateAsync(context);
            (itemId, courseId) = await SeedAsync(context);
        }

        await using var verify = PostgresTestDatabase.CreateContext();
        var item = await verify.PositionRequirementItems.AsNoTracking().SingleAsync(i => i.Id == itemId);
        item.IsMandatory.Should().BeFalse("a non-mandatory requirement must not be stored as mandatory");
        item.RequiresPracticalEvidence.Should().BeFalse();

        var course = await verify.Courses.AsNoTracking().SingleAsync(c => c.Id == courseId);
        course.CertificateEnabled.Should().BeFalse();
    }

    private static async Task<(Guid ItemId, Guid CourseId)> SeedAsync(AppDbContext context)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var org = new Domain.Entities.Organization { Code = $"BOOL_{suffix}", Name = "Bool Default Org", Status = Statuses.Simple.Active };
        var user = new User { OrganizationId = org.Id, Email = $"bool_{suffix}@test.local", PasswordHash = "x", DisplayName = "Bool Tester" };
        var position = new JobPosition { OrganizationId = org.Id, Code = $"POS_{suffix}", Name = "Analyst" };
        var category = new CompetencyCategory { OrganizationId = org.Id, Code = $"CAT_{suffix}", Name = "Data", Status = Statuses.MasterData.Active };
        var competency = new Domain.Entities.Competency
        {
            CategoryId = category.Id,
            Code = $"COMP_{suffix}",
            Name = "Data Literacy",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active
        };
        var set = new PositionRequirementSet { JobPositionId = position.Id, VersionNo = 1, CreatedByUserId = user.Id };
        var item = new PositionRequirementItem
        {
            RequirementSetId = set.Id,
            CompetencyId = competency.Id,
            RequiredLevel = 2,
            WeightPercent = 100m,
            IsMandatory = false,
            RequiresPracticalEvidence = false
        };
        var course = new Course
        {
            OrganizationId = org.Id,
            Code = $"CRS_{suffix}",
            VersionNo = 1,
            Title = "Excel basics",
            Status = Statuses.Course.Draft,
            CertificateEnabled = false,
            CreatedByUserId = user.Id
        };

        context.Organizations.Add(org);
        context.Users.Add(user);
        context.JobPositions.Add(position);
        context.CompetencyCategories.Add(category);
        context.Competencies.Add(competency);
        context.PositionRequirementSets.Add(set);
        context.PositionRequirementItems.Add(item);
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        return (item.Id, course.Id);
    }
}
