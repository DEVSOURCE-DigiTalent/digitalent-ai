using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Organization;

public class JobPositionTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task CreateJobPosition_UsesCallerOrganization()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new CreateJobPositionUseCase(context, currentUser.Object);
        var input = new CreateJobPositionUseCaseInput
        {
            Code = "SWE",
            Name = "Software Engineer",
            Description = "Designs and develops software"
        };

        var result = await useCase.ExecuteAsync(input);

        var created = await context.JobPositions.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgId);
        created.Code.Should().Be("SWE");
        created.Status.Should().Be(Statuses.MasterData.Active);
    }

    [Fact]
    public async Task CreateJobPosition_RejectsDuplicateCodeInSameOrg()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        context.JobPositions.Add(new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "SWE",
            Name = "Software Engineer",
            Status = Statuses.MasterData.Active
        });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new CreateJobPositionUseCase(context, currentUser.Object);
        var input = new CreateJobPositionUseCaseInput
        {
            Code = "swe", // Lowercase should be normalized and detected as duplicate
            Name = "Software Engineer II"
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task CreateJobPosition_AllowsSameCodeInDifferentOrg()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        context.JobPositions.Add(new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgA,
            Code = "DEV",
            Name = "Developer Org A",
            Status = Statuses.MasterData.Active
        });
        await context.SaveChangesAsync();

        var currentUserB = new Mock<ICurrentUser>();
        currentUserB.Setup(c => c.GetRequiredOrganizationId()).Returns(orgB);

        var useCase = new CreateJobPositionUseCase(context, currentUserB.Object);
        var input = new CreateJobPositionUseCaseInput
        {
            Code = "DEV",
            Name = "Developer Org B"
        };

        var result = await useCase.ExecuteAsync(input);
        result.Should().NotBeNull();

        var created = await context.JobPositions.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgB);
        created.Code.Should().Be("DEV");
    }

    [Fact]
    public async Task GetPagedJobPositions_ExcludesOtherOrganizations()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        context.JobPositions.AddRange(
            new JobPosition { Id = Guid.NewGuid(), OrganizationId = orgA, Code = "A1", Name = "Pos A1", Status = Statuses.MasterData.Active },
            new JobPosition { Id = Guid.NewGuid(), OrganizationId = orgB, Code = "B1", Name = "Pos B1", Status = Statuses.MasterData.Active }
        );
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgA);

        var useCase = new GetPagedJobPositionsUseCase(context, currentUser.Object);
        var result = await useCase.ExecuteAsync(new GetPagedJobPositionsUseCaseInput { PageIndex = 1, PageSize = 10 });

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("A1");
    }

    [Fact]
    public async Task GetPagedJobPositions_HidesArchivedByDefault()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var org = Guid.NewGuid();
        context.JobPositions.AddRange(
            new JobPosition { Id = Guid.NewGuid(), OrganizationId = org, Code = "ACTIVE", Name = "Active Position", Status = Statuses.MasterData.Active },
            new JobPosition { Id = Guid.NewGuid(), OrganizationId = org, Code = "ARCHIVED", Name = "Archived Position", Status = Statuses.MasterData.Archived }
        );
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(org);

        var useCase = new GetPagedJobPositionsUseCase(context, currentUser.Object);
        var result = await useCase.ExecuteAsync(new GetPagedJobPositionsUseCaseInput { PageIndex = 1, PageSize = 10 });

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("ACTIVE");
    }

    [Fact]
    public async Task ArchiveJobPosition_SetsStatusToArchived()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var posId = Guid.NewGuid();
        context.JobPositions.Add(new JobPosition
        {
            Id = posId,
            OrganizationId = orgId,
            Code = "OLD",
            Name = "Old Position",
            Status = Statuses.MasterData.Active
        });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new ArchiveJobPositionUseCase(context, currentUser.Object);
        await useCase.ExecuteAsync(new ArchiveJobPositionUseCaseInput { Id = posId });

        var archived = await context.JobPositions.FindAsync(posId);
        archived.Should().NotBeNull();
        archived!.Status.Should().Be(Statuses.MasterData.Archived);
    }

    [Fact]
    public async Task ArchiveJobPosition_RejectsWhenEmployeesAreAssigned()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var posId = Guid.NewGuid();
        context.JobPositions.Add(new JobPosition
        {
            Id = posId,
            OrganizationId = orgId,
            Code = "OCCUPIED",
            Name = "Occupied Position",
            Status = Statuses.MasterData.Active
        });

        context.Employees.Add(new Employee
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            DepartmentId = Guid.NewGuid(),
            JobPositionId = posId,
            EmployeeCode = "EMP001",
            FullName = "John Doe",
            Status = Statuses.Employee.Active
        });

        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new ArchiveJobPositionUseCase(context, currentUser.Object);
        var action = async () => await useCase.ExecuteAsync(new ArchiveJobPositionUseCaseInput { Id = posId });

        await action.Should().ThrowAsync<ConflictException>().WithMessage("*assigned to one or more active employees*");
    }
}
