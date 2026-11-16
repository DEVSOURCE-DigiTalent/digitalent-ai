using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Application.UseCases.Organization.Invitations;
using DigiTalent.Application.UseCases.Organization.Members;
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

        var managerRole = new Role { Code = "MANAGER", Name = "Manager" };
        var manager = new Employee { OrganizationId = orgId, UserId = Guid.NewGuid(), EmployeeCode = "MGR", FullName = "Manager" };
        context.Roles.AddRange(managerRole, new Role { Code = "EMPLOYEE", Name = "Employee" });
        context.Employees.Add(manager);
        await context.SaveChangesAsync();

        var useCase = new CreateDepartmentUseCase(context, currentUser.Object, Mock.Of<IAuditService>());
        var input = new CreateDepartmentUseCaseInput { Code = "NEW", Name = "New Dept" };

        await FluentActions.Invoking(() => useCase.ExecuteAsync(input)).Should().ThrowAsync<BadRequestException>();
        input.ManagerEmployeeId = manager.Id;
        var result = await useCase.ExecuteAsync(input);

        var created = await context.Departments.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgId);
        created.ManagerEmployeeId.Should().Be(manager.Id);
        manager.DepartmentId.Should().Be(created.Id);
        manager.DirectManagerId.Should().BeNull();
        (await context.UserRoles.Where(r => r.UserId == manager.UserId).Select(r => r.Role.Code).ToListAsync())
            .Should().BeEquivalentTo("MANAGER", "EMPLOYEE");
    }

    [Fact]
    public async Task InvitingAHeadFirstReservesTheDepartmentAndActivationAssignsManagerAccess()
    {
        using var context = new DigiTalent.Infrastructure.Persistence.AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var managerRole = new Role { Code = "MANAGER", Name = "Manager" };
        var employeeRole = new Role { Code = "EMPLOYEE", Name = "Employee" };
        context.Roles.AddRange(managerRole, employeeRole);
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);
        var permissions = new Mock<IPermissionService>();
        permissions.Setup(p => p.HasAnyAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(true);
        var sender = new Mock<IInvitationSender>();
        sender.Setup(s => s.SendAsync(It.IsAny<InvitationMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("test-link");
        var invite = new InviteMembersUseCase(context, currentUser.Object, permissions.Object, sender.Object,
            Mock.Of<IAuditService>(), new MemberDirectory(context));

        InviteMemberRow Row(string email, string role = "EMPLOYEE") => new()
        {
            Email = email, FullName = email, Role = role, DepartmentName = "Kế toán", JobPositionName = "Kế toán",
        };

        var missingManager = await invite.ExecuteAsync(new InviteMembersUseCaseInput
        {
            Rows = new() { Row("employee@example.test") },
        });
        missingManager.Rejected.Should().ContainSingle();
        (await context.Departments.CountAsync()).Should().Be(0);

        var batch = await invite.ExecuteAsync(new InviteMembersUseCaseInput
        {
            Rows = new() { Row("employee@example.test"), Row("manager@example.test", "MANAGER"), Row("second@example.test", "MANAGER") },
        });
        batch.Created.Select(m => m.Email).Should().Equal("manager@example.test", "employee@example.test");
        batch.Rejected.Should().ContainSingle().Which.Email.Should().Be("second@example.test");
        (await context.JobPositions.SingleAsync()).DepartmentId.Should().Be((await context.Departments.SingleAsync()).Id);

        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        var activate = new ActivateInvitationUseCase(context, hasher.Object);
        var employeeInput = new ActivateInvitationUseCaseInput
        {
            Token = batch.Created[1].Token!, Password = "valid-password",
        };
        await FluentActions.Awaiting(() => activate.ExecuteAsync(employeeInput)).Should().ThrowAsync<ConflictException>();
        context.ChangeTracker.Clear();
        (await context.Users.AnyAsync(u => u.Email == "employee@example.test")).Should().BeFalse();

        var manager = await activate.ExecuteAsync(new ActivateInvitationUseCaseInput
        {
            Token = batch.Created[0].Token!, Password = "valid-password",
        });
        var department = await context.Departments.SingleAsync();
        department.ManagerEmployeeId.Should().Be(manager.EmployeeId);
        var employee = await activate.ExecuteAsync(employeeInput);
        (await context.Employees.SingleAsync(e => e.Id == employee.EmployeeId)).DirectManagerId.Should().Be(manager.EmployeeId);
        (await context.UserRoles.Where(r => r.UserId == manager.UserId).Select(r => r.RoleId).ToListAsync())
            .Should().BeEquivalentTo(new[] { managerRole.Id, employeeRole.Id });
    }
}
