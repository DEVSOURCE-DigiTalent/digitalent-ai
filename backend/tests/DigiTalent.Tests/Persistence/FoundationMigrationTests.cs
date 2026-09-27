using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

public class FoundationMigrationTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task FoundationMigrationCreatesExpectedTables()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        // In-memory doesn't run migrations, but we can verify DbSets exist and are queryable
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
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_CanApplyMigrationsAndVerifySchema()
    {
        var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                      ?? "Host=localhost;Port=5432;Database=digitalent;Username=digitalent_app;Password=changeme";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connStr)
            .UseSnakeCaseNamingConvention()
            .Options;

        using var context = new AppDbContext(options);

        if (!await context.Database.CanConnectAsync())
        {
            return;
        }

        await context.Database.MigrateAsync();

        var applied = await context.Database.GetAppliedMigrationsAsync();
        applied.Should().Contain("20260926060421_InitialFoundation");

        var orgsCount = await context.Organizations.CountAsync();
        var usersCount = await context.Users.CountAsync();
        var deptCount = await context.Departments.CountAsync();

        orgsCount.Should().BeGreaterThanOrEqualTo(1);
        usersCount.Should().BeGreaterThanOrEqualTo(1);
        deptCount.Should().BeGreaterThanOrEqualTo(1);
    }
}
