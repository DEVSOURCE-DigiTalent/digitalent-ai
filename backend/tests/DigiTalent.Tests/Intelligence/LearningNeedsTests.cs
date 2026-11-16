using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using Microsoft.Extensions.Logging.Abstractions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Organization.Employees;
using DigiTalent.Application.UseCases.Organization.Workforce;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

public class LearningNeedsTests
{
    [Fact]
    public async Task SystemBaselineFollowsAdminWithoutAPositionStandardAndCustomStandardTakesPriority()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var org = Guid.NewGuid();
        var department = new Department { OrganizationId = org, Code = "HR", Name = "Nhân sự" };
        var position = new JobPosition { OrganizationId = org, DepartmentId = department.Id, Code = "HR", Name = "HR" };
        var employee = new Employee { OrganizationId = org, DepartmentId = department.Id, FullName = "Nhân viên", Status = "ACTIVE" };
        var domain = new CompetencyCategory { OrganizationId = org, Code = "TT02_D1", Name = "Dữ liệu", SortOrder = 1 };
        var competency = new DigiTalent.Domain.Entities.Competency { CategoryId = domain.Id, Code = "TT02-1.1", Name = "Tìm kiếm" };
        var assessment = new TrialAssessment { EmployeeId = employee.Id, OrganizationId = org, SubmittedAt = DateTimeOffset.UtcNow, ChoiceScore = 1, ChoiceTotal = 2 };
        db.AddRange(department, position, employee, domain, competency, assessment,
            new TrialAssessmentDomain { TrialAssessmentId = assessment.Id, CategoryId = domain.Id, BasicCorrect = 1, BasicTotal = 2 });
        await db.SaveChangesAsync();

        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(org);
        user.SetupGet(u => u.IsAdmin).Returns(true);
        var matrixService = new ReferencePositionMatrixService(db, user.Object, Mock.Of<IAuditService>());
        var useCase = new GetLearningNeedsUseCase(db, user.Object, new EmployeeScope(db, user.Object));
        var input = new GetSkillGapRunsUseCaseInput { EmployeeId = employee.Id };
        async Task<LearningNeedDomain> Result() => (await useCase.ExecuteAsync(input)).Items.Single().Domains.Single();

        (await Result()).RequiredLevel.Should().Be(2);
        var matrix = await matrixService.GetAsync();
        matrix.Levels["HR"][0] = 3;
        await matrixService.SaveAsync(matrix);
        var reference = await Result();
        reference.RequiredLevel.Should().Be(3);
        reference.CurrentLevel.Should().Be(1);
        reference.State.Should().Be("NEEDS_LEARNING");

