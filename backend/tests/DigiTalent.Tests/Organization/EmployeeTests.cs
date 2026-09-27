using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Organization.Employees;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Organization;

[Collection("PostgresIntegration")]
public class EmployeeTests
{
    private static async Task<DigiTalent.Infrastructure.Persistence.AppDbContext> CreateDatabaseAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return context;
    }

    private static Mock<ICurrentUser> MockUser(Guid organizationId)
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(c => c.GetRequiredOrganizationId()).Returns(organizationId);
        mock.Setup(c => c.OrganizationId).Returns(organizationId);
        return mock;
    }

    private static async Task<DigiTalent.Domain.Entities.Organization> SeedOrganizationAsync(DigiTalent.Infrastructure.Persistence.AppDbContext context)
    {
        var org = new DigiTalent.Domain.Entities.Organization
        {
            Id = Guid.NewGuid(),
            Code = $"ORG_{Guid.NewGuid():N}"[..10].ToUpper(),
            Name = "Test Organization",
            Status = Statuses.Simple.Active
        };
        context.Organizations.Add(org);
        await context.SaveChangesAsync();
        return org;
    }

    private static async Task<Department> SeedDepartmentAsync(DigiTalent.Infrastructure.Persistence.AppDbContext context, Guid orgId, string? code = null, string status = Statuses.MasterData.Active)
    {
        var dept = new Department
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = code ?? $"DEP_{Guid.NewGuid():N}"[..10].ToUpper(),
            Name = "Engineering Department",
            Status = status
        };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();
        return dept;
    }

    private static async Task<JobPosition> SeedJobPositionAsync(DigiTalent.Infrastructure.Persistence.AppDbContext context, Guid orgId, string? code = null, string status = Statuses.MasterData.Active)
    {
        var pos = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = code ?? $"POS_{Guid.NewGuid():N}"[..10].ToUpper(),
            Name = "Software Engineer",
            Status = status
        };
        context.JobPositions.Add(pos);
        await context.SaveChangesAsync();
        return pos;
    }

    [Fact]
    public async Task GetPagedEmployees_SupportsPagingSearchingAndFiltering()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept1 = await SeedDepartmentAsync(context, org.Id, "D1");
        var dept2 = await SeedDepartmentAsync(context, org.Id, "D2");
        var pos1 = await SeedJobPositionAsync(context, org.Id, "P1");
        var pos2 = await SeedJobPositionAsync(context, org.Id, "P2");

        var emp1 = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept1.Id,
            JobPositionId = pos1.Id,
            EmployeeCode = $"EMP_SRCH_1_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Nguyen Van An",
            WorkEmail = $"an_{Guid.NewGuid():N}@test.com",
            Status = Statuses.Employee.Active
        };
        var emp2 = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept1.Id,
            JobPositionId = pos2.Id,
            EmployeeCode = $"EMP_SRCH_2_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Tran Thi Binh",
            WorkEmail = $"binh_{Guid.NewGuid():N}@test.com",
            Status = Statuses.Employee.Active
        };
        var emp3 = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept2.Id,
            JobPositionId = pos1.Id,
            EmployeeCode = $"EMP_SRCH_3_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Le Van Cuong",
            WorkEmail = $"cuong_{Guid.NewGuid():N}@test.com",
            Status = Statuses.Employee.Inactive
        };
        var emp4 = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept2.Id,
            JobPositionId = pos2.Id,
            EmployeeCode = $"EMP_SRCH_4_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Pham Minh Duc",
            WorkEmail = $"duc_{Guid.NewGuid():N}@test.com",
            Status = Statuses.Employee.Archived
        };

        context.Employees.AddRange(emp1, emp2, emp3, emp4);
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new GetPagedEmployeesUseCase(context, currentUser.Object);

        // 1. Paged list excludes archived by default
        var pagedResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            PageIndex = 1,
            PageSize = 2
        });
        pagedResult.Items.Should().HaveCount(2);
        pagedResult.TotalItems.Should().Be(3); // 3 non-archived in org
        pagedResult.Items.Should().NotContain(x => x.Id == emp4.Id);

        // 2. Search by FullName
        var searchResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            Search = "Tran Thi Binh"
        });
        searchResult.Items.Should().ContainSingle(x => x.Id == emp2.Id);

        // 3. Search by EmployeeCode
        var searchCodeResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            Search = emp1.EmployeeCode.ToLower()
        });
        searchCodeResult.Items.Should().ContainSingle(x => x.Id == emp1.Id);

        // 4. Filter by Department
        var deptFilterResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            DepartmentId = dept2.Id
        });
        deptFilterResult.Items.Should().ContainSingle(x => x.Id == emp3.Id);

        // 5. Filter by Position
        var posFilterResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            PositionId = pos2.Id
        });
        posFilterResult.Items.Should().ContainSingle(x => x.Id == emp2.Id);

        // 6. Filter by Status (ARCHIVED)
        var statusFilterResult = await useCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput
        {
            Status = Statuses.Employee.Archived
        });
        statusFilterResult.Items.Should().ContainSingle(x => x.Id == emp4.Id);
    }

    [Fact]
    public async Task GetEmployeeById_ReturnsCorrectDetails()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept = await SeedDepartmentAsync(context, org.Id);
        var pos = await SeedJobPositionAsync(context, org.Id);

        var manager = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept.Id,
            EmployeeCode = $"MGR_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Manager Boss",
            Status = Statuses.Employee.Active
        };
        context.Employees.Add(manager);
        await context.SaveChangesAsync();

        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept.Id,
            JobPositionId = pos.Id,
            DirectManagerId = manager.Id,
            EmployeeCode = $"EMP_DET_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Detailed Employee",
            WorkEmail = $"detailed_{Guid.NewGuid():N}@test.com",
            Phone = "0901234567",
            JoinedAt = new DateOnly(2025, 1, 15),
            Status = Statuses.Employee.Active
        };
        context.Employees.Add(emp);
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new GetEmployeeByIdUseCase(context, currentUser.Object);
        var result = await useCase.ExecuteAsync(new GetEmployeeByIdUseCaseInput { Id = emp.Id });

        result.Should().NotBeNull();
        result.Id.Should().Be(emp.Id);
        result.EmployeeCode.Should().Be(emp.EmployeeCode);
        result.FullName.Should().Be("Detailed Employee");
        result.DepartmentName.Should().Be(dept.Name);
        result.PositionName.Should().Be(pos.Name);
        result.DirectManagerName.Should().Be("Manager Boss");
        result.WorkEmail.Should().Be(emp.WorkEmail);
        result.Phone.Should().Be("0901234567");
        result.JoinedAt.Should().Be(new DateOnly(2025, 1, 15));
    }

    [Fact]
    public async Task GetEmployeeById_ThrowsNotFound_WhenNotExists()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var currentUser = MockUser(org.Id);

        var useCase = new GetEmployeeByIdUseCase(context, currentUser.Object);
        var action = async () => await useCase.ExecuteAsync(new GetEmployeeByIdUseCaseInput { Id = Guid.NewGuid() });

        await action.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateEmployee_PersistsEmployeeScopedToCallerOrganization()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept = await SeedDepartmentAsync(context, org.Id);
        var pos = await SeedJobPositionAsync(context, org.Id);
        var currentUser = MockUser(org.Id);

        var useCase = new CreateEmployeeUseCase(context, currentUser.Object);
        var code = $"EMP_NEW_{Guid.NewGuid():N}"[..15].ToUpper();
        var email = $"new_{Guid.NewGuid():N}@test.com";

        var input = new CreateEmployeeUseCaseInput
        {
            EmployeeCode = code,
            FullName = "New Employee",
            DepartmentId = dept.Id,
            JobPositionId = pos.Id,
            WorkEmail = email,
            Phone = "0987654321",
            JoinedAt = new DateOnly(2026, 3, 1)
        };

        var result = await useCase.ExecuteAsync(input);

        var created = await context.Employees.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(org.Id);
        created.EmployeeCode.Should().Be(code);
        created.FullName.Should().Be("New Employee");
        created.DepartmentId.Should().Be(dept.Id);
        created.JobPositionId.Should().Be(pos.Id);
        created.WorkEmail.Should().Be(email.ToLower());
        created.Status.Should().Be(Statuses.Employee.Active);
    }

    [Fact]
    public async Task CreateEmployee_ThrowsConflict_WhenDuplicateCodeInSameOrg()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept = await SeedDepartmentAsync(context, org.Id);
        var existingCode = $"DUP_CODE_{Guid.NewGuid():N}"[..15].ToUpper();

        context.Employees.Add(new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept.Id,
            EmployeeCode = existingCode,
            FullName = "Existing Employee",
            Status = Statuses.Employee.Active
        });
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new CreateEmployeeUseCase(context, currentUser.Object);

        var input = new CreateEmployeeUseCaseInput
        {
            EmployeeCode = existingCode.ToLower(), // Case insensitive duplicate
            FullName = "Duplicate Employee",
            DepartmentId = dept.Id
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task CreateEmployee_AllowsSameCodeInDifferentOrg()
    {
        using var context = await CreateDatabaseAsync();
        var orgA = await SeedOrganizationAsync(context);
        var orgB = await SeedOrganizationAsync(context);
        var deptA = await SeedDepartmentAsync(context, orgA.Id);
        var deptB = await SeedDepartmentAsync(context, orgB.Id);

        var sharedCode = $"SHARED_{Guid.NewGuid():N}"[..15].ToUpper();

        context.Employees.Add(new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgA.Id,
            DepartmentId = deptA.Id,
            EmployeeCode = sharedCode,
            FullName = "Employee Org A",
            Status = Statuses.Employee.Active
        });
        await context.SaveChangesAsync();

        var currentUserB = MockUser(orgB.Id);
        var useCase = new CreateEmployeeUseCase(context, currentUserB.Object);

        var input = new CreateEmployeeUseCaseInput
        {
            EmployeeCode = sharedCode,
            FullName = "Employee Org B",
            DepartmentId = deptB.Id
        };

        var result = await useCase.ExecuteAsync(input);
        result.Should().NotBeNull();

        var created = await context.Employees.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgB.Id);
        created.EmployeeCode.Should().Be(sharedCode);
    }

    [Fact]
    public async Task CreateEmployee_ThrowsConflict_WhenDuplicateWorkEmailInSameOrg()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept = await SeedDepartmentAsync(context, org.Id);
        var email = $"dup_email_{Guid.NewGuid():N}@test.com";

        context.Employees.Add(new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept.Id,
            EmployeeCode = $"CODE1_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Employee One",
            WorkEmail = email,
            Status = Statuses.Employee.Active
        });
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new CreateEmployeeUseCase(context, currentUser.Object);

        var input = new CreateEmployeeUseCaseInput
        {
            EmployeeCode = $"CODE2_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Employee Two",
            DepartmentId = dept.Id,
            WorkEmail = email.ToUpper() // Case insensitive
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*email*already exists*");
    }

    [Fact]
    public async Task CreateEmployee_ThrowsBadRequest_WhenDepartmentNotExistsOrArchived()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var archivedDept = await SeedDepartmentAsync(context, org.Id, status: Statuses.MasterData.Archived);
        var currentUser = MockUser(org.Id);
        var useCase = new CreateEmployeeUseCase(context, currentUser.Object);

        // Department does not exist
        var actionNonExistent = async () => await useCase.ExecuteAsync(new CreateEmployeeUseCaseInput
        {
            EmployeeCode = $"EMP_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Test",
            DepartmentId = Guid.NewGuid()
        });
        await actionNonExistent.Should().ThrowAsync<BadRequestException>();

        // Department is archived
        var actionArchived = async () => await useCase.ExecuteAsync(new CreateEmployeeUseCaseInput
        {
            EmployeeCode = $"EMP_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Test",
            DepartmentId = archivedDept.Id
        });
        await actionArchived.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task UpdateEmployee_UpdatesAllFieldsSuccessfully()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept1 = await SeedDepartmentAsync(context, org.Id);
        var dept2 = await SeedDepartmentAsync(context, org.Id);
        var pos1 = await SeedJobPositionAsync(context, org.Id);
        var pos2 = await SeedJobPositionAsync(context, org.Id);

        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept1.Id,
            JobPositionId = pos1.Id,
            EmployeeCode = $"ORIG_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Original Name",
            WorkEmail = $"orig_{Guid.NewGuid():N}@test.com",
            Phone = "0111111111",
            Status = Statuses.Employee.Active
        };
        context.Employees.Add(emp);
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new UpdateEmployeeUseCase(context, currentUser.Object);

        var newCode = $"UPD_{Guid.NewGuid():N}"[..15].ToUpper();
        var newEmail = $"upd_{Guid.NewGuid():N}@test.com";

        var input = new UpdateEmployeeUseCaseInput
        {
            Id = emp.Id,
            EmployeeCode = newCode,
            FullName = "Updated Name",
            DepartmentId = dept2.Id,
            JobPositionId = pos2.Id,
            WorkEmail = newEmail,
            Phone = "0999999999",
            Status = Statuses.Employee.Inactive,
            JoinedAt = new DateOnly(2026, 2, 1)
        };

        var result = await useCase.ExecuteAsync(input);
        result.Id.Should().Be(emp.Id);

        var updated = await context.Employees.FindAsync(emp.Id);
        updated.Should().NotBeNull();
        updated!.EmployeeCode.Should().Be(newCode);
        updated.FullName.Should().Be("Updated Name");
        updated.DepartmentId.Should().Be(dept2.Id);
        updated.JobPositionId.Should().Be(pos2.Id);
        updated.WorkEmail.Should().Be(newEmail);
        updated.Phone.Should().Be("0999999999");
        updated.Status.Should().Be(Statuses.Employee.Inactive);
        updated.JoinedAt.Should().Be(new DateOnly(2026, 2, 1));
    }

    [Fact]
    public async Task ArchiveEmployee_SetsStatusToArchived()
    {
        using var context = await CreateDatabaseAsync();
        var org = await SeedOrganizationAsync(context);
        var dept = await SeedDepartmentAsync(context, org.Id);

        var emp = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            DepartmentId = dept.Id,
            EmployeeCode = $"ARC_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "To Be Archived",
            Status = Statuses.Employee.Active
        };
        context.Employees.Add(emp);
        await context.SaveChangesAsync();

        var currentUser = MockUser(org.Id);
        var useCase = new ArchiveEmployeeUseCase(context, currentUser.Object);

        var result = await useCase.ExecuteAsync(new ArchiveEmployeeUseCaseInput { Id = emp.Id });
        result.Id.Should().Be(emp.Id);

        var archived = await context.Employees.FindAsync(emp.Id);
        archived.Should().NotBeNull();
        archived!.Status.Should().Be(Statuses.Employee.Archived);
    }

    [Fact]
    public async Task MultiTenant_TenantACannotReadOrModifyTenantBEmployee()
    {
        using var context = await CreateDatabaseAsync();
        var orgA = await SeedOrganizationAsync(context);
        var orgB = await SeedOrganizationAsync(context);
        var deptA = await SeedDepartmentAsync(context, orgA.Id);

        var empA = new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgA.Id,
            DepartmentId = deptA.Id,
            EmployeeCode = $"TENANT_A_{Guid.NewGuid():N}"[..15].ToUpper(),
            FullName = "Employee in Org A",
            Status = Statuses.Employee.Active
        };
        context.Employees.Add(empA);
        await context.SaveChangesAsync();

        // Caller is Tenant B
        var currentUserB = MockUser(orgB.Id);

        // 1. GetById should throw NotFound
        var getUseCase = new GetEmployeeByIdUseCase(context, currentUserB.Object);
        var getAction = async () => await getUseCase.ExecuteAsync(new GetEmployeeByIdUseCaseInput { Id = empA.Id });
        await getAction.Should().ThrowAsync<NotFoundException>();

        // 2. Update should throw NotFound
        var updateUseCase = new UpdateEmployeeUseCase(context, currentUserB.Object);
        var updateAction = async () => await updateUseCase.ExecuteAsync(new UpdateEmployeeUseCaseInput
        {
            Id = empA.Id,
            EmployeeCode = empA.EmployeeCode,
            FullName = "Hacked Name",
            DepartmentId = deptA.Id
        });
        await updateAction.Should().ThrowAsync<NotFoundException>();

        // 3. Archive should throw NotFound
        var archiveUseCase = new ArchiveEmployeeUseCase(context, currentUserB.Object);
        var archiveAction = async () => await archiveUseCase.ExecuteAsync(new ArchiveEmployeeUseCaseInput { Id = empA.Id });
        await archiveAction.Should().ThrowAsync<NotFoundException>();

        // 4. GetPaged should NOT list Tenant A's employee
        var pagedUseCase = new GetPagedEmployeesUseCase(context, currentUserB.Object);
        var pagedResult = await pagedUseCase.ExecuteAsync(new GetPagedEmployeesUseCaseInput());
        pagedResult.Items.Should().NotContain(x => x.Id == empA.Id);
    }
}
