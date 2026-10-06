using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.Dashboard;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Runs against PostgreSQL: covers group-by averages, the latest-run subquery and the recommendation_decisions table.
/// </summary>
[Collection("PostgresIntegration")]
public class CapabilityDashboardTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static Task<GetCapabilityDashboardUseCaseOutput> DashboardAsync(SkillGapTestWorld world, ICurrentUser user) =>
        new GetCapabilityDashboardUseCase(
                world.Context,
                user,
                world.Scope(user),
                world.Reader(),
                new RecommendationWeightsProvider(world.Context, NullLogger<RecommendationWeightsProvider>.Instance),
                new EmployeeRecommendationService(world.Context))
            .ExecuteAsync(new GetCapabilityDashboardUseCaseInput());

    private static Task CalculateAllAsync(SkillGapTestWorld world)
    {
        var hr = world.HrManager();
        return new CalculateSkillGapBatchUseCase(world.Context, hr, world.Scope(hr), world.RunService())
            .ExecuteAsync(new CalculateSkillGapBatchUseCaseInput());
    }

    private static async Task<User> AddUserAsync(SkillGapTestWorld world)
    {
        var user = new User
        {
            OrganizationId = world.Organization.Id,
            Email = $"cap_{Guid.NewGuid():N}@test.local",
            PasswordHash = "x",
            DisplayName = "Capability HR",
        };
        world.Context.Users.Add(user);
        await world.Context.SaveChangesAsync();
        return user;
    }

    private static async Task<Course> AddCourseAsync(SkillGapTestWorld world, User author, string code, string competency, short target)
    {
        var course = new Course
        {
            OrganizationId = world.Organization.Id,
            Code = code,
            VersionNo = 1,
            Title = $"Course {code}",
            Status = Statuses.Course.Published,
            CreatedByUserId = author.Id,
            RowVersion = 1,
        };
        world.Context.Courses.Add(course);
        world.Context.CourseCompetencies.Add(new CourseCompetency
        {
            CourseId = course.Id,
            CompetencyId = world.Competencies[competency].Id,
            TargetLevel = target,
            CoverageType = Statuses.CourseCoverageType.Primary,
        });
        await world.Context.SaveChangesAsync();
        return course;
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_WhenNothingCalculated_ReturnsZeroKpisAndEveryDomainAxis()
    {
        var world = await CreateWorldAsync();

        var result = await DashboardAsync(world, world.HrManager());

        result.Kpis.Employees.Should().Be(0);
        result.Kpis.AverageCoverage.Should().Be(0m);
        result.Kpis.PendingRecommendations.Should().Be(0);
        result.AtRisk.Should().BeEmpty();
        var domain = result.Domains.Should().ContainSingle().Subject; // categories without data still get a radar axis
        domain.Name.Should().Be("Digital core");
        domain.AverageRequired.Should().Be(0m);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_AfterBatchCalculation_AggregatesLatestRunsAndCapsCurrentLevel()
    {
        var world = await CreateWorldAsync();
        await CalculateAllAsync(world);
        await CalculateAllAsync(world); // the second run must not be counted twice

        var result = await DashboardAsync(world, world.HrManager());

        result.Kpis.Employees.Should().Be(2); // analyst + analystB: the only ones with a position and an ACTIVE requirement set
        result.Kpis.EmployeesWithHigh.Should().BeGreaterThan(0);
        result.AtRisk.Select(a => a.EmployeeId).Should().Contain(world.AnalystInDepartmentB.Id);
        result.AtRisk.Should().BeInDescendingOrder(a => a.HighCount);

        var domain = result.Domains.Should().ContainSingle().Subject;
        domain.AverageRequired.Should().Be(2.0m); // (3+2+2+2+1)/5
        // analyst: 1+2+0+1+min(3,1) = 5, analystB: 0, so 5/10; without the cap it would be 0.7
        domain.AverageCurrent.Should().Be(0.5m);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_CountsOverdueAndCompletionRateForAnalyzedEmployeesInScope()
    {
        var world = await CreateWorldAsync();
        await CalculateAllAsync(world);
        var author = await AddUserAsync(world);
        var course = await AddCourseAsync(world, author, "LRN", "DATA_LITERACY", 2);

        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        CourseAssignment Assign(Employee employee) => new()
        {
            CourseId = course.Id,
            EmployeeId = employee.Id,
            AssignmentSource = "MANUAL",
            AssignedByUserId = author.Id,
            AssignedAt = DateTimeOffset.UtcNow.AddDays(-10),
            DueDate = yesterday,
            Status = Statuses.CourseAssignment.Active,
        };
        var overdue = Assign(world.Analyst);
        var done = Assign(world.AnalystInDepartmentB);
        world.Context.CourseAssignments.AddRange(overdue, done);
        world.Context.Enrollments.Add(new Enrollment
        {
            CourseAssignmentId = done.Id,
            EmployeeId = world.AnalystInDepartmentB.Id,
            CourseId = course.Id,
            Status = Statuses.Enrollment.Completed,
            ProgressPercent = 100m,
        });
        await world.Context.SaveChangesAsync();

        var all = await DashboardAsync(world, world.HrManager());
        // EmployeeScope limited to department B (the endpoint itself is gated to HR and Admin)
        var departmentB = await DashboardAsync(world, world.ManagerOf(world.DepartmentB));

        all.Kpis.OverdueAssignments.Should().Be(1); // an assignment with a COMPLETED enrollment is not overdue
        all.Kpis.CompletionRate.Should().Be(50m);
        departmentB.Kpis.Employees.Should().Be(1);
        departmentB.Kpis.OverdueAssignments.Should().Be(0);
        departmentB.Kpis.CompletionRate.Should().Be(100m);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_PendingRecommendations_ExcludeDecidedAndEnrolledCoursesAndIncludeReopened()
    {
        var world = await CreateWorldAsync();
        var author = await AddUserAsync(world);
        var security = await AddCourseAsync(world, author, "SEC", "INFORMATION_SECURITY", 2);
        await AddCourseAsync(world, author, "DATA", "DATA_LITERACY", 2);
        await CalculateAllAsync(world);
        var hr = world.HrManager();

        var baseline = (await DashboardAsync(world, hr)).Kpis.PendingRecommendations;
        baseline.Should().Be(4); // 2 recommended courses x 2 analyzed employees

        var decision = new RecommendationDecision
        {
            EmployeeId = world.Analyst.Id,
            CourseId = security.Id,
            Status = Statuses.RecommendationDecision.Dismissed,
            Reason = "Đã học bên ngoài",
            DecidedByUserId = author.Id,
            DecidedAt = DateTimeOffset.UtcNow,
        };
        world.Context.RecommendationDecisions.Add(decision);
        await world.Context.SaveChangesAsync();
        (await DashboardAsync(world, hr)).Kpis.PendingRecommendations.Should().Be(baseline - 1);

        decision.Status = Statuses.RecommendationDecision.Reopened;
        await world.Context.SaveChangesAsync();
        (await DashboardAsync(world, hr)).Kpis.PendingRecommendations.Should().Be(baseline);

        world.Context.Enrollments.Add(new Enrollment
        {
            EmployeeId = world.AnalystInDepartmentB.Id,
            CourseId = security.Id,
            Status = Statuses.Enrollment.InProgress,
        });
        await world.Context.SaveChangesAsync();
        (await DashboardAsync(world, hr)).Kpis.PendingRecommendations.Should().Be(baseline - 1);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task RecommendationDecision_RejectsSecondRowForSameEmployeeAndCourse()
    {
        var world = await CreateWorldAsync();
        var author = await AddUserAsync(world);
        var course = await AddCourseAsync(world, author, "DUP", "AI_LITERACY", 2);

        RecommendationDecision NewDecision(string status) => new()
        {
            EmployeeId = world.Analyst.Id,
            CourseId = course.Id,
            Status = status,
            DecidedByUserId = author.Id,
            DecidedAt = DateTimeOffset.UtcNow,
        };
        world.Context.RecommendationDecisions.Add(NewDecision(Statuses.RecommendationDecision.Accepted));
        await world.Context.SaveChangesAsync();

        world.Context.RecommendationDecisions.Add(NewDecision(Statuses.RecommendationDecision.Dismissed));
        var act = () => world.Context.SaveChangesAsync();

        await act.Should().ThrowAsync<DbUpdateException>();
    }
}