        var custom = new PositionRequirementSet { JobPositionId = position.Id, VersionNo = 1, Status = "ACTIVE" };
        db.AddRange(custom, new PositionRequirementItem
        {
            RequirementSetId = custom.Id, CompetencyId = competency.Id, RequiredLevel = 1, WeightPercent = 100,
        });
        await db.SaveChangesAsync();
        matrix = await matrixService.GetAsync();
        matrix.Levels["HR"][0] = 2;
        await matrixService.SaveAsync(matrix);
        (await Result()).RequiredLevel.Should().Be(1);
        (await Result()).State.Should().Be("MET");
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ComparesAvailableAssessmentWithLiveStandardAndOnlyLaterEvidenceResolvesNeeds(bool automatic)
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var org = Guid.NewGuid(); var department = Guid.NewGuid(); var position = Guid.NewGuid(); var category = Guid.NewGuid(); var competency = Guid.NewGuid(); var employee = Guid.NewGuid(); var standard = Guid.NewGuid(); var assessment = Guid.NewGuid();
        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(org);
        user.SetupGet(u => u.IsAdmin).Returns(true);
        db.Departments.Add(new Department { Id = department, OrganizationId = org, Code = "HR", Name = "HR" });
        db.JobPositions.Add(new JobPosition { Id = position, OrganizationId = org, DepartmentId = department, Code = "HR", Name = "HR" });
        db.Employees.Add(new Employee { Id = employee, OrganizationId = org, DepartmentId = department, JobPositionId = position, FullName = "Nhân viên", EmployeeCode = "NV01", Status = "ACTIVE" });
        db.CompetencyCategories.Add(new CompetencyCategory { Id = category, OrganizationId = org, Name = "Dữ liệu", Code = "D1", SortOrder = 1 });
        db.Competencies.Add(new DigiTalent.Domain.Entities.Competency { Id = competency, CategoryId = category, Name = "Tìm kiếm dữ liệu", Code = "1.1" });
        db.PositionRequirementSets.Add(new PositionRequirementSet { Id = standard, JobPositionId = position, VersionNo = 1, Status = "ACTIVE" });
        var requirement = new PositionRequirementItem { RequirementSetId = standard, CompetencyId = competency, RequiredLevel = 3, WeightPercent = 100 };
        db.PositionRequirementItems.Add(requirement);
        var course = new Course { Id = Guid.NewGuid(), OrganizationId = org, Code = "A1-A", Title = "Phân tích dữ liệu nâng cao", Status = "PUBLISHED", VersionNo = 1 };
        db.Courses.Add(course);
        db.CourseCompetencies.Add(new CourseCompetency { CourseId = course.Id, CompetencyId = competency, TargetLevel = 3 });
        var reviewedAt = DateTimeOffset.UtcNow.AddDays(-2);
        var workspace = new TrialWorkspace { OrganizationId = org };
        db.TrialWorkspaces.Add(workspace);
        var stored = new TrialAssessment
        {
            Id = assessment, OrganizationId = org, EmployeeId = employee, SubmittedAt = reviewedAt,
            ReviewedAt = automatic ? null : reviewedAt, ChoiceTotal = automatic ? (short)2 : (short)0,
        };
        var result = new TrialAssessmentDomain { TrialAssessmentId = assessment, CategoryId = category, SuggestedLevel = 1, MentorLevel = automatic ? null : (short)1 };
        db.TrialAssessments.Add(stored);
        db.TrialAssessmentDomains.Add(result);
        await db.SaveChangesAsync();
        var useCase = new GetLearningNeedsUseCase(db, user.Object, new EmployeeScope(db, user.Object));
        var input = new GetSkillGapRunsUseCaseInput { EmployeeId = employee };
        var waiting = (await useCase.ExecuteAsync(input)).Items.Single();
        waiting.State.Should().Be("WAITING_ASSESSMENT");
        waiting.Domains.Single().CourseId.Should().BeNull();

        if (automatic)
        {
            stored.ChoiceScore = result.BasicCorrect = 1;
            result.BasicTotal = 2;
        }
        else
            workspace.ReportPublishedAt = reviewedAt.AddDays(1);
        await db.SaveChangesAsync();
        var need = (await useCase.ExecuteAsync(input)).Items.Single().Domains.Single();
        need.CurrentLevel.Should().Be(1);
        need.RequiredLevel.Should().Be(3);
        need.CourseId.Should().Be(course.Id);
        need.MissingCompetencies.Should().ContainSingle().Which.Should().Be("Tìm kiếm dữ liệu");
        need.AssessmentLevel.Should().Be(1);
        need.AssessmentReviewedAt.Should().Be(reviewedAt);
        need.Competencies.Single().CurrentLevel.Should().Be(1);
        need.Competencies.Single().RequiredLevel.Should().Be(3);

        requirement.RequiredLevel = 1;
        await db.SaveChangesAsync();
        (await useCase.ExecuteAsync(input)).Items.Single().State.Should().Be("MET");
        requirement.RequiredLevel = 3;
        var profile = new EmployeeCompetencyProfile { EmployeeId = employee, CompetencyId = competency, ConfirmedLevel = 3, ConfirmedAt = reviewedAt.AddDays(-1) };
        db.EmployeeCompetencyProfiles.Add(profile);
        await db.SaveChangesAsync();
        (await useCase.ExecuteAsync(input)).Items.Single().State.Should().Be("NEEDS_LEARNING");
        profile.ConfirmedAt = reviewedAt.AddDays(1);
        await db.SaveChangesAsync();
        var resolved = (await useCase.ExecuteAsync(input)).Items.Single();
        resolved.State.Should().Be("MET");
        resolved.Domains.Single().CourseId.Should().BeNull();
        resolved.Domains.Single().AssessmentLevel.Should().Be(1);
        resolved.Domains.Single().Competencies.Single().Source.Should().Be("EVIDENCE");

