using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>EM-04 Dòng thời gian minh chứng, EM-05 Lộ trình học tập, EM-18 Thành tựu — trên dữ liệu demo thật.</summary>
public class MyGrowthJourneyTests
{
    [Fact]
    public async Task EvidenceTimeline_ShowsOwnSubmissionsNewestFirst_WithMatchingCounts()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var employee = await world.EmployeeAsync(DemoSeedWorld.EmployeeEmail);
        var ownAssignments = await world.Context.TaskAssignments.Where(t => t.EmployeeId == employee.Id).Select(t => t.Id).ToListAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var timeline = await me.Evidence.ExecuteAsync(new GetMyEvidenceTimelineUseCaseInput());

        timeline.Items.Select(i => i.OccurredAt).Should().BeInDescendingOrder();
        timeline.Counts.Total.Should().Be(timeline.Items.Count);
        timeline.Counts.NeedsRevision.Should().Be(timeline.Items.Count(i => i.Status == "NEEDS_REVISION")).And.BeGreaterThan(0);
        timeline.Counts.Approved.Should().Be(timeline.Items.Count(i => i.Status == "APPROVED"));
        timeline.Items.Where(i => i.Kind == "TASK_SUBMISSION")
            .Should().NotBeEmpty().And.OnlyContain(i => i.AssignmentId.HasValue && ownAssignments.Contains(i.AssignmentId.Value));
    }

    [Fact]
    public async Task EvidenceTimeline_NeverShowsAColleaguesSubmissions()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var employee = await world.EmployeeAsync(DemoSeedWorld.EmployeeEmail);
        var employeeAssignments = await world.Context.TaskAssignments.Where(t => t.EmployeeId == employee.Id).Select(t => t.Id).ToListAsync();
        var manager = await world.AsAsync(DemoSeedWorld.ManagerEmail);

        var timeline = await manager.Evidence.ExecuteAsync(new GetMyEvidenceTimelineUseCaseInput());

        timeline.Items.Should().NotContain(i => i.AssignmentId.HasValue && employeeAssignments.Contains(i.AssignmentId.Value));
    }

    [Fact]
    public async Task LearningPath_KeepsEnrolledCourses_AddsRecommendations_AndOrdersPrerequisitesFirst()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var path = await me.LearningPath.ExecuteAsync(new GetMyLearningPathUseCaseInput());

        path.Steps.Select(s => s.Order).Should().Equal(Enumerable.Range(1, path.Steps.Count));
        path.Steps.Where(s => s.Source != "RECOMMENDED").Select(s => s.CourseCode)
            .Should().BeEquivalentTo(new[] { "A2-F", "A4-I", "A1-I" });
        path.Steps.Where(s => s.Source == "RECOMMENDED").Should().NotBeEmpty()
            .And.OnlyContain(s => s.Status == "RECOMMENDED" && s.ProgressPercent == 0 && s.Rationale.Length > 0);
        var orderByCode = path.Steps.ToDictionary(s => s.CourseCode, s => s.Order);
        foreach (var step in path.Steps)
        {
            foreach (var prerequisite in step.Prerequisites.Where(p => orderByCode.ContainsKey(p.Code)))
            {
                orderByCode[prerequisite.Code].Should().BeLessThan(step.Order, $"{prerequisite.Code} is a prerequisite of {step.CourseCode}");
            }
        }
    }

    [Fact]
    public async Task LearningPath_SummaryMatchesTheSteps()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var path = await me.LearningPath.ExecuteAsync(new GetMyLearningPathUseCaseInput());

        path.Summary.TotalSteps.Should().Be(path.Steps.Count);
        path.Summary.CompletedSteps.Should().Be(path.Steps.Count(s => s.Status == Statuses.Enrollment.Completed)).And.Be(1);
        path.Summary.RecommendedSteps.Should().Be(path.Steps.Count(s => s.Source == "RECOMMENDED"));
        path.Summary.RemainingMinutes.Should().BeLessThan(path.Summary.TotalMinutes, "the completed course no longer counts");
        path.OpenGapCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Achievements_ShowTheIssuedCertificate_AndStatsFromOwnData()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var achievements = await me.Achievements.ExecuteAsync(new GetMyAchievementsUseCaseInput());

        var certificate = achievements.Certificates.Should().ContainSingle().Subject;
        certificate.CertificateCode.Should().StartWith("DT-");
        certificate.Status.Should().Be("VALID");
        certificate.HolderName.Should().NotBeNullOrEmpty();
        achievements.Stats.ValidCertificates.Should().Be(1);
        achievements.Stats.CompletedCourses.Should().Be(1);
        achievements.Stats.PassedAssessments.Should().BeGreaterThanOrEqualTo(1);
        achievements.Stats.ConfirmedCompetencies.Should().Be(achievements.ConfirmedCompetencies.Count);
        achievements.Milestones.Select(m => m.OccurredAt).Should().BeInDescendingOrder();
        achievements.Milestones.Should().Contain(m => m.Kind == "CERTIFICATE_ISSUED");
    }

    [Fact]
    public async Task Achievements_DoNotTurnInitialDataImportIntoMilestones()
    {
        using var world = await DemoSeedWorld.CreateAsync();
        var employee = await world.EmployeeAsync(DemoSeedWorld.EmployeeEmail);
        var migratedCompetencies = await world.Context.CompetencyEvidences
            .Where(e => e.EmployeeId == employee.Id && e.SourceType == Statuses.EvidenceSourceType.Migration)
            .Select(e => e.CompetencyId)
            .Distinct()
            .CountAsync();
        var me = await world.AsAsync(DemoSeedWorld.EmployeeEmail);

        var achievements = await me.Achievements.ExecuteAsync(new GetMyAchievementsUseCaseInput());

        migratedCompetencies.Should().BeGreaterThan(0, "the demo profile is imported at Basic level");
        achievements.Milestones.Should().NotContain(m => m.Kind == "COMPETENCY_CONFIRMED",
            "levels imported as initial data are not achievements");
    }
}
