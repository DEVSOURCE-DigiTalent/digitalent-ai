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
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var position = AddPosition(context, orgId);

        var v1 = NewSet(position.Id, 1, Statuses.PositionRequirementSet.Active);
        v1.Items = Tt02TestData.Items(v1.Id, competencies, level: 2).ToList();
        var v2 = NewSet(position.Id, 2, Statuses.PositionRequirementSet.Draft);
        v2.Items = Tt02TestData.Items(v2.Id, competencies, level: 3).ToList();
        context.GetDbSet<PositionRequirementSet>().AddRange(v1, v2);
        await context.SaveChangesAsync();

        var userId = Guid.NewGuid();
        var useCase = new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId, userId).Object);

        var result = await useCase.ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = v2.Id });

        result.Status.Should().Be(Statuses.PositionRequirementSet.Active);
        result.VersionNo.Should().Be(2);

        var v1Reloaded = await context.GetDbSet<PositionRequirementSet>().FindAsync(v1.Id);
        v1Reloaded!.Status.Should().Be(Statuses.PositionRequirementSet.Archived);

        var v2Reloaded = await context.GetDbSet<PositionRequirementSet>().FindAsync(v2.Id);
        v2Reloaded!.Status.Should().Be(Statuses.PositionRequirementSet.Active);
        v2Reloaded.ActivatedByUserId.Should().Be(userId);
        v2Reloaded.ActivatedAt.Should().NotBeNull();
    }

    [Theory]
    [InlineData(-10)]  // tổng 90
    [InlineData(10)]   // tổng 110
    public async Task ActivatePositionRequirementSet_RejectsWhenWeightSumIsNot100(decimal delta)
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        draft.Items = Tt02TestData.Items(draft.Id, competencies).ToList();
        draft.Items.Last().WeightPercent += delta;
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var useCase = new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object);

        var act = () => useCase.ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        await act.Should().ThrowAsync<BadRequestException>().WithMessage("*100*");
        var reloaded = await context.GetDbSet<PositionRequirementSet>().FindAsync(draft.Id);
        reloaded!.Status.Should().Be(Statuses.PositionRequirementSet.Draft);
    }

    [Fact]
    public async Task ActivatePositionRequirementSet_AcceptsAll24FrameworkCompetenciesWithFractionalWeights()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        draft.Items = Tt02TestData.Items(draft.Id, competencies).ToList(); // 23 × 4.17 + 4.09
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var useCase = new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object);

        var result = await useCase.ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        result.Status.Should().Be(Statuses.PositionRequirementSet.Active);
    }

    // D-B7 (30/09/2026): a position picks the competencies relevant to the job — not necessarily all 24.

    [Fact]
    public async Task ActivatePositionRequirementSet_AcceptsSelectionOfFrameworkCompetencies()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        draft.Items = Tt02TestData.Items(draft.Id, competencies.Where(c => !c.Code.StartsWith("TT02-6."))).ToList(); // 21 lines
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var result = await new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object)
            .ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        result.Status.Should().Be(Statuses.PositionRequirementSet.Active);
    }

    [Fact]
    public async Task ActivatePositionRequirementSet_RejectsFewerThanNineCompetencies()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        // 8 lines that still contain the core competencies 4.1 and 4.2
        draft.Items = Tt02TestData.Items(draft.Id, competencies.Where(c => c.Code.StartsWith("TT02-4.") || c.Code.StartsWith("TT02-5."))).ToList();
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var act = () => new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object)
            .ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        var error = (await act.Should().ThrowAsync<BadRequestException>()
            .WithMessage("A requirement set needs between 9 and 24 competencies of the national digital competence framework (Circular 02/2025)*"))
            .Which;
        error.Message.Should().Contain("(current: 8)");
        error.Errors.Should().ContainSingle(e => e.Field == "items" && e.Code == ActivatePositionRequirementSetUseCase.RequirementCountOutOfRange);
        (await context.GetDbSet<PositionRequirementSet>().FindAsync(draft.Id))!.Status.Should().Be(Statuses.PositionRequirementSet.Draft);
    }

    [Fact]
    public async Task ActivatePositionRequirementSet_RejectsSetWithoutCoreSafetyCompetencies()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        draft.Items = Tt02TestData.Items(draft.Id, competencies.Where(c => c.Code != "TT02-4.2")).ToList();
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var act = () => new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object)
            .ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        var error = (await act.Should().ThrowAsync<BadRequestException>()).Which;
        error.Message.Should().Contain("Missing: 4.2.");
        error.Errors.Should().ContainSingle(e => e.Field == "items" && e.Code == ActivatePositionRequirementSetUseCase.CoreCompetencyMissing);
    }

    [Fact]
    public async Task ActivatePositionRequirementSet_RejectsCompetencyWithoutFrameworkMapping()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var internalCompetency = new Domain.Entities.Competency
        {
            CategoryId = competencies[0].CategoryId,
            Code = "INTERNAL_EXCEL",
            Name = "Excel nội bộ",
            CompetencyType = Statuses.CompetencyType.Internal,
            Status = Statuses.Competency.Active,
        };
        context.GetDbSet<Domain.Entities.Competency>().Add(internalCompetency);
        var draft = NewSet(AddPosition(context, orgId).Id, 1, Statuses.PositionRequirementSet.Draft);
        draft.Items = Tt02TestData.Items(draft.Id, competencies.Append(internalCompetency)).ToList();
        context.GetDbSet<PositionRequirementSet>().Add(draft);
        await context.SaveChangesAsync();

        var useCase = new ActivatePositionRequirementSetUseCase(context, CreateCurrentUserMock(orgId).Object);

        var act = () => useCase.ExecuteAsync(new ActivatePositionRequirementSetUseCaseInput { Id = draft.Id });

        var error = (await act.Should().ThrowAsync<BadRequestException>()).Which;
        error.Message.Should().Contain("INTERNAL_EXCEL");
        error.Errors.Should().ContainSingle(e => e.Code == ActivatePositionRequirementSetUseCase.CompetencyNotInFramework);
    }

    private static JobPosition AddPosition(AppDbContext context, Guid orgId)
    {
        var position = new JobPosition
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Code = "ACCOUNTANT",
            Name = "Kế toán",
            Status = Statuses.MasterData.Active
        };
        context.JobPositions.Add(position);
        return position;
    }

    private static PositionRequirementSet NewSet(Guid positionId, int versionNo, string status) => new()
    {
        Id = Guid.NewGuid(),
        JobPositionId = positionId,
        VersionNo = versionNo,
        Status = status,
        CreatedByUserId = Guid.NewGuid()
    };

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

    [Fact]
    public async Task GetCompetenciesAndRequirements_ExposeCircular02CodeAndDomainOrder()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var competencies = await Tt02TestData.SeedMappedCompetenciesAsync(context, orgId);
        var category = await context.CompetencyCategories.SingleAsync(c => c.Id == competencies[0].CategoryId);
        category.SortOrder = 4;
        var position = AddPosition(context, orgId);
        var set = NewSet(position.Id, 1, Statuses.PositionRequirementSet.Draft);
        set.Items = Tt02TestData.Items(set.Id, competencies).ToList();
        context.GetDbSet<PositionRequirementSet>().Add(set);
        await context.SaveChangesAsync();
        var user = CreateCurrentUserMock(orgId).Object;

        var list = await new GetCompetenciesUseCase(context, user).ExecuteAsync(new GetCompetenciesUseCaseInput { PageSize = 50 });
        var requirements = await new GetPositionRequirementsUseCase(context, user)
            .ExecuteAsync(new GetPositionRequirementsUseCaseInput { PositionId = position.Id });

        list.Items.Single(i => i.Code == "TT02-4.2").FrameworkCode.Should().Be("4.2");
        list.Items.Should().OnlyContain(i => i.CategorySortOrder == 4);
        var item = requirements.Items.Single(i => i.CompetencyCode == "TT02-6.3");
        item.FrameworkCode.Should().Be("6.3");
        item.CategorySortOrder.Should().Be(4);
    }

    [Fact]
    public async Task GetPositionRequirements_ListsEveryVersion_SoADraftNextToTheActiveSetCanBeOpened()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var position = AddPosition(context, orgId);
        var otherPosition = AddPosition(context, orgId);
        context.GetDbSet<PositionRequirementSet>().AddRange(
            NewSet(position.Id, 1, Statuses.PositionRequirementSet.Archived),
            NewSet(position.Id, 2, Statuses.PositionRequirementSet.Active),
            NewSet(position.Id, 3, Statuses.PositionRequirementSet.Draft),
            NewSet(otherPosition.Id, 1, Statuses.PositionRequirementSet.Draft));
        await context.SaveChangesAsync();
        var useCase = new GetPositionRequirementsUseCase(context, CreateCurrentUserMock(orgId).Object);

        var current = await useCase.ExecuteAsync(new GetPositionRequirementsUseCaseInput { PositionId = position.Id });
        var draft = await useCase.ExecuteAsync(new GetPositionRequirementsUseCaseInput { PositionId = position.Id, VersionNo = 3 });

        current.VersionNo.Should().Be(2, "the active set stays the default view");
        current.Versions.Select(v => (v.VersionNo, v.Status)).Should().Equal(
            (3, Statuses.PositionRequirementSet.Draft),
            (2, Statuses.PositionRequirementSet.Active),
            (1, Statuses.PositionRequirementSet.Archived));
        draft.Status.Should().Be(Statuses.PositionRequirementSet.Draft);
        draft.Versions.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetPositionRequirements_HasNoVersions_WhenThePositionHasNoSetYet()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var position = AddPosition(context, orgId);
        await context.SaveChangesAsync();

        var output = await new GetPositionRequirementsUseCase(context, CreateCurrentUserMock(orgId).Object)
            .ExecuteAsync(new GetPositionRequirementsUseCaseInput { PositionId = position.Id });

        output.Id.Should().BeNull();
        output.Versions.Should().BeEmpty();
    }
}
