using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Competency;

public class CompetencyTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    private static Mock<ICurrentUser> CreateCurrentUserMock(Guid orgId, Guid? userId = null)
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);
        mock.Setup(c => c.OrganizationId).Returns(orgId);
        mock.Setup(c => c.UserId).Returns(userId ?? Guid.NewGuid());
        mock.Setup(c => c.IsAuthenticated).Returns(true);
        return mock;
    }

    [Fact]
    public async Task CreateCompetency_RejectsDuplicateCodeInSameCategory()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "DIGITAL_FOUNDATIONS",
            Name = "Digital Foundations",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        context.GetDbSet<Domain.Entities.Competency>().Add(new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "AI_LITERACY",
            Name = "AI Literacy",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active
        });
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new CreateCompetencyUseCase(context, currentUser.Object);

        var input = new CreateCompetencyUseCaseInput
        {
            CategoryId = category.Id,
            Code = "ai_literacy", // Case-insensitive duplicate
            Name = "AI Literacy Advanced",
            CompetencyType = Statuses.CompetencyType.CoreDigital
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task CreateCompetency_AllowsSameCodeInDifferentCategory()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var cat1 = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "CAT_1",
            Name = "Category 1",
            Status = Statuses.MasterData.Active
        };
        var cat2 = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "CAT_2",
            Name = "Category 2",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().AddRange(cat1, cat2);

        context.GetDbSet<Domain.Entities.Competency>().Add(new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = cat1.Id,
            Code = "COMMUNICATION",
            Name = "Communication Cat 1",
            CompetencyType = Statuses.CompetencyType.Professional,
            Status = Statuses.Competency.Active
        });
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new CreateCompetencyUseCase(context, currentUser.Object);

        var input = new CreateCompetencyUseCaseInput
        {
            CategoryId = cat2.Id,
            Code = "COMMUNICATION",
            Name = "Communication Cat 2",
            CompetencyType = Statuses.CompetencyType.Professional
        };

        var result = await useCase.ExecuteAsync(input);
        result.Should().NotBeNull();

        var created = await context.GetDbSet<Domain.Entities.Competency>().FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.CategoryId.Should().Be(cat2.Id);
        created.Code.Should().Be("COMMUNICATION");
    }

    [Fact]
    public void CreateCompetencyValidator_ValidatesLevelRangeBetween1And3()
    {
        var validator = new CreateCompetencyUseCaseValidator();

        var invalidLower = new CreateCompetencyUseCaseInput
        {
            CategoryId = Guid.NewGuid(),
            Code = "CODE1",
            Name = "Name1",
            Criteria = new List<CreateCompetencyCriterionInput>
            {
                new() { Level = 0, IndicatorCode = "IND1", BehaviorIndicator = "Indicator text" }
            }
        };
        var resultLower = validator.Validate(invalidLower);
        resultLower.IsValid.Should().BeFalse();
        resultLower.Errors.Should().Contain(e => e.PropertyName.Contains("Level"));

        var invalidUpper = new CreateCompetencyUseCaseInput
        {
            CategoryId = Guid.NewGuid(),
            Code = "CODE1",
            Name = "Name1",
            Criteria = new List<CreateCompetencyCriterionInput>
            {
                new() { Level = 4, IndicatorCode = "IND1", BehaviorIndicator = "Indicator text" }
            }
        };
        var resultUpper = validator.Validate(invalidUpper);
        resultUpper.IsValid.Should().BeFalse();
        resultUpper.Errors.Should().Contain(e => e.PropertyName.Contains("Level"));

        var valid = new CreateCompetencyUseCaseInput
        {
            CategoryId = Guid.NewGuid(),
            Code = "CODE1",
            Name = "Name1",
            Criteria = new List<CreateCompetencyCriterionInput>
            {
                new() { Level = 1, IndicatorCode = "IND1", BehaviorIndicator = "Level 1 indicator" },
                new() { Level = 2, IndicatorCode = "IND2", BehaviorIndicator = "Level 2 indicator" },
                new() { Level = 3, IndicatorCode = "IND3", BehaviorIndicator = "Level 3 indicator" }
            }
        };
        var resultValid = validator.Validate(valid);
        resultValid.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task CreateCompetency_RejectsDuplicateIndicatorCodeAtSameLevel()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "DIGITAL",
            Name = "Digital",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new CreateCompetencyUseCase(context, currentUser.Object);

        var input = new CreateCompetencyUseCaseInput
        {
            CategoryId = category.Id,
            Code = "CLOUD_COMPUTING",
            Name = "Cloud Computing",
            Criteria = new List<CreateCompetencyCriterionInput>
            {
                new() { Level = 1, IndicatorCode = "IND_A", BehaviorIndicator = "Indicator A" },
                new() { Level = 1, IndicatorCode = "ind_a", BehaviorIndicator = "Duplicate Indicator A" }
            }
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<BadRequestException>().WithMessage("*Duplicate criterion indicator code*");
    }

    [Fact]
    public async Task CreateDraftPositionRequirementSet_CreatesVersionAndItems()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "DATA_ENGINEER",
            Name = "Data Engineer",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);

        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "TECH",
            Name = "Technology",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        var comp1 = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "SQL",
            Name = "SQL & Data Modeling",
            CompetencyType = Statuses.CompetencyType.Professional,
            Status = Statuses.Competency.Active
        };
        var comp2 = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "PYTHON",
            Name = "Python Programming",
            CompetencyType = Statuses.CompetencyType.Professional,
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().AddRange(comp1, comp2);
        await context.SaveChangesAsync();

        var userId = Guid.NewGuid();
        var currentUser = CreateCurrentUserMock(orgId, userId);
        var useCase = new CreateDraftPositionRequirementSetUseCase(context, currentUser.Object);

        var input = new CreateDraftPositionRequirementSetUseCaseInput
        {
            JobPositionId = position.Id,
            EffectiveFrom = new DateOnly(2026, 1, 1),
            EffectiveTo = new DateOnly(2026, 12, 31),
            ReviewDate = new DateOnly(2026, 6, 30),
            Items = new List<PositionRequirementItemInput>
            {
                new() { CompetencyId = comp1.Id, RequiredLevel = 3, WeightPercent = 60m, IsMandatory = true },
                new() { CompetencyId = comp2.Id, RequiredLevel = 2, WeightPercent = 40m, IsMandatory = true }
            }
        };

        var result = await useCase.ExecuteAsync(input);

        result.Should().NotBeNull();
        result.VersionNo.Should().Be(1);
        result.Status.Should().Be(Statuses.PositionRequirementSet.Draft);

        var savedSet = await context.GetDbSet<PositionRequirementSet>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == result.Id);

        savedSet.Should().NotBeNull();
        savedSet!.JobPositionId.Should().Be(position.Id);
        savedSet.VersionNo.Should().Be(1);
        savedSet.Status.Should().Be(Statuses.PositionRequirementSet.Draft);
        savedSet.CreatedByUserId.Should().Be(userId);
        savedSet.Items.Should().HaveCount(2);
        savedSet.Items.Should().Contain(i => i.CompetencyId == comp1.Id && i.RequiredLevel == 3 && i.WeightPercent == 60m);
        savedSet.Items.Should().Contain(i => i.CompetencyId == comp2.Id && i.RequiredLevel == 2 && i.WeightPercent == 40m);
    }

    [Fact]
    public async Task CreateDraftPositionRequirementSet_IncrementsVersion()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "DEVOPS",
            Name = "DevOps Engineer",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);

        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "TECH",
            Name = "Technology",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        var comp = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "CI_CD",
            Name = "CI/CD Pipelines",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().Add(comp);

        // Version 1 already exists
        context.GetDbSet<PositionRequirementSet>().Add(new PositionRequirementSet
        {
            Id = Guid.NewGuid(),
            JobPositionId = position.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Active,
            CreatedByUserId = Guid.NewGuid()
        });
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new CreateDraftPositionRequirementSetUseCase(context, currentUser.Object);

        var input = new CreateDraftPositionRequirementSetUseCaseInput
        {
            JobPositionId = position.Id,
            Items = new List<PositionRequirementItemInput>
            {
                new() { CompetencyId = comp.Id, RequiredLevel = 2, WeightPercent = 100m }
            }
        };

        var result = await useCase.ExecuteAsync(input);

        result.VersionNo.Should().Be(2);
        result.Status.Should().Be(Statuses.PositionRequirementSet.Draft);
    }

    [Fact]
    public async Task UpdateDraftPositionRequirementSet_UpdatesDraftItems()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "SEC_ENG",
            Name = "Security Engineer",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);

        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "TECH",
            Name = "Technology",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        var comp1 = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "APP_SEC",
            Name = "Application Security",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active
        };
        var comp2 = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "NET_SEC",
            Name = "Network Security",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().AddRange(comp1, comp2);

        var set = new PositionRequirementSet
        {
            Id = Guid.NewGuid(),
            JobPositionId = position.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Draft,
            CreatedByUserId = Guid.NewGuid(),
            RowVersion = 1
        };
        set.Items.Add(new PositionRequirementItem
        {
            Id = Guid.NewGuid(),
            RequirementSetId = set.Id,
            CompetencyId = comp1.Id,
            RequiredLevel = 1,
            WeightPercent = 100m
        });
        context.GetDbSet<PositionRequirementSet>().Add(set);
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new UpdateDraftPositionRequirementSetUseCase(context, currentUser.Object);

        var input = new UpdateDraftPositionRequirementSetUseCaseInput
        {
            Id = set.Id,
            EffectiveFrom = new DateOnly(2026, 3, 1),
            Items = new List<PositionRequirementItemInput>
            {
                new() { CompetencyId = comp1.Id, RequiredLevel = 2, WeightPercent = 50m },
                new() { CompetencyId = comp2.Id, RequiredLevel = 3, WeightPercent = 50m }
            }
        };

        var result = await useCase.ExecuteAsync(input);
        result.Id.Should().Be(set.Id);

        var updatedSet = await context.GetDbSet<PositionRequirementSet>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == set.Id);

        updatedSet.Should().NotBeNull();
        updatedSet!.EffectiveFrom.Should().Be(new DateOnly(2026, 3, 1));
        updatedSet.RowVersion.Should().Be(2);
        updatedSet.Items.Should().HaveCount(2);
        updatedSet.Items.Should().Contain(i => i.CompetencyId == comp1.Id && i.RequiredLevel == 2 && i.WeightPercent == 50m);
        updatedSet.Items.Should().Contain(i => i.CompetencyId == comp2.Id && i.RequiredLevel == 3 && i.WeightPercent == 50m);
    }

    [Fact]
    public async Task UpdateDraftPositionRequirementSet_RejectsIfAlreadyActive()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "QA_LEAD",
            Name = "QA Lead",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);

        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "TECH",
            Name = "Technology",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        var comp = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "AUTOMATION",
            Name = "Test Automation",
            CompetencyType = Statuses.CompetencyType.Professional,
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().Add(comp);

        var set = new PositionRequirementSet
        {
            Id = Guid.NewGuid(),
            JobPositionId = position.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Active, // Already ACTIVE!
            CreatedByUserId = Guid.NewGuid()
        };
        context.GetDbSet<PositionRequirementSet>().Add(set);
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var useCase = new UpdateDraftPositionRequirementSetUseCase(context, currentUser.Object);

        var input = new UpdateDraftPositionRequirementSetUseCaseInput
        {
            Id = set.Id,
            Items = new List<PositionRequirementItemInput>
            {
                new() { CompetencyId = comp.Id, RequiredLevel = 3, WeightPercent = 100m }
            }
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<BadRequestException>().WithMessage("*Only DRAFT sets can be modified*");
    }

    [Fact]
    public async Task ActivatePositionRequirementSet_SetsActiveAndArchivesPreviousActive()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "PRODUCT_OWNER",
            Name = "Product Owner",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);

        var category = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "PROD",
            Name = "Product",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(category);

        var comp = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Code = "ROADMAP",
            Name = "Product Roadmapping",
            CompetencyType = Statuses.CompetencyType.Professional,
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().Add(comp);

        // Previous ACTIVE version (v1)
        var v1 = new PositionRequirementSet
        {
            Id = Guid.NewGuid(),
            JobPositionId = position.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Active,
            CreatedByUserId = Guid.NewGuid()
        };
        v1.Items.Add(new PositionRequirementItem
        {
            Id = Guid.NewGuid(),
            RequirementSetId = v1.Id,
            CompetencyId = comp.Id,
            RequiredLevel = 2,
            WeightPercent = 100m
        });

        // New DRAFT version (v2)
        var v2 = new PositionRequirementSet
        {
            Id = Guid.NewGuid(),
            JobPositionId = position.Id,
            VersionNo = 2,
            Status = Statuses.PositionRequirementSet.Draft,
            CreatedByUserId = Guid.NewGuid()
        };
        v2.Items.Add(new PositionRequirementItem
        {
            Id = Guid.NewGuid(),
            RequirementSetId = v2.Id,
            CompetencyId = comp.Id,
            RequiredLevel = 3,
            WeightPercent = 100m
        });

        context.GetDbSet<PositionRequirementSet>().AddRange(v1, v2);
        await context.SaveChangesAsync();

        var userId = Guid.NewGuid();
        var currentUser = CreateCurrentUserMock(orgId, userId);
        var useCase = new ActivatePositionRequirementSetUseCase(context, currentUser.Object);

        var result = await useCase.ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = v2.Id });

        result.Status.Should().Be(Statuses.PositionRequirementSet.Active);
        result.VersionNo.Should().Be(2);

        var v1Reloaded = await context.GetDbSet<PositionRequirementSet>().FindAsync(v1.Id);
        v1Reloaded.Should().NotBeNull();
        v1Reloaded!.Status.Should().Be(Statuses.PositionRequirementSet.Archived);

        var v2Reloaded = await context.GetDbSet<PositionRequirementSet>().FindAsync(v2.Id);
        v2Reloaded.Should().NotBeNull();
        v2Reloaded!.Status.Should().Be(Statuses.PositionRequirementSet.Active);
        v2Reloaded.ActivatedByUserId.Should().Be(userId);
        v2Reloaded.ActivatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task MultiTenantIsolation_CompetencyCannotBeCreatedInAnotherOrgCategory()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        var catA = new CompetencyCategory
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgA,
            Code = "CAT_A",
            Name = "Org A Category",
            Status = Statuses.MasterData.Active
        };
        context.GetDbSet<CompetencyCategory>().Add(catA);
        await context.SaveChangesAsync();

        var userB = CreateCurrentUserMock(orgB);
        var useCase = new CreateCompetencyUseCase(context, userB.Object);

        var input = new CreateCompetencyUseCaseInput
        {
            CategoryId = catA.Id,
            Code = "COMP_B",
            Name = "Competency B"
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<BadRequestException>().WithMessage("*does not exist or is archived in your organization*");
    }

    [Fact]
    public async Task MultiTenantIsolation_CompetenciesFilteredByCallerOrg()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        var catA = new CompetencyCategory { Id = Guid.NewGuid(), OrganizationId = orgA, Code = "CAT_A", Name = "Org A Category" };
        var catB = new CompetencyCategory { Id = Guid.NewGuid(), OrganizationId = orgB, Code = "CAT_B", Name = "Org B Category" };
        context.GetDbSet<CompetencyCategory>().AddRange(catA, catB);

        var compA = new Domain.Entities.Competency { Id = Guid.NewGuid(), CategoryId = catA.Id, Code = "COMP_A", Name = "Competency A", Status = Statuses.Competency.Active };
        var compB = new Domain.Entities.Competency { Id = Guid.NewGuid(), CategoryId = catB.Id, Code = "COMP_B", Name = "Competency B", Status = Statuses.Competency.Active };
        context.GetDbSet<Domain.Entities.Competency>().AddRange(compA, compB);
        await context.SaveChangesAsync();

        var userA = CreateCurrentUserMock(orgA);
        var useCase = new GetCompetenciesUseCase(context, userA.Object);

        var result = await useCase.ExecuteAsync(new GetCompetenciesUseCaseInput());

        result.Items.Should().HaveCount(1);
        result.Items.First().Code.Should().Be("COMP_A");
    }

    [Fact]
    public async Task MultiTenantIsolation_PositionRequirementsCannotBeCreatedForAnotherOrgPosition()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgA = Guid.NewGuid();
        var orgB = Guid.NewGuid();

        var posA = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgA,
            Code = "POS_A",
            Name = "Position A",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(posA);

        var catB = new CompetencyCategory { Id = Guid.NewGuid(), OrganizationId = orgB, Code = "CAT_B", Name = "Org B Category" };
        context.GetDbSet<CompetencyCategory>().Add(catB);

        var compB = new Domain.Entities.Competency { Id = Guid.NewGuid(), CategoryId = catB.Id, Code = "COMP_B", Name = "Competency B", Status = Statuses.Competency.Active };
        context.GetDbSet<Domain.Entities.Competency>().Add(compB);
        await context.SaveChangesAsync();

        var userB = CreateCurrentUserMock(orgB);
        var useCase = new CreateDraftPositionRequirementSetUseCase(context, userB.Object);

        var input = new CreateDraftPositionRequirementSetUseCaseInput
        {
            JobPositionId = posA.Id, // Position belongs to Org A
            Items = new List<PositionRequirementItemInput>
            {
                new() { CompetencyId = compB.Id, RequiredLevel = 1, WeightPercent = 100m }
            }
        };

        var action = async () => await useCase.ExecuteAsync(input);
        await action.Should().ThrowAsync<BadRequestException>().WithMessage("*Job position does not exist or is archived in your organization*");
    }

    [Fact]
    public async Task ArchiveCompetency_SetsStatusToArchivedAndHidesFromList()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var orgId = Guid.NewGuid();
        var cat = new CompetencyCategory { Id = Guid.NewGuid(), OrganizationId = orgId, Code = "CAT_1", Name = "Category 1" };
        context.GetDbSet<CompetencyCategory>().Add(cat);

        var comp = new Domain.Entities.Competency
        {
            Id = Guid.NewGuid(),
            CategoryId = cat.Id,
            Code = "TO_ARCHIVE",
            Name = "To Archive",
            Status = Statuses.Competency.Active
        };
        context.GetDbSet<Domain.Entities.Competency>().Add(comp);
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserMock(orgId);
        var archiveUseCase = new ArchiveCompetencyUseCase(context, currentUser.Object);
        var getUseCase = new GetCompetenciesUseCase(context, currentUser.Object);

        await archiveUseCase.ExecuteAsync(new ArchiveCompetencyUseCaseInput { Id = comp.Id });

        var archived = await context.GetDbSet<Domain.Entities.Competency>().FindAsync(comp.Id);
        archived.Should().NotBeNull();
        archived!.Status.Should().Be(Statuses.Competency.Archived);

        var list = await getUseCase.ExecuteAsync(new GetCompetenciesUseCaseInput());
        list.Items.Should().BeEmpty();
    }
}
