using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using OrganizationEntity = DigiTalent.Domain.Entities.Organization;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Catalog versions are shared, but each organization learns from the version applied to it: publishing can leave
/// organizations where they are, the admin applies any published version (newer or older) to one organization, and
/// "apply to all" brings every organization up to date.
/// </summary>
public class PlatformCatalogApplyTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public Guid OrgA { get; } = Guid.NewGuid();
        public Guid OrgB { get; } = Guid.NewGuid();
        public HtmlContentSanitizer Sanitizer { get; } = new();
        public IAuditService Audit { get; } = Mock.Of<IAuditService>();
        private PlatformCatalogEditor Editor => new(Context, Sanitizer, Admin(), TimeProvider.System);

        /// <summary>Opens a draft, renames one course (an edit), publishes it and returns the version number.</summary>
        public async Task<int> PublishEditAsync(string code, string title, bool applyToAll)
        {
            var draft = await new CreatePlatformCatalogDraftUseCase(Context, Editor, Audit).ExecuteAsync(new CreatePlatformCatalogDraftUseCaseInput());
            var versionNo = draft.Version.VersionNo;
            var versionId = (await Context.PlatformCatalogVersions.SingleAsync(v => v.VersionNo == versionNo)).Id;
            var identity = await Context.PlatformCourses.SingleAsync(c => c.Code == code);
            var row = await Context.PlatformCatalogCourses.SingleAsync(c => c.VersionId == versionId && c.CourseId == identity.Id);
            row.Title = title;
            row.ChangeKind = PlatformCatalog.ChangeKind.Edited;
            await Context.SaveChangesAsync();
            Context.ChangeTracker.Clear();

            await new PublishPlatformCatalogVersionUseCase(Context, Editor, new PlatformPublishChecker(Context, Sanitizer), Audit)
                .ExecuteAsync(new PublishPlatformCatalogVersionUseCaseInput { VersionNo = versionNo, ApplyToAllOrganizations = applyToAll });
            Context.ChangeTracker.Clear();
            return versionNo;
        }

        public async Task<OrganizationCatalogVersionOutput> ApplyAsync(Guid organizationId, int versionNo, string? reason = null)
        {
            var output = await new ApplyOrganizationCatalogVersionUseCase(Context, Admin(), TimeProvider.System, Audit)
                .ExecuteAsync(new ApplyOrganizationCatalogVersionUseCaseInput { OrganizationId = organizationId, VersionNo = versionNo, Reason = reason });
            Context.ChangeTracker.Clear();
            return output;
        }

        public Task<OrganizationCatalogVersionOutput> ReadAsync(Guid organizationId, int? versionNo = null) =>
            new GetOrganizationCatalogVersionUseCase(Context)
                .ExecuteAsync(new GetOrganizationCatalogVersionUseCaseInput { OrganizationId = organizationId, VersionNo = versionNo });

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
        foreach (var (organizationId, name) in new[] { (world.OrgA, "Công ty A"), (world.OrgB, "Công ty B") })
        {
            context.Organizations.Add(new OrganizationEntity { Id = organizationId, Code = name.Replace(" ", ""), Name = name });
            foreach (var code in new[] { "M1-F", "M1-I" })
            {
                context.Courses.Add(new Course
                {
                    OrganizationId = organizationId, Code = code, VersionNo = 1, Title = $"{code} gốc",
                    Status = Statuses.Course.Published, CreatedByUserId = AdminId,
                });
            }
        }

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        return world;
    }

    private static ICurrentUser Admin()
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.UserId).Returns(AdminId);
        return currentUser.Object;
    }

    [Fact]
    public async Task Publishing_without_applying_keeps_organizations_on_their_version_until_the_admin_applies_it()
    {
        await using var world = await CreateWorldAsync();
        var v2 = await world.PublishEditAsync("M1-F", "M1-F bản 2", applyToAll: false);

        (await world.Context.Courses.CountAsync(c => c.OrganizationId == world.OrgA)).Should().Be(2, "chưa áp cho doanh nghiệp nào");
        var preview = await world.ReadAsync(world.OrgA);
        preview.Provisioned.Should().BeTrue();
        preview.VersionNo.Should().Be(1);
        preview.LatestVersionNo.Should().Be(v2);
        preview.TargetVersionNo.Should().Be(v2);
        preview.Changes.Select(c => (c.Code, c.Kind)).Should().Equal(("M1-F", PlatformCatalogApplyChange.Updated));

        var applied = await world.ApplyAsync(world.OrgA, v2);
        applied.VersionNo.Should().Be(v2);
        applied.Changes.Select(c => c.Code).Should().Equal("M1-F");
        (await world.LatestAsync(world.OrgA, "M1-F")).Title.Should().Be("M1-F bản 2");
        (await world.LatestAsync(world.OrgA, "M1-I")).VersionNo.Should().Be(1, "khóa không đổi giữ nguyên bản cũ");
        (await world.LatestAsync(world.OrgB, "M1-F")).Title.Should().Be("M1-F gốc", "doanh nghiệp B chưa được áp");
        (await world.ReadAsync(world.OrgB)).VersionNo.Should().Be(1);

        var list = await PlatformCatalogVersionReader.ReadListAsync(world.Context);
        list.Items.Single(v => v.VersionNo == v2).OrganizationCount.Should().Be(1);
        list.Items.Single(v => v.VersionNo == 1).OrganizationCount.Should().Be(1);

        var again = () => world.ApplyAsync(world.OrgA, v2);
        (await again.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("ALREADY_ON_VERSION");
    }

    [Fact]
    public async Task Going_back_needs_a_reason_and_brings_the_old_content_as_a_new_revision_without_moving_learners()
    {
        await using var world = await CreateWorldAsync();
        var v2 = await world.PublishEditAsync("M1-F", "M1-F bản 2", applyToAll: false);
        await world.ApplyAsync(world.OrgA, v2);
        var learning = await world.LatestAsync(world.OrgA, "M1-F");
        var enrollment = new Enrollment { CourseId = learning.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.InProgress, ProgressPercent = 40 };
        world.Context.Enrollments.Add(enrollment);
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var withoutReason = () => world.ApplyAsync(world.OrgA, 1);
        (await withoutReason.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("REASON_REQUIRED");

        var back = await world.ApplyAsync(world.OrgA, 1, "Bản 2 có câu hỏi sai đáp án");
        back.VersionNo.Should().Be(1);
        var v1Title = await (
            from row in world.Context.PlatformCatalogCourses
            join version in world.Context.PlatformCatalogVersions on row.VersionId equals version.Id
            join course in world.Context.PlatformCourses on row.CourseId equals course.Id
            where version.VersionNo == 1 && course.Code == "M1-F"
            select row.Title).SingleAsync();
        var restored = await world.LatestAsync(world.OrgA, "M1-F");
        restored.VersionNo.Should().Be(3, "quay lại cũng tạo bản mới, không sửa bản đang học");
        restored.Title.Should().Be(v1Title);
        restored.SupersedesCourseId.Should().Be(learning.Id);
        var learner = await world.Context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == enrollment.Id);
        learner.CourseId.Should().Be(learning.Id, "tiến độ cũ được giữ làm lịch sử");
        learner.Status.Should().Be(Statuses.Enrollment.Cancelled, "nội dung đổi thì người đang học học lại từ đầu");

        await world.ApplyAsync(world.OrgA, v2);
        var forward = await world.LatestAsync(world.OrgA, "M1-F");
        forward.VersionNo.Should().Be(4, "áp lại bản đã từng áp vẫn ra bản mới");
        forward.Title.Should().Be("M1-F bản 2");
    }

    [Fact]
    public async Task Skipped_versions_are_caught_up_and_applying_to_all_moves_organizations_that_were_behind()
    {
        await using var world = await CreateWorldAsync();
        await world.PublishEditAsync("M1-F", "M1-F bản 2", applyToAll: false);
        var v3 = await world.PublishEditAsync("M1-I", "M1-I bản 3", applyToAll: false);

        (await world.ReadAsync(world.OrgB)).Changes.Select(c => c.Code).Should().Equal("M1-F", "M1-I");
        await world.ApplyAsync(world.OrgB, v3);
        (await world.LatestAsync(world.OrgB, "M1-F")).Title.Should().Be("M1-F bản 2");
        (await world.LatestAsync(world.OrgB, "M1-I")).Title.Should().Be("M1-I bản 3");

        // A is still on v1: a fix published for everyone also brings it the changes of v2 and v3.
        var v4 = await world.PublishEditAsync("M1-F", "M1-F bản 4 sửa lỗi", applyToAll: true);
        (await world.ReadAsync(world.OrgA)).VersionNo.Should().Be(v4);
        (await world.ReadAsync(world.OrgB)).VersionNo.Should().Be(v4);
        (await world.LatestAsync(world.OrgA, "M1-F")).Title.Should().Be("M1-F bản 4 sửa lỗi");
        (await world.LatestAsync(world.OrgA, "M1-I")).Title.Should().Be("M1-I bản 3");
        (await world.LatestAsync(world.OrgB, "M1-F")).Title.Should().Be("M1-F bản 4 sửa lỗi");
        (await world.LatestAsync(world.OrgB, "M1-I")).VersionNo.Should().Be(2, "B đã có nội dung bản 3 của khóa này");
    }
}
