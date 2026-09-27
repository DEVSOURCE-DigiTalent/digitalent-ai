using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Organization;

public class DepartmentScopeTests
{
    private DbContextOptions<DigiTalent.Infrastructure.Persistence.AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<DigiTalent.Infrastructure.Persistence.AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task DepartmentListExcludesOtherOrganization()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        context.Departments.Add(new Department { Id = Guid.NewGuid(), OrganizationId = orgA, Code = "A1", Name = "A1", Status = Statuses.MasterData.Active });
        context.Departments.Add(new Department { Id = Guid.NewGuid(), OrganizationId = orgB, Code = "B1", Name = "B1", Status = Statuses.MasterData.Active });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgA);

        var useCase = new GetPagedDepartmentsUseCase(context, currentUser.Object);
        var input = new GetPagedDepartmentsUseCaseInput { PageIndex = 1, PageSize = 10 };

        var result = await useCase.ExecuteAsync(input);

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("A1");
    }

    [Fact]
    public async Task DepartmentListHidesArchivedByDefault()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(GetOptions(dbName));

        var org = Guid.NewGuid();

        context.Departments.Add(new Department { Id = Guid.NewGuid(), OrganizationId = org, Code = "ACTIVE", Name = "Active", Status = Statuses.MasterData.Active });
        context.Departments.Add(new Department { Id = Guid.NewGuid(), OrganizationId = org, Code = "ARCHIVED", Name = "Archived", Status = Statuses.MasterData.Archived });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(org);

        var useCase = new GetPagedDepartmentsUseCase(context, currentUser.Object);
        var input = new GetPagedDepartmentsUseCaseInput { PageIndex = 1, PageSize = 10 }; // Default, no status filter

        var result = await useCase.ExecuteAsync(input);

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("ACTIVE");
    }

    [Fact]
    public async Task CreateDepartmentUsesCallerOrganization()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new CreateDepartmentUseCase(context, currentUser.Object);
        var input = new CreateDepartmentUseCaseInput { Code = "NEW", Name = "New Dept" };

        var result = await useCase.ExecuteAsync(input);

        var created = await context.Departments.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgId);
    }
}
