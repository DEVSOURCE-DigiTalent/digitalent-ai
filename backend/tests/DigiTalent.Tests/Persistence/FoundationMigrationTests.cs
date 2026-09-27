using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

[Collection("PostgresIntegration")]
public class FoundationMigrationTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task FoundationModelExposesExpectedDbSets()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        // In-memory only verifies the model surface; PostgreSQL_CanApplyMigrationsAndVerifySchema checks the actual schema.
        var users = await context.Users.ToListAsync();
        var roles = await context.Roles.ToListAsync();
        var departments = await context.Departments.ToListAsync();
        var organizations = await context.Organizations.ToListAsync();

        users.Should().NotBeNull();
        roles.Should().NotBeNull();
        departments.Should().NotBeNull();
        organizations.Should().NotBeNull();
    }

    [Fact]
    public async Task SeedTwiceDoesNotDuplicateRolesOrUsers()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var passwordHasher = new Mock<IPasswordHasher>();
        passwordHasher.Setup(p => p.Hash(It.IsAny<string>())).Returns("hashed_password");

        await DbSeeder.SeedAsync(context, passwordHasher.Object);
        var initialUserCount = await context.Users.CountAsync();
        var initialRoleCount = await context.Roles.CountAsync();
        var initialOrgCount = await context.Organizations.CountAsync();

        await DbSeeder.SeedAsync(context, passwordHasher.Object);
        var finalUserCount = await context.Users.CountAsync();
        var finalRoleCount = await context.Roles.CountAsync();
        var finalOrgCount = await context.Organizations.CountAsync();

        finalUserCount.Should().Be(initialUserCount);
        finalRoleCount.Should().Be(initialRoleCount);
        finalOrgCount.Should().Be(initialOrgCount);
    }

    [Fact]
    public async Task ReferenceSeedDoesNotCreateDemoUsersOrOrganization()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));

        await DbSeeder.SeedReferenceDataAsync(context);

        (await context.Roles.CountAsync()).Should().BeGreaterThan(0);
        (await context.Permissions.CountAsync()).Should().BeGreaterThan(0);
        (await context.Users.CountAsync()).Should().Be(0);
        (await context.Organizations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task DevelopmentSeedUsesConfiguredPassword()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash("test-only-password")).Returns("hashed-password");

        await DbSeeder.SeedAsync(context, hasher.Object, "test-only-password");

        hasher.Verify(h => h.Hash("test-only-password"), Times.Once);
        (await context.Users.CountAsync()).Should().Be(5);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_CanApplyMigrationsAndVerifySchema()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var applied = await context.Database.GetAppliedMigrationsAsync();
        applied.Should().Contain("20260926060421_InitialFoundation");
        applied.Should().Contain("20260927145053_AddLearnerProfileAndCareerRoleTemplateId");

        var expectedTables = new[]
        {
            "organizations", "permissions", "roles", "job_families", "users",
            "role_permissions", "job_positions", "audit_logs", "refresh_tokens",
            "system_settings", "user_roles", "departments", "employees",
            "learner_profiles"
        };
        foreach (var table in expectedTables)
        {
            var exists = await context.Database.SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
                table).SingleAsync();
            exists.Should().BeTrue($"table {table} must exist after migrations");
        }

        var requiredColumns = new[]
        {
            (Table: "users", Column: "organization_id"),
            (Table: "departments", Column: "organization_id"),
            (Table: "job_positions", Column: "job_family_id"),
            (Table: "job_positions", Column: "career_role_template_id"),
            (Table: "employees", Column: "job_position_id"),
            (Table: "learner_profiles", Column: "user_id"),
            (Table: "learner_profiles", Column: "target_role_id")
        };
        foreach (var (table, column) in requiredColumns)
        {
            var exists = await context.Database.SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = {0} AND column_name = {1}) AS \"Value\"",
                table, column).SingleAsync();
            exists.Should().BeTrue($"column {table}.{column} must exist after migrations");
        }
    }
}
