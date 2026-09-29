using DigiTalent.Domain.Entities.Organization;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.UnitTests.TestSupport;

/// <summary>
/// Creates an isolated in-memory AppDbContext per test so tests never share state,
/// with a seeded Organization since most services resolve OrganizationId from the DB.
/// </summary>
public static class TestDbContextFactory
{
    public static AppDbContext CreateWithOrganization(out Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);

        var organization = new Organization
        {
            Code = "ORG",
            Name = "Test Organization",
            Status = "ACTIVE",
        };
        context.Organizations.Add(organization);
        context.SaveChanges();

        organizationId = organization.Id;
        return context;
    }
}
