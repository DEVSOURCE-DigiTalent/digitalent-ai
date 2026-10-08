using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>EM-01 Bảng phát triển, EM-02 Hồ sơ năng lực, EM-03 Khoảng trống năng lực — trên dữ liệu demo thật của employee@.</summary>
public class MyCompetencyOverviewTests
{
    [Fact]
    public async Task Dashboard_SummarizesOwnCoursesTasksAndCertificates()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var dashboard = await me.Dashboard.ExecuteAsync(new GetMyDashboardUseCaseInput());

        dashboard.Employee.JobPositionName.Should().NotBeNullOrEmpty();
        dashboard.Courses.Should().BeEquivalentTo(new { Total = 3, Completed = 1, InProgress = 1, NotStarted = 1 },
            options => options.ExcludingMissingMembers());
        dashboard.ContinueLearning!.CourseCode.Should().Be("A4-I");
        dashboard.ContinueLearning.CompletedLessons.Should().BeLessThan(dashboard.ContinueLearning.TotalLessons);
        dashboard.ContinueLearning.NextLessonId.Should().NotBeNull();
        dashboard.Tasks.Should().BeEquivalentTo(new { Total = 3, ToDo = 2, NeedsRevision = 1, Passed = 1 },
            options => options.ExcludingMissingMembers());
        dashboard.ActiveTasks.Should().OnlyContain(t => t.CanSubmit || t.Status == Statuses.TaskAssignment.Submitted);
        dashboard.ValidCertificates.Should().Be(1);
    }

    [Fact]
    public async Task Dashboard_ShowsTheBiggestGapsFirst_AndDeadlinesInDateOrder()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var dashboard = await me.Dashboard.ExecuteAsync(new GetMyDashboardUseCaseInput());

        var summary = dashboard.Competency.Summary!;
        (summary.TotalMet + summary.TotalGap).Should().Be(summary.TotalRequired);
        dashboard.Competency.TopGaps.Should().NotBeEmpty().And.HaveCountLessThanOrEqualTo(5);
        dashboard.Competency.TopGaps.Should().OnlyContain(g => g.GapSteps > 0);
        dashboard.Competency.TopGaps.Select(g => g.PriorityScore).Should().BeInDescendingOrder();
        dashboard.UpcomingDeadlines.Select(d => d.DueAt).Should().BeInAscendingOrder();
    }

    [Fact]
    public async Task CompetencyProfile_ListsEveryRequiredCompetencyAtTheConfirmedLevel()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var profile = await me.Profile.ExecuteAsync(new GetMyCompetencyProfileUseCaseInput());

        profile.SkipReason.Should().BeNull();
        profile.RequirementSet.Should().NotBeNull();
        profile.Items.Should().HaveCount(profile.Summary!.TotalRequired);
        profile.Items.Should().OnlyContain(i => i.CurrentLevel == 1, "the demo accountant is confirmed Basic everywhere");
        profile.Items.Should().OnlyContain(i => i.Status == (i.GapSteps == 0 ? "MET" : "GAP"));
        profile.Items.Should().OnlyContain(i => i.GapSteps == Math.Max(0, i.RequiredLevel - 1));
    }

    [Fact]
    public async Task SkillGap_SuggestsCoursesAboveTheCurrentLevel_NextLevelFirst()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var gap = await me.SkillGap.ExecuteAsync(new GetMySkillGapUseCaseInput());

        gap.JobPositionName.Should().NotBeNullOrEmpty();
        gap.Items.Where(i => i.GapSteps == 0).Should().OnlyContain(i => i.SuggestedCourses.Count == 0);
        var gaps = gap.Items.Where(i => i.GapSteps > 0).ToList();
        gaps.Should().NotBeEmpty();
        gaps.Should().OnlyContain(i => i.SuggestedCourses.All(c => c.TargetLevel > (i.CurrentLevel ?? 0)));
        gaps.Where(i => i.SuggestedCourses.Count > 0)
            .Should().OnlyContain(i => i.SuggestedCourses[0].TargetLevel == (i.CurrentLevel ?? 0) + 1, "the course to the next level comes first");
        gaps.SelectMany(i => i.SuggestedCourses).Should().Contain(c => c.Code == "A4-I" && c.EnrollmentStatus == Statuses.Enrollment.InProgress);
    }

    [Fact]
    public async Task EmployeeWithoutJobPosition_GetsASkipReasonInsteadOfAGap()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var employee = await world.EmployeeAsync(DemoSeedWorld.EmployeeEmail);
        employee.JobPositionId = null;
        await world.Context.SaveChangesAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var gap = await me.SkillGap.ExecuteAsync(new GetMySkillGapUseCaseInput());
        var dashboard = await me.Dashboard.ExecuteAsync(new GetMyDashboardUseCaseInput());

        gap.SkipReason.Should().Be("NO_JOB_POSITION");
        gap.Items.Should().BeEmpty();
        dashboard.Competency.SkipReason.Should().Be("NO_JOB_POSITION");
        dashboard.Courses.Total.Should().Be(3, "courses and tasks still show without a position");
    }

    [Fact]
    public async Task AccountWithoutEmployeeProfile_IsForbidden()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var admin = await world.AsAsync(DemoSeedWorld.AdminEmail);

        var dashboard = () => admin.Dashboard.ExecuteAsync(new GetMyDashboardUseCaseInput());
        var profile = () => admin.Profile.ExecuteAsync(new GetMyCompetencyProfileUseCaseInput());

        await dashboard.Should().ThrowAsync<ForbiddenException>();
        await profile.Should().ThrowAsync<ForbiddenException>();
    }
}
