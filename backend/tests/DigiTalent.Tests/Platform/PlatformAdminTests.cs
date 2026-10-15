using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Courses;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Application.UseCases.Platform.Organizations;
using DigiTalent.Application.UseCases.Platform.Overview;
using DigiTalent.Application.UseCases.Platform.Users;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Platform Admin console (Pulse §12.4 / §12.6): catalog releases, seat grants, suspension and account locks.
/// </summary>
public class PlatformAdminTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private static async Task<AppDbContext> CreateSeededContextAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
        await PlatformCatalogSeeder.SeedAsync(context);
        return context;
    }

    private static ICurrentUser Admin()
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.UserId).Returns(AdminId);
        return currentUser.Object;
    }

    private static async Task<Domain.Entities.Organization> AddOrganizationAsync(AppDbContext context, string name = "Northstar Studio")
    {
        var organization = new Domain.Entities.Organization { Code = name.ToUpperInvariant().Replace(' ', '_'), Name = name, Status = Statuses.Simple.Active };
        context.Organizations.Add(organization);
        await context.SaveChangesAsync();
        return organization;
    }

    private static async Task<User> AddUserAsync(AppDbContext context, string email, string roleCode, Guid? organizationId)
    {
        var role = await context.Roles.FirstOrDefaultAsync(r => r.Code == roleCode);
        if (role == null)
        {
            role = new Role { Code = roleCode, Name = roleCode };
            context.Roles.Add(role);
        }

        var user = new User { Email = email, DisplayName = email, PasswordHash = "x", OrganizationId = organizationId };
        context.Users.Add(user);
        context.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        await context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task SeederCreatesSixDomainsAndEighteenCoursesOnce()
    {
        await using var context = await CreateSeededContextAsync();
        await PlatformCatalogSeeder.SeedAsync(context); // second run adds nothing

        (await context.PlatformFrameworkDomains.CountAsync()).Should().Be(6);
        (await context.PlatformCourses.CountAsync()).Should().Be(18);
        (await context.PlatformFrameworkReleases.CountAsync()).Should().Be(1);
        (await context.PlatformCourses.Where(c => c.Level == 1).AllAsync(c => c.PricePerSeat == 0)).Should().BeTrue();
        (await context.PlatformCourses.Where(c => c.Level > 1).AllAsync(c => c.PricePerSeat > 0)).Should().BeTrue();
    }

    [Fact]
    public async Task SeederUsesTheCodesAndNamesOfTheOrganizationsTt02Catalog()
    {
        await using var context = await CreateSeededContextAsync();

        var domains = await context.PlatformFrameworkDomains.OrderBy(d => d.SortOrder).ToListAsync();
        domains.Select(d => d.Code).Should().Equal(Tt02Catalog.Domains.Select(d => d.CategoryCode));
        domains.Select(d => d.Name).Should().Equal(Tt02Catalog.Domains.Select(d => d.Name));

        var codes = await context.PlatformCourses.Select(c => c.Code).ToListAsync();
        codes.Should().BeEquivalentTo(Tt02Catalog.Domains.SelectMany(d => new[] { 1, 2, 3 }.Select(d.CourseCode)));
        var intermediate = await context.PlatformCourses.SingleAsync(c => c.Code == "A1-I");
        intermediate.Title.Should().Be(Tt02Catalog.Domains[0].CourseTitles[1]);
        intermediate.Level.Should().Be(2);
    }

    [Fact]
    public async Task FrameworkPublishRequiresADraftChangeAndBumpsVersion()
    {
        await using var context = await CreateSeededContextAsync();
        var publish = new PublishPlatformFrameworkUseCase(context, Admin(), Mock.Of<IAuditService>());

        var noChange = () => publish.ExecuteAsync(new PublishPlatformFrameworkUseCaseInput());
        await noChange.Should().ThrowAsync<BadRequestException>();

        var save = new SavePlatformFrameworkDraftUseCase(context, Mock.Of<IAuditService>());
        var draft = await save.ExecuteAsync(new SavePlatformFrameworkDraftUseCaseInput
        {
            Domains = { new PlatformFrameworkDomainDraftInput { Code = "TT02_D6", Description = "Dùng AI có trách nhiệm và kiểm chứng kết quả trước khi bàn giao." } },
        });
        draft.HasDraft.Should().BeTrue();
        draft.CurrentVersion.Should().Be(1);

        var published = await publish.ExecuteAsync(new PublishPlatformFrameworkUseCaseInput { ReleaseNote = "Cập nhật năng lực AI" });
        published.CurrentVersion.Should().Be(2);
        published.HasDraft.Should().BeFalse();
        published.Domains.Single(d => d.Code == "TT02_D6").PublishedDescription.Should().StartWith("Dùng AI có trách nhiệm");
    }

    [Fact]
    public async Task BasicCourseCannotHaveAPrice()
    {
        await using var context = await CreateSeededContextAsync();
        var save = new SavePlatformCourseDraftUseCase(context, Mock.Of<IAuditService>());

        var act = () => save.ExecuteAsync(new SavePlatformCourseDraftUseCaseInput
        {
            Code = "A1-F",
            Title = "Dữ liệu và thông tin · Cơ bản",
            Outcome = "Áp dụng dữ liệu ở mức cơ bản với minh chứng truy vết được.",
            PricePerSeat = 100_000,
            SalesStatus = Statuses.PlatformCourseSales.Open,
        });

        (await act.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("BASIC_COURSE_IS_FREE");
    }

    [Fact]
    public async Task CoursePublishAppliesDraftAndPublishesDraftQuestions()
    {
        await using var context = await CreateSeededContextAsync();
        var audit = Mock.Of<IAuditService>();
        await new SavePlatformCourseDraftUseCase(context, audit).ExecuteAsync(new SavePlatformCourseDraftUseCaseInput
        {
            Code = "a1-i",
            Title = "Dữ liệu và thông tin · Trung cấp (bản mới)",
            Outcome = "Phân tích dữ liệu nhiều nguồn và nêu được độ tin cậy của kết luận.",
            PricePerSeat = 450_000,
            SalesStatus = Statuses.PlatformCourseSales.Paused,
        });
        var withQuestion = await new AddPlatformCourseQuestionUseCase(context, Admin(), audit).ExecuteAsync(new AddPlatformCourseQuestionUseCaseInput
        {
            Code = "A1-I",
            QuestionText = "Khi hai nguồn dữ liệu mâu thuẫn, bạn kiểm tra điều gì trước tiên?",
            CorrectAnswer = "Thời điểm và cách thu thập của từng nguồn.",
            Explanation = "Hai nguồn chỉ so được khi cùng định nghĩa và cùng kỳ.",
        });
        withQuestion.Course.VersionNo.Should().Be(1);
        withQuestion.Course.HasDraft.Should().BeTrue();
        withQuestion.Course.DraftQuestionCount.Should().Be(1);

        var published = await new PublishPlatformCourseUseCase(context, Admin(), audit).ExecuteAsync(new PublishPlatformCourseUseCaseInput { Code = "A1-I" });

        published.Course.VersionNo.Should().Be(2);
        published.Course.HasDraft.Should().BeFalse();
        published.Course.PricePerSeat.Should().Be(450_000);
        published.Course.SalesStatus.Should().Be(Statuses.PlatformCourseSales.Paused);
        published.Course.PublishedQuestionCount.Should().Be(2);
        published.Course.DraftQuestionCount.Should().Be(0);
        published.Releases.Select(r => r.VersionNo).Should().Equal(2, 1);
    }

    [Fact]
    public async Task SeatGrantRecordsAnOrderButKeepsTheOrganizationInTrial()
    {
        await using var context = await CreateSeededContextAsync();
        var organization = await AddOrganizationAsync(context);
        var grant = new GrantPlatformCourseSeatsUseCase(context, Admin(), Mock.Of<IAuditService>());

        var basic = () => grant.ExecuteAsync(new GrantPlatformCourseSeatsUseCaseInput
        {
            OrganizationId = organization.Id, CourseCode = "A1-F", Seats = 1, Reason = "Hỗ trợ dùng thử mở rộng",
        });
        await basic.Should().ThrowAsync<BadRequestException>();

        var detail = await grant.ExecuteAsync(new GrantPlatformCourseSeatsUseCaseInput
        {
            OrganizationId = organization.Id, CourseCode = "A3-I", Seats = 2, Reason = "Bù suất do lỗi thanh toán",
        });

        detail.Seats.Should().ContainSingle(s => s.CourseCode == "A3-I" && s.SeatsGranted == 2 && s.SeatsPurchased == 0);
        detail.Orders.Should().ContainSingle(o => o.Kind == PlatformCatalog.SeatOrderKind.AdminGrant && o.TotalAmount == 0);
        detail.Organization.Stage.Should().Be(PlatformOrganizationStages.Trial);
    }

    [Fact]
    public async Task SuspendedOrganizationMembersLoseTheirSession()
    {
        await using var context = await CreateSeededContextAsync();
        var organization = await AddOrganizationAsync(context);
        var owner = await AddUserAsync(context, "owner@northstar.vn", Roles.Owner, organization.Id);
        var change = new ChangePlatformOrganizationStatusUseCase(context, Mock.Of<IAuditService>());
        var permissions = new PermissionService(context);

        (await permissions.IsAccountUsableAsync(owner.Id)).Should().BeTrue();

        var suspended = await change.ExecuteAsync(new ChangePlatformOrganizationStatusUseCaseInput
        {
            OrganizationId = organization.Id, Suspend = true, Reason = "Vi phạm điều khoản sử dụng",
        });
        suspended.Organization.Status.Should().Be(Statuses.Organization.Suspended);
        suspended.Organization.OwnerEmail.Should().Be("owner@northstar.vn");
        (await permissions.IsAccountUsableAsync(owner.Id)).Should().BeFalse();

        var again = () => change.ExecuteAsync(new ChangePlatformOrganizationStatusUseCaseInput
        {
            OrganizationId = organization.Id, Suspend = true, Reason = "Vi phạm điều khoản sử dụng",
        });
        await again.Should().ThrowAsync<ConflictException>();

        var restored = await change.ExecuteAsync(new ChangePlatformOrganizationStatusUseCaseInput
        {
            OrganizationId = organization.Id, Suspend = false, Reason = "Đã xử lý xong khiếu nại",
        });
        restored.Organization.Status.Should().Be(Statuses.Simple.Active);
        (await new PermissionService(context).IsAccountUsableAsync(owner.Id)).Should().BeTrue();
    }

    [Fact]
    public async Task LockAndUnlockAnEmployeeButNeverAPlatformAdmin()
    {
        await using var context = await CreateSeededContextAsync();
        var organization = await AddOrganizationAsync(context);
        var employee = await AddUserAsync(context, "mia@northstar.vn", Roles.Employee, organization.Id);
        var otherAdmin = await AddUserAsync(context, "ops@digitalent.ai", Roles.PlatformAdmin, null);
        var change = new ChangePlatformUserLockUseCase(context, Admin(), Mock.Of<IAuditService>());

        var locked = await change.ExecuteAsync(new ChangePlatformUserLockUseCaseInput { UserId = employee.Id, Lock = true, Reason = "Tài khoản bị chia sẻ" });
        locked.User.Status.Should().Be(Statuses.User.Locked);
        locked.User.IsManuallyLocked.Should().BeTrue();
        (await new PermissionService(context).IsAccountUsableAsync(employee.Id)).Should().BeFalse();

        var unlocked = await change.ExecuteAsync(new ChangePlatformUserLockUseCaseInput { UserId = employee.Id, Lock = false, Reason = "Đã đổi mật khẩu mới" });
        unlocked.User.Status.Should().Be(Statuses.User.Active);

        var lockAdmin = () => change.ExecuteAsync(new ChangePlatformUserLockUseCaseInput { UserId = otherAdmin.Id, Lock = true, Reason = "Thử khóa quản trị" });
        (await lockAdmin.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CANNOT_LOCK_PLATFORM_ADMIN");
    }

    [Fact]
    public async Task OverviewCountsTrialAndPaidOrganizations()
    {
        await using var context = await CreateSeededContextAsync();
        var trial = await AddOrganizationAsync(context, "Northstar Studio");
        var paid = await AddOrganizationAsync(context, "Northstar Growth");
        var course = await context.PlatformCourses.SingleAsync(c => c.Code == "A1-I");
        context.CourseSeatOrders.Add(new CourseSeatOrder
        {
            OrganizationId = paid.Id,
            CourseId = course.Id,
            Seats = 3,
            Kind = PlatformCatalog.SeatOrderKind.Purchase,
            UnitPrice = course.PricePerSeat,
            TotalAmount = course.PricePerSeat * 3,
        });
        await context.SaveChangesAsync();

        var overview = await new GetPlatformOverviewUseCase(context).ExecuteAsync(new GetPlatformOverviewUseCaseInput());

        overview.OrganizationCount.Should().Be(2);
        overview.TrialOrganizationCount.Should().Be(1);
        overview.PaidOrganizationCount.Should().Be(1);
        overview.ConversionRate.Should().Be(50);
        overview.SeatsPurchased.Should().Be(3);
        overview.Revenue.Should().Be(course.PricePerSeat * 3);
        overview.CourseCount.Should().Be(18);
        overview.FrameworkVersion.Should().Be(1);
        trial.Should().NotBeNull();
    }

    [Fact]
    public async Task UsersListFiltersByHighestRoleAndPagesTheMatches()
    {
        await using var context = await CreateSeededContextAsync();
        var organization = await AddOrganizationAsync(context);
        foreach (var email in new[] { "an@northstar.vn", "binh@northstar.vn", "chi@northstar.vn" })
            await AddUserAsync(context, email, Roles.Employee, organization.Id);
        await AddUserAsync(context, "lead@northstar.vn", Roles.Manager, organization.Id);
        // The owner also learns as an employee: listed under the highest role only
        var owner = await AddUserAsync(context, "owner@northstar.vn", Roles.Owner, organization.Id);
        context.UserRoles.Add(new UserRole { UserId = owner.Id, RoleId = (await context.Roles.SingleAsync(r => r.Code == Roles.Employee)).Id });
        context.Users.Add(new User { Email = "learner@gmail.com", DisplayName = "Học viên cá nhân", PasswordHash = "x" });
        await context.SaveChangesAsync();
        var list = new GetPlatformUsersUseCase(context);

        var employees = await list.ExecuteAsync(new GetPlatformUsersUseCaseInput { Role = Roles.Employee });
        employees.Items.Select(u => u.Email).Should().Equal("an@northstar.vn", "binh@northstar.vn", "chi@northstar.vn");

        var owners = await list.ExecuteAsync(new GetPlatformUsersUseCaseInput { Role = Roles.Owner });
        owners.Items.Should().ContainSingle(u => u.Email == "owner@northstar.vn" && u.Role == Roles.Owner);

        var learners = await list.ExecuteAsync(new GetPlatformUsersUseCaseInput { Role = PlatformUserReader.LearnerRole });
        learners.Items.Should().ContainSingle(u => u.Email == "learner@gmail.com" && u.OrganizationId == null);

        var secondPage = await list.ExecuteAsync(new GetPlatformUsersUseCaseInput { Search = "STUDIO", PageIndex = 2, PageSize = 2 });
        secondPage.TotalItems.Should().Be(5);
        secondPage.Items.Select(u => u.Email).Should().Equal("chi@northstar.vn", "lead@northstar.vn");
    }

    [Fact]
    public void PlatformAdminCanReadItsOwnNotifications()
    {
        RolePermissions.Defaults[Roles.PlatformAdmin].Should().Contain(new[] { Permissions.Notification.ReadOwn, Permissions.Notification.MarkRead });
    }
}
