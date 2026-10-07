using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Smoke;

/// <summary>
/// Smoke tests validating end-to-end multi-tenant isolation, department lifecycle, and permissions.
/// Maps to SEP-06 acceptance criteria.
/// </summary>
public class FoundationSmokeTests
{
    private DbContextOptions<AppDbContext> CreateOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task CrossTenantDepartmentQuery_ThrowsForbiddenException_WhenOrganizationIdMissing()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(CreateOptions(dbName));

        var anonymousUser = new Mock<ICurrentUser>();
        anonymousUser.Setup(c => c.GetRequiredOrganizationId()).Throws(new ForbiddenException("Organization context is required."));

        var useCase = new GetPagedDepartmentsUseCase(context, anonymousUser.Object);
        var input = new GetPagedDepartmentsUseCaseInput { PageIndex = 1, PageSize = 10 };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ForbiddenException>().WithMessage("*Organization context is required*");
    }

    [Fact]
    public async Task CrossTenantDepartmentAccess_ExcludesOtherTenants()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(CreateOptions(dbName));

        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();

        context.Departments.AddRange(
            new Department { Id = Guid.NewGuid(), OrganizationId = tenantA, Code = "HR-A", Name = "HR Dept Tenant A", Status = Statuses.MasterData.Active },
            new Department { Id = Guid.NewGuid(), OrganizationId = tenantB, Code = "HR-B", Name = "HR Dept Tenant B", Status = Statuses.MasterData.Active }
        );
        await context.SaveChangesAsync();

        var tenantAUser = new Mock<ICurrentUser>();
        tenantAUser.Setup(c => c.GetRequiredOrganizationId()).Returns(tenantA);

        var useCase = new GetPagedDepartmentsUseCase(context, tenantAUser.Object);
        var result = await useCase.ExecuteAsync(new GetPagedDepartmentsUseCaseInput { PageIndex = 1, PageSize = 10 });

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("HR-A");
        result.Items.Any(d => d.Code == "HR-B").Should().BeFalse();
    }

    [Fact]
    public async Task CrossTenantDepartmentCreate_EnforcesCallerOrganizationId()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(CreateOptions(dbName));

        var tenantOrgId = Guid.NewGuid();
        var caller = new Mock<ICurrentUser>();
        caller.Setup(c => c.GetRequiredOrganizationId()).Returns(tenantOrgId);

        var createUseCase = new CreateDepartmentUseCase(context, caller.Object, Mock.Of<IAuditService>());
        var output = await createUseCase.ExecuteAsync(new CreateDepartmentUseCaseInput
        {
            Code = "FIN",
            Name = "Finance",
            Description = "Finance department"
        });

        var created = await context.Departments.FirstOrDefaultAsync(d => d.Id == output.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(tenantOrgId);
        created.Status.Should().Be(Statuses.MasterData.Active);
    }

    [Fact]
    public async Task ArchiveDepartment_SetsStatusToArchived_DoesNotHardDelete()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(CreateOptions(dbName));

        var orgId = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        var dept = new Department
        {
            Id = deptId,
            OrganizationId = orgId,
            Code = "MKT",
            Name = "Marketing",
            Status = Statuses.MasterData.Active
        };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var caller = new Mock<ICurrentUser>();
        caller.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var archiveUseCase = new ArchiveDepartmentUseCase(context, caller.Object, Mock.Of<IAuditService>());
        await archiveUseCase.ExecuteAsync(new ArchiveDepartmentUseCaseInput { Id = deptId });

        // Verify entity still exists in database with ARCHIVED status (not deleted)
        var rowInDb = await context.Departments.FirstOrDefaultAsync(d => d.Id == deptId);
        rowInDb.Should().NotBeNull();
        rowInDb!.Status.Should().Be(Statuses.MasterData.Archived);
    }
}
