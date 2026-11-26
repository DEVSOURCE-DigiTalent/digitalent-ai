using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using OrganizationEntity = DigiTalent.Domain.Entities.Organization;

namespace DigiTalent.Tests.Learning;

/// <summary>
/// A course version DigiTalent publishes without "apply to all" reaches an organization only when someone holding
/// course_update.review (OWNER, later R&amp;D) applies it; they can keep the version in use with a reason instead.
/// A trial organization that bought nothing gets the new content at once. Employees who started a course keep it.
/// </summary>
public class CourseUpdatesTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public Guid Company { get; } = Guid.NewGuid();
        public Guid TrialCompany { get; } = Guid.NewGuid();
        public Guid OwnerId { get; } = Guid.NewGuid();
        public Guid TrialOwnerId { get; } = Guid.NewGuid();
        private readonly HtmlContentSanitizer _sanitizer = new();
        private readonly IAuditService _audit = Mock.Of<IAuditService>();

        public async Task<int> PublishEditAsync(string code, string title, bool applyToAll = false)
        {
            var editor = new PlatformCatalogEditor(Context, _sanitizer, User(AdminId, null), TimeProvider.System);
            var draft = await new CreatePlatformCatalogDraftUseCase(Context, editor, _audit).ExecuteAsync(new CreatePlatformCatalogDraftUseCaseInput());
            var versionNo = draft.Version.VersionNo;
            var versionId = (await Context.PlatformCatalogVersions.SingleAsync(v => v.VersionNo == versionNo)).Id;
            var identity = await Context.PlatformCourses.SingleAsync(c => c.Code == code);
            var row = await Context.PlatformCatalogCourses.SingleAsync(c => c.VersionId == versionId && c.CourseId == identity.Id);
            row.Title = title;
            row.ChangeKind = PlatformCatalog.ChangeKind.Edited;
            await Context.SaveChangesAsync();
            Context.ChangeTracker.Clear();

            await new PublishPlatformCatalogVersionUseCase(Context, editor, new PlatformPublishChecker(Context, _sanitizer), _audit)
                .ExecuteAsync(new PublishPlatformCatalogVersionUseCaseInput { VersionNo = versionNo, ApplyToAllOrganizations = applyToAll });
            Context.ChangeTracker.Clear();
            return versionNo;
        }

        public Task<CourseUpdatesOutput> ReadAsync() =>
            new GetCourseUpdatesUseCase(Context, User(OwnerId, Company)).ExecuteAsync(new GetCourseUpdatesUseCaseInput());

        public async Task<CourseUpdatesOutput> ApplyAsync(int versionNo)
        {
            var output = await new ApplyCourseUpdateUseCase(Context, User(OwnerId, Company), TimeProvider.System, _audit)
                .ExecuteAsync(new ApplyCourseUpdateUseCaseInput { VersionNo = versionNo });
            Context.ChangeTracker.Clear();
            return output;
        }

        public async Task<CourseUpdatesOutput> KeepAsync(int versionNo, string reason)
        {
            var output = await new KeepCourseVersionUseCase(Context, User(OwnerId, Company), TimeProvider.System, _audit)
                .ExecuteAsync(new KeepCourseVersionUseCaseInput { VersionNo = versionNo, Reason = reason });
            Context.ChangeTracker.Clear();
            return output;
        }

        public Task<Course> LatestAsync(Guid organizationId, string code) =>
            Context.Courses.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && c.Code == code)
                .OrderByDescending(c => c.VersionNo)
                .FirstAsync();

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private static async Task<World> CreateWorldAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await PlatformCatalogSeeder.SeedAsync(context);
        var world = new World { Context = context };

        var owner = new Role { Code = Roles.Owner, Name = "Chủ doanh nghiệp" };
        var review = new Permission { Code = Permissions.Learning.ReviewCourseUpdate, Module = "course_update", Action = "review" };
        context.Roles.Add(owner);
        context.Permissions.Add(review);
        context.RolePermissions.Add(new RolePermission { RoleId = owner.Id, PermissionId = review.Id });

        foreach (var (organizationId, ownerId, name) in new[]
                 {
                     (world.Company, world.OwnerId, "Công ty Chính Thức"),
                     (world.TrialCompany, world.TrialOwnerId, "Công ty Dùng Thử"),
                 })
        {
            context.Organizations.Add(new OrganizationEntity { Id = organizationId, Code = name.Replace(" ", ""), Name = name });
            context.Users.Add(new User { Id = ownerId, OrganizationId = organizationId, Email = $"{ownerId:N}@example.com", DisplayName = $"Chủ {name}" });
            context.UserRoles.Add(new UserRole { UserId = ownerId, RoleId = owner.Id, AssignedAt = DateTimeOffset.UtcNow });
            foreach (var code in new[] { "M1-F", "M1-I" })
            {
                context.Courses.Add(new Course
                {
                    OrganizationId = organizationId, Code = code, VersionNo = 1, Title = $"{code} gốc",
                    Status = Statuses.Course.Published, CreatedByUserId = AdminId,
                });
            }
        }

        context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = world.TrialCompany, OwnerUserId = world.TrialOwnerId, PolicyJson = "{}",
            StartedAt = DateTimeOffset.UtcNow, EndsAt = DateTimeOffset.UtcNow.AddDays(14),
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        return world;
    }

    private static ICurrentUser User(Guid userId, Guid? organizationId)
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.UserId).Returns(userId);
        currentUser.Setup(c => c.OrganizationId).Returns(organizationId);
        if (organizationId is { } id)
        {
            currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(id);
        }

        return currentUser.Object;
    }

    [Fact]
    public async Task A_publication_without_apply_to_all_waits_for_the_company_and_notifies_who_may_decide()
    {
        await using var world = await CreateWorldAsync();
        var learning = await world.LatestAsync(world.Company, "M1-F");
        world.Context.Enrollments.Add(new Enrollment
        {
            CourseId = learning.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.InProgress, ProgressPercent = 30,
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var v2 = await world.PublishEditAsync("M1-F", "M1-F bản 2");

        var updates = await world.ReadAsync();
        updates.Status.Should().Be(CourseUpdateStatus.Available);
        updates.CurrentVersionNo.Should().Be(1);
        updates.LatestVersionNo.Should().Be(v2);
        var course = updates.Courses.Should().ContainSingle().Subject;
        course.Code.Should().Be("M1-F");
        course.Kind.Should().Be(PlatformCatalogApplyChange.Updated);
        course.Owned.Should().BeTrue("khóa Cơ bản luôn có");
        course.LearnersInProgress.Should().Be(1);
        (await world.LatestAsync(world.Company, "M1-F")).Title.Should().Be("M1-F gốc", "chưa ai duyệt thì nhân viên vẫn học bản đang dùng");

        var notices = await world.Context.Notifications.AsNoTracking()
            .Where(n => n.Type == PublishPlatformCatalogVersionUseCase.CourseUpdateNotificationType).ToListAsync();
        notices.Select(n => n.RecipientUserId).Should().Equal(world.OwnerId);

        // The trial company cannot open the update screen yet: it got the new content at once, without a notice.
        (await world.LatestAsync(world.TrialCompany, "M1-F")).Title.Should().Be("M1-F bản 2");
        var trialVersion = await new PlatformCatalogApplier(world.Context).VersionsAsync(new[] { world.TrialCompany }, v2);
        trialVersion[world.TrialCompany].Should().Be(v2);
    }

    [Fact]
    public async Task Applying_makes_everyone_learn_the_course_again_and_keeps_the_certificates()
    {
        await using var world = await CreateWorldAsync();
        var started = await world.LatestAsync(world.Company, "M1-F");
        var learning = new Enrollment { CourseId = started.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.InProgress, ProgressPercent = 60 };
        var waiting = new Enrollment { CourseId = started.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.InProgress, ProgressPercent = 100 };
        var passed = new Enrollment
        {
            CourseId = started.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.Completed, ProgressPercent = 100, CompletedAt = DateTimeOffset.UtcNow,
        };
        var other = await world.LatestAsync(world.Company, "M1-I");
        var untouched = new Enrollment { CourseId = other.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.InProgress, ProgressPercent = 20 };
        world.Context.Enrollments.AddRange(learning, waiting, passed, untouched);
        var pending = new CourseFinalSubmission { EnrollmentId = waiting.Id, AttemptNo = 1, EvidenceText = "Bài làm chờ chấm", SubmittedAt = DateTimeOffset.UtcNow };
        var certificate = new CourseFinalSubmission
        {
            EnrollmentId = passed.Id, AttemptNo = 1, EvidenceText = "Bài đã đạt", SubmittedAt = DateTimeOffset.UtcNow,
            Decision = Statuses.FinalSubmissionDecision.Passed, ReviewedAt = DateTimeOffset.UtcNow,
        };
        world.Context.CourseFinalSubmissions.AddRange(pending, certificate);
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        var v2 = await world.PublishEditAsync("M1-F", "M1-F bản 2");

        var offered = await world.ReadAsync();
        offered.Courses.Single().LearnersInProgress.Should().Be(2);
        offered.Courses.Single().LearnersPassed.Should().Be(1);

        var wrongVersion = () => world.ApplyAsync(v2 + 1);
        (await wrongVersion.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("VERSION_NOT_LATEST");

        var after = await world.ApplyAsync(v2);
        after.Status.Should().Be(CourseUpdateStatus.UpToDate);
        after.CurrentVersionNo.Should().Be(v2);
        after.Courses.Should().BeEmpty();
        var newest = await world.LatestAsync(world.Company, "M1-F");
        newest.Title.Should().Be("M1-F bản 2");
        newest.SupersedesCourseId.Should().Be(started.Id);

        var enrollments = await world.Context.Enrollments.AsNoTracking().ToDictionaryAsync(e => e.Id);
        enrollments[learning.Id].Status.Should().Be(Statuses.Enrollment.Cancelled, "đang học dở thì học lại từ đầu bản mới");
        enrollments[waiting.Id].Status.Should().Be(Statuses.Enrollment.Cancelled, "bài chờ chấm bị hủy cùng tiến độ cũ");
        enrollments[passed.Id].Status.Should().Be(Statuses.Enrollment.Cancelled, "đã đạt cũng học lại, mức từ khóa này không còn tính");
        enrollments[untouched.Id].Status.Should().Be(Statuses.Enrollment.InProgress, "khóa không đổi thì không ảnh hưởng");
        (await world.Context.CourseFinalSubmissions.AsNoTracking().SingleAsync(s => s.Id == certificate.Id)).Decision
            .Should().Be(Statuses.FinalSubmissionDecision.Passed, "chứng nhận cũ vẫn giữ");

        var again = () => world.ApplyAsync(v2);
        (await again.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("ALREADY_ON_VERSION");
    }

    [Fact]
    public async Task Keeping_the_version_changes_nothing_shows_the_reason_to_the_admin_and_a_newer_version_asks_again()
    {
        await using var world = await CreateWorldAsync();
        var v2 = await world.PublishEditAsync("M1-I", "M1-I bản 2");

        var offered = await world.ReadAsync();
        offered.Courses.Single().Owned.Should().BeFalse("khóa Trung cấp chưa mua");

        var kept = await world.KeepAsync(v2, "Nhân viên đang theo bản cũ, chờ hết quý");
        kept.Status.Should().Be(CourseUpdateStatus.Kept);
        kept.CurrentVersionNo.Should().Be(1);
        kept.Kept!.VersionNo.Should().Be(v2);
        kept.Kept.Reason.Should().Be("Nhân viên đang theo bản cũ, chờ hết quý");
        kept.Kept.KeptBy.Should().Be("Chủ Công ty Chính Thức");
        (await world.LatestAsync(world.Company, "M1-I")).Title.Should().Be("M1-I gốc");

        var admin = await new GetOrganizationCatalogVersionUseCase(world.Context)
            .ExecuteAsync(new GetOrganizationCatalogVersionUseCaseInput { OrganizationId = world.Company });
        admin.Kept!.Reason.Should().Be("Nhân viên đang theo bản cũ, chờ hết quý");

        // A kept update can still be applied later; a newer publication asks again.
        var v3 = await world.PublishEditAsync("M1-F", "M1-F bản 3");
        var asked = await world.ReadAsync();
        asked.Status.Should().Be(CourseUpdateStatus.Available);
        asked.Kept.Should().BeNull();
        asked.Courses.Select(c => c.Code).Should().BeEquivalentTo("M1-F", "M1-I");
        (await world.ApplyAsync(v3)).Status.Should().Be(CourseUpdateStatus.UpToDate);
    }

    [Fact]
    public async Task A_company_with_RnD_hands_the_decision_to_RnD_and_the_owner_only_reads()
    {
        await using var world = await CreateWorldAsync();
        var researchRole = new Role { Code = Roles.Research, Name = "Research & Development" };
        var review = await world.Context.Permissions.SingleAsync(p => p.Code == Permissions.Learning.ReviewCourseUpdate);
        var researcherId = Guid.NewGuid();
        world.Context.Roles.Add(researchRole);
        world.Context.RolePermissions.Add(new RolePermission { RoleId = researchRole.Id, PermissionId = review.Id });
        world.Context.Users.Add(new User { Id = researcherId, OrganizationId = world.Company, Email = "rnd@example.com", DisplayName = "R&D Công ty" });
        world.Context.UserRoles.Add(new UserRole { UserId = researcherId, RoleId = researchRole.Id, AssignedAt = DateTimeOffset.UtcNow });
        world.Context.SystemSettings.Add(new SystemSetting { OrganizationId = world.Company, Key = "rnd.enabled", Value = "true" });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var v2 = await world.PublishEditAsync("M1-F", "M1-F bản 2");

        var notices = await world.Context.Notifications.AsNoTracking()
            .Where(n => n.Type == PublishPlatformCatalogVersionUseCase.CourseUpdateNotificationType).ToListAsync();
        notices.Select(n => n.RecipientUserId).Should().Equal(new[] { researcherId }, "có R&D thì báo cho R&D, không báo Owner");

        var ownerView = await world.ReadAsync();
        ownerView.DecidedBy.Should().Be(CourseUpdateDeciders.Research);
        ownerView.CanDecide.Should().BeFalse();
        var ownerApply = () => world.ApplyAsync(v2);
        await ownerApply.Should().ThrowAsync<ForbiddenException>();

        var asResearcher = User(researcherId, world.Company);
        (await new GetCourseUpdatesUseCase(world.Context, asResearcher).ExecuteAsync(new GetCourseUpdatesUseCaseInput())).CanDecide.Should().BeTrue();
        var applied = await new ApplyCourseUpdateUseCase(world.Context, asResearcher, TimeProvider.System, Mock.Of<IAuditService>())
            .ExecuteAsync(new ApplyCourseUpdateUseCaseInput { VersionNo = v2 });
        applied.Status.Should().Be(CourseUpdateStatus.UpToDate);

        // R&D switched off: the owner decides again.
        var setting = await world.Context.SystemSettings.SingleAsync(s => s.OrganizationId == world.Company && s.Key == "rnd.enabled");
        setting.Value = "false";
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        var afterOff = await world.ReadAsync();
        afterOff.DecidedBy.Should().Be(CourseUpdateDeciders.Owner);
        afterOff.CanDecide.Should().BeTrue();
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("ngắn quá", false)]
    [InlineData("Chờ R&D đọc xong bản mới", true)]
    public void Keeping_needs_a_reason_of_ten_characters(string reason, bool valid) =>
        new KeepCourseVersionUseCaseValidator().Validate(new KeepCourseVersionUseCaseInput { VersionNo = 2, Reason = reason })
            .IsValid.Should().Be(valid);

    [Fact]
    public void Owner_and_RnD_hold_the_course_update_permission() =>
        RolePermissions.Defaults.Where(pair => pair.Value.Contains(Permissions.Learning.ReviewCourseUpdate))
            .Select(pair => pair.Key).Should().BeEquivalentTo(Roles.Research, Roles.Owner);
}
