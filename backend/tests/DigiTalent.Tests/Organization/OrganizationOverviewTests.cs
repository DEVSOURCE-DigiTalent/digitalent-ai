using DigiTalent.Application.UseCases.OrganizationOverview;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Organization;

/// <summary>
/// Chạy trên PostgreSQL thật: kiểm tra schema mới (subscription, training_batches, entity_label) và truy vấn tổng quan.
/// </summary>
[Collection("PostgresIntegration")]
public class OrganizationOverviewTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static Task<GetOrganizationOverviewUseCaseOutput> RunAsync(SkillGapTestWorld world) =>
        new GetOrganizationOverviewUseCase(world.Context, world.HrManager())
            .ExecuteAsync(new GetOrganizationOverviewUseCaseInput());

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_WithoutSubscriptionOrActivity_ReturnsDefaultsAndSetupProgress()
    {
        var world = await CreateWorldAsync();

        var result = await RunAsync(world);

        result.Name.Should().Be("Skill Gap Test Org");
        result.Plan.Should().BeNull();
        result.Seats.Limit.Should().BeNull();
        result.Seats.Used.Should().Be(1); // user "HR" của world
        result.Members.Active.Should().Be(4);
        result.Members.Pending.Should().Be(0); // nhân viên không có tài khoản không bị tính là chờ kích hoạt
        result.Members.Inactive.Should().Be(1);
        result.RunningBatches.Should().Be(0);
        result.PendingReviews.Should().Be(0);
        result.SetupCompleted.Should().BeFalse();
        result.RecentActivity.Should().BeEmpty();
        result.Setup.Select(s => (s.Key, s.Done)).Should().Equal(
            ("departments", true),
            ("positions", true),
            ("requirements", false), // chỉ Data Analyst có bộ yêu cầu ACTIVE
            ("members", true));
        result.Setup.Single(s => s.Key == "requirements").Detail.Should().Be("1/2 vị trí đã có yêu cầu đang áp dụng");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_ReturnsPlanSeatsBatchesPendingMembersAndReviews()
    {
        var world = await CreateWorldAsync();
        var context = world.Context;
        var organizationId = world.Organization.Id;
        var suffix = Guid.NewGuid().ToString("N")[..8];

        var invited = new User { OrganizationId = organizationId, Email = $"invited_{suffix}@test.local", PasswordHash = "x", DisplayName = "Invited" };
        var loggedIn = new User { OrganizationId = organizationId, Email = $"login_{suffix}@test.local", PasswordHash = "x", DisplayName = "Logged in", LastLoginAt = DateTimeOffset.UtcNow };
        var disabled = new User { OrganizationId = organizationId, Email = $"off_{suffix}@test.local", PasswordHash = "x", DisplayName = "Disabled", Status = Statuses.User.Inactive };
        context.Users.AddRange(invited, loggedIn, disabled);
        world.Unassigned.UserId = invited.Id;
        world.Analyst.UserId = loggedIn.Id;

        context.OrganizationSubscriptions.Add(new OrganizationSubscription
        {
            OrganizationId = organizationId,
            PlanCode = "BUSINESS",
            PlanName = "Gói Doanh nghiệp",
            Status = Statuses.Subscription.Active,
            SeatLimit = 10,
            RenewsAt = new DateTimeOffset(2027, 1, 1, 0, 0, 0, TimeSpan.Zero),
        });
        context.TrainingBatches.AddRange(
            NewBatch(organizationId, invited, "Running", Statuses.TrainingBatch.Running),
            NewBatch(organizationId, invited, "Done", Statuses.TrainingBatch.Completed));

        var assignment = new TaskAssignment
        {
            EmployeeId = world.Analyst.Id,
            AssignedByUserId = invited.Id,
            ReviewerUserId = invited.Id,
            AssignedAt = DateTimeOffset.UtcNow,
            Status = "SUBMITTED",
            TitleSnapshot = "Report",
            DescriptionSnapshot = "Write a report",
            ExpectedOutputSnapshot = "A report",
        };
        context.TaskAssignments.Add(assignment);
        context.TaskSubmissions.AddRange(
            new TaskSubmission { TaskAssignmentId = assignment.Id, VersionNo = 1, SubmittedAt = DateTimeOffset.UtcNow, Status = Statuses.TaskSubmission.Superseded },
            new TaskSubmission { TaskAssignmentId = assignment.Id, VersionNo = 2, SubmittedAt = DateTimeOffset.UtcNow, Status = Statuses.TaskSubmission.Submitted });
        await context.SaveChangesAsync();

        var result = await RunAsync(world);

        result.Plan.Should().NotBeNull();
        result.Plan!.Name.Should().Be("Gói Doanh nghiệp");
        result.Plan.Status.Should().Be(Statuses.Subscription.Active);
        result.Seats.Limit.Should().Be(10);
        result.Seats.Used.Should().Be(3); // "HR" + invited + loggedIn; tài khoản INACTIVE không tính
        result.Members.Pending.Should().Be(1); // chỉ Unassigned: có tài khoản chưa đăng nhập
        result.Members.Active.Should().Be(3);
        result.RunningBatches.Should().Be(1);
        result.PendingReviews.Should().Be(1); // bản nộp SUPERSEDED không tính
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_ReturnsFiveNewestActivitiesOfOwnOrganizationOnly()
    {
        var world = await CreateWorldAsync();
        var context = world.Context;
        var actor = new User { OrganizationId = world.Organization.Id, Email = $"actor_{Guid.NewGuid():N}@test.local", PasswordHash = "x", DisplayName = "Actor" };
        context.Users.Add(actor);
        await context.SaveChangesAsync();

        // CreatedAt do SaveChangesAsync gán → lưu từng dòng cách nhau để thứ tự thời gian xác định
        for (var i = 0; i < 6; i++)
        {
            context.AuditLogs.Add(new AuditLog
            {
                OrganizationId = world.Organization.Id,
                ActorUserId = i == 0 ? null : actor.Id,
                Action = $"ACTION_{i}",
                EntityType = "departments",
                EntityLabel = i == 5 ? null : $"Label {i}",
            });
            await context.SaveChangesAsync();
            await Task.Delay(15);
        }

        context.AuditLogs.Add(new AuditLog { OrganizationId = null, Action = "OTHER_ORG", EntityType = "x" });
        await context.SaveChangesAsync();

        var result = await RunAsync(world);

        result.RecentActivity.Select(a => a.Action).Should().Equal("ACTION_5", "ACTION_4", "ACTION_3", "ACTION_2", "ACTION_1");
        result.RecentActivity[0].TargetLabel.Should().Be("departments"); // không có label → dùng entity_type
        result.RecentActivity[1].TargetLabel.Should().Be("Label 4");
        result.RecentActivity[1].ActorName.Should().Be("Actor");
    }

    private static TrainingBatch NewBatch(Guid organizationId, User creator, string name, string status) => new()
    {
        OrganizationId = organizationId,
        Name = name,
        Status = status,
        CreatedByUserId = creator.Id,
    };
}