        // A page of one employee must still carry the company-wide aggregate.
        var second = new Employee { Id = Guid.NewGuid(), OrganizationId = org, DepartmentId = department, JobPositionId = position, FullName = "Z Chờ đánh giá", EmployeeCode = "NV02", Status = "ACTIVE" };
        db.Employees.Add(second);
        await db.SaveChangesAsync();
        var company = await useCase.ExecuteAsync(new GetSkillGapRunsUseCaseInput { PageIndex = 1, PageSize = 1 });
        company.Items.Should().HaveCount(1);
        company.Overview.Employees.Should().Be(2);
        company.Overview.AssessedEmployees.Should().Be(1);
        company.Overview.Domains.Single().Met.Should().Be(1);
        company.Overview.Domains.Single().Assessed.Should().Be(1);
        company.Overview.Domains.Single().Waiting.Should().Be(1);

        // Old profiles may point at a different department's position and standard.
        var executiveDepartment = new Department { OrganizationId = org, Code = "EXEC", Name = "Ban Giám đốc" };
        var executive = new JobPosition { OrganizationId = org, DepartmentId = executiveDepartment.Id, Code = "CEO", Name = "CEO" };
        var executiveStandard = new PositionRequirementSet { JobPositionId = executive.Id, VersionNo = 1, Status = "ACTIVE" };
        db.Departments.Add(executiveDepartment);
        db.JobPositions.Add(executive);
        db.PositionRequirementSets.Add(executiveStandard);
        db.PositionRequirementItems.Add(new PositionRequirementItem
        {
            RequirementSetId = executiveStandard.Id, CompetencyId = competency, RequiredLevel = 2, WeightPercent = 100,
        });
        var profileEmployee = await db.Employees.FindAsync(employee);
        profileEmployee!.JobPositionId = executive.Id;
        second.JobPositionId = null;
        await db.SaveChangesAsync();

        var local = await useCase.ExecuteAsync(new GetSkillGapRunsUseCaseInput
        {
            DepartmentId = department, JobPositionId = position, PageSize = 10,
        });
        local.TotalItems.Should().Be(2);
        local.Items.Should().OnlyContain(row => row.PositionId == position);
        local.Items.Single(row => row.EmployeeId == employee).Domains.Single().RequiredLevel.Should().Be(3);
        (await useCase.ExecuteAsync(new GetSkillGapRunsUseCaseInput { DepartmentId = department, JobPositionId = executive.Id }))
            .TotalItems.Should().Be(0);

        var directory = new GetPagedEmployeesUseCase(db, new EmployeeScope(db, user.Object));
        var localEmployees = await directory.ExecuteAsync(new GetPagedEmployeesUseCaseInput { DepartmentId = department, PositionId = position });
        localEmployees.TotalItems.Should().Be(2);
        localEmployees.Items.Should().OnlyContain(row => row.JobPositionId == position);

        var workforce = new WorkforceReader(db, new LatestSkillGapRuns(db));
        var team = await workforce.LoadRowsAsync(db.Employees.Where(e => e.DepartmentId == department));
        team.Should().HaveCount(2).And.OnlyContain(row => row.JobPositionId == position && row.Blocker == null);

        var runService = new SkillGapRunService(db, new SkillGapSettingsProvider(db, NullLogger<SkillGapSettingsProvider>.Instance));
        var staged = await runService.StageRunsAsync(new[] { profileEmployee, second }, org, "USER_REQUEST");
        staged.Should().OnlyContain(result => result.Run != null && result.Run.RequirementSetId == standard);

        // Without a local position, do not use a foreign standard.
        var localPosition = await db.JobPositions.FindAsync(position);
        localPosition!.Status = "INACTIVE";
        await db.SaveChangesAsync();
        var noStandard = (await useCase.ExecuteAsync(input)).Items.Single();
        noStandard.State.Should().Be("NO_STANDARD");
        noStandard.PositionId.Should().BeNull();
        noStandard.Domains.Should().BeEmpty();
        (await runService.StageRunsAsync(new[] { profileEmployee }, org, "USER_REQUEST"))
            .Should().ContainSingle().Which.SkipReason.Should().Be(SkillGapSkipReasons.NoJobPosition);
        (await db.Employees.FindAsync(employee))!.JobPositionId.Should().Be(executive.Id);
    }
}
