using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Seed;

public class DemoAccountSeedTests
{
    [Fact]
    public async Task BackfillsMissingAccountsAndStructureWithoutDuplicatingOrResettingExistingUsers()
    {
        await using var db = CreateContext();
        var organization = new DigiTalent.Domain.Entities.Organization { Code = "DIGITALENT", Name = "Demo" };
        db.Organizations.Add(organization);
        foreach (var code in new[] { "PLATFORM_ADMIN", "OWNER", "MANAGER", "EMPLOYEE" })
            db.Roles.Add(new Role { Code = code, Name = code, ScopeType = "ORGANIZATION" });
        var existing = new User
        {
            Email = "manager@digitalent.ai", DisplayName = "Existing Manager",
            PasswordHash = "existing-hash", OrganizationId = organization.Id,
        };
        db.Users.Add(existing);
        await db.SaveChangesAsync();

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash("Admin@1234")).Returns("hashed-demo-password");
        await DbSeeder.SeedDemoUsersAsync(db, hasher.Object, organization.Id, "Admin@1234");
        await DbSeeder.SeedDemoUsersAsync(db, hasher.Object, organization.Id, "Admin@1234");

        var users = await db.Users.Include(u => u.UserRoles).ToDictionaryAsync(u => u.Email);
        users.Keys.Should().BeEquivalentTo(new[]
        {
            "platform@digitalent.ai", "owner@digitalent.ai", "manager@digitalent.ai",
            "employee@digitalent.ai", "personal@digitalent.ai", "trial@digitalent.ai", "free@digitalent.ai",
        });
        users["manager@digitalent.ai"].PasswordHash.Should().Be("existing-hash");
        users["manager@digitalent.ai"].DisplayName.Should().Be("Existing Manager");
        users["platform@digitalent.ai"].OrganizationId.Should().BeNull();
        users["platform@digitalent.ai"].EmailVerifiedAt.Should().NotBeNull();
        foreach (var email in new[] { "personal@digitalent.ai", "trial@digitalent.ai", "free@digitalent.ai" })
        {
            users[email].OrganizationId.Should().BeNull();
            users[email].UserRoles.Should().BeEmpty();
        }

        var roles = await db.Roles.ToDictionaryAsync(r => r.Id, r => r.Code);
        foreach (var (email, expected) in new[]
        {
            ("platform@digitalent.ai", "PLATFORM_ADMIN"), ("owner@digitalent.ai", "OWNER"),
            ("manager@digitalent.ai", "MANAGER"), ("employee@digitalent.ai", "EMPLOYEE"),
        })
            users[email].UserRoles.Select(r => roles[r.RoleId]).Should().Equal(expected);

        (await db.Departments.CountAsync()).Should().Be(1);
        (await db.Employees.CountAsync()).Should().Be(3);
        (await db.Employees.SingleAsync(e => e.WorkEmail == "employee@digitalent.ai"))
            .DirectManagerId.Should().Be((await db.Employees.SingleAsync(e => e.WorkEmail == "manager@digitalent.ai")).Id);
    }

    private static AppDbContext CreateContext() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
}
