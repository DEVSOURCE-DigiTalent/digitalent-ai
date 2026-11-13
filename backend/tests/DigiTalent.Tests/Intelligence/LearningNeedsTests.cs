using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

public class LearningNeedsTests
{
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
        db.JobPositions.Add(new JobPosition { Id = position, OrganizationId = org, Code = "HR", Name = "HR" });
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
            ReviewedAt = automatic ? null : reviewedAt, ChoiceTotal = automatic ? (short)1 : (short)0,
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
            result.BasicTotal = 1;
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
    }
}
