using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Organization;

public class JobFamilyTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task CreateJobFamily_UsesCallerOrganization()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new CreateJobFamilyUseCase(context, currentUser.Object);
        var input = new CreateJobFamilyUseCaseInput
        {
            Code = "ENG",
            Name = "Engineering",
            Description = "Software and Hardware Engineering"
        };

        var result = await useCase.ExecuteAsync(input);

        var created = await context.JobFamilies.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgId);
        created.Code.Should().Be("ENG");
        created.Status.Should().Be(Statuses.MasterData.Active);
    }

    [Fact]
    public async Task CreateJobFamily_RejectsDuplicateCodeInSameOrg()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        context.JobFamilies.Add(new JobFamily
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "SALES",
            Name = "Sales",
            Status = Statuses.MasterData.Active
        });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new CreateJobFamilyUseCase(context, currentUser.Object);
        var input = new CreateJobFamilyUseCaseInput
        {
            Code = "sales",
            Name = "Sales Dept"
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task GetPagedJobFamilies_FiltersByOrganization()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        context.JobFamilies.AddRange(
            new JobFamily { Id = Guid.NewGuid(), OrganizationId = orgA, Code = "F1", Name = "Family 1", Status = Statuses.MasterData.Active },
            new JobFamily { Id = Guid.NewGuid(), OrganizationId = orgB, Code = "F2", Name = "Family 2", Status = Statuses.MasterData.Active }
        );
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgA);

        var useCase = new GetPagedJobFamiliesUseCase(context, currentUser.Object);
        var result = await useCase.ExecuteAsync(new GetPagedJobFamiliesUseCaseInput { PageIndex = 1, PageSize = 10 });

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("F1");
    }

    [Fact]
    public async Task ArchiveJobFamily_SetsStatusToArchived()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        context.JobFamilies.Add(new JobFamily
        {
            Id = familyId,
            OrganizationId = orgId,
            Code = "OLD",
            Name = "Old Family",
            Status = Statuses.MasterData.Active
        });
        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new ArchiveJobFamilyUseCase(context, currentUser.Object);
        await useCase.ExecuteAsync(new ArchiveJobFamilyUseCaseInput { Id = familyId });

        var archived = await context.JobFamilies.FindAsync(familyId);
        archived.Should().NotBeNull();
        archived!.Status.Should().Be(Statuses.MasterData.Archived);
    }

    [Fact]
    public async Task ArchiveJobFamily_RejectsWhenJobPositionsAreAssigned()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        context.JobFamilies.Add(new JobFamily
        {
            Id = familyId,
            OrganizationId = orgId,
            Code = "OCCUPIED_FAM",
            Name = "Occupied Family",
            Status = Statuses.MasterData.Active
        });

        context.JobPositions.Add(new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            JobFamilyId = familyId,
            Code = "POS1",
            Name = "Position in Family",
            Status = Statuses.MasterData.Active
        });

        await context.SaveChangesAsync();

        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);

        var useCase = new ArchiveJobFamilyUseCase(context, currentUser.Object);
        var action = async () => await useCase.ExecuteAsync(new ArchiveJobFamilyUseCaseInput { Id = familyId });

        await action.Should().ThrowAsync<ConflictException>().WithMessage("*active job positions associated with it*");
    }
}
