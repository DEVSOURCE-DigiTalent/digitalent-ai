using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Organization.Access;
using DigiTalent.Application.UseCases.Organization.Invitations;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Organization;

/// <summary>
/// Organization screens OW-02..OW-13 against PostgreSQL: members, invitations (invite → activate), roles,
/// job grades and the department / position extensions (manager, headcount, grade).
/// </summary>
[Collection("PostgresIntegration")]
public class OrganizationStructureTests
{
    private const string Password = "Str0ng-Passphrase!";

    // ── Members & invitations ──

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Members_ListProfilesAccountsAndInvitations_WithFilters()
    {
        var f = await Fixture.CreateAsync();

        var invite = await f.Invite(new InviteMemberRow
        {
            Email = "New.Person@Test.Local",
            FullName = "New Person",
            Role = MemberRoles.Manager,
            DepartmentId = f.World.DepartmentB.Id,
        });
        invite.Created.Should().ContainSingle();
        invite.Created[0].Email.Should().Be("new.person@test.local");
        invite.Created[0].DebugLink.Should().NotBeNull();

        var all = await f.ListMembers(new GetPagedMembersUseCaseInput { PageSize = 100 });
        // 5 employee profiles + "HR" and owner accounts without profile + 1 invitation
        all.TotalItems.Should().Be(8);
        all.Items.Last().Kind.Should().Be(MemberKinds.Invitation); // invitations are listed last
        all.Items.Single(m => m.Kind == MemberKinds.Invitation).Roles.Should().Equal(MemberRoles.Manager);
        all.Items.Single(m => m.Id == f.Owner.Id).Roles.Should().Equal(MemberRoles.Owner);

        var pending = await f.ListMembers(new GetPagedMembersUseCaseInput { Status = MemberStatuses.Pending });
        pending.Items.Should().ContainSingle().Which.DepartmentName.Should().Be("Finance");

        var inactive = await f.ListMembers(new GetPagedMembersUseCaseInput { Status = MemberStatuses.Inactive });
        inactive.Items.Should().ContainSingle().Which.EmployeeId.Should().Be(f.World.Inactive.Id);

        var owners = await f.ListMembers(new GetPagedMembersUseCaseInput { Role = MemberRoles.Owner });
        owners.Items.Should().ContainSingle().Which.Id.Should().Be(f.Owner.Id);

        var analysts = await f.ListMembers(new GetPagedMembersUseCaseInput { JobPositionId = f.World.DataAnalyst.Id });
        analysts.TotalItems.Should().Be(3);

        var search = await f.ListMembers(new GetPagedMembersUseCaseInput { Search = f.World.Analyst.EmployeeCode });
        search.Items.Should().ContainSingle().Which.ActiveCourses.Should().Be(0);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Invite_RejectsInvalidRowsIndividually_AndRespectsSeatLimit()
    {
        var f = await Fixture.CreateAsync();
        // Seats in use before inviting: "HR" + owner accounts = 2
        f.Context.Subscriptions.Add(new Subscription
        {
            OrganizationId = f.World.Organization.Id,
            PlanCode = "STARTER",
            PlanName = "Starter",
            Status = Statuses.Subscription.Active,
            SeatLimit = 3,
        });
        await f.Context.SaveChangesAsync();

        var result = await f.Invite(
            new InviteMemberRow { Email = "not-an-email", FullName = "Bad" },
            new InviteMemberRow { Email = f.Owner.Email, FullName = "Taken" },
            new InviteMemberRow { Email = "role@test.local", FullName = "Role", Role = "SUPER" },
            new InviteMemberRow { Email = "ok@test.local", FullName = "First" },
            new InviteMemberRow { Email = "ok@test.local", FullName = "Duplicate in batch" },
            new InviteMemberRow { Email = "late@test.local", FullName = "No seat left" });

        result.Created.Select(c => c.Email).Should().Equal("ok@test.local");
        result.Rejected.Select(r => (r.Email, r.Reason)).Should().Equal(
            ("not-an-email", "Email không hợp lệ."),
            (f.Owner.Email, "Email đã có tài khoản hoặc đã được mời."),
            ("role@test.local", "Vai trò không hợp lệ."),
            ("ok@test.local", "Email đã có tài khoản hoặc đã được mời."),
            ("late@test.local", "Đã hết quyền sử dụng của gói."));
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Activate_CreatesAccountRoleAndProfile_AndClosesTheInvitation()
    {
        var f = await Fixture.CreateAsync();
        var email = $"joiner_{Guid.NewGuid():N}@test.local"; // accounts are unique across organizations
        var invite = await f.Invite(new InviteMemberRow
        {
            Email = email,
            FullName = "Joiner",
            Role = MemberRoles.Employee,
            EmployeeCode = "nv900",
            DepartmentId = f.World.DepartmentA.Id,
            JobPositionId = f.World.DataAnalyst.Id,
        });
        var token = invite.Created.Single().Token!;

        var preview = await new GetInvitationUseCase(f.Context).ExecuteAsync(new GetInvitationUseCaseInput { Token = token });
        preview.OrganizationName.Should().Be("Skill Gap Test Org");
        preview.Role.Should().Be(MemberRoles.Employee);

        var activated = await f.Activate(token, "Joiner Nguyen");

        var user = await f.Context.Users.AsNoTracking().SingleAsync(u => u.Id == activated.UserId);
        user.Email.Should().Be(email);
        user.PasswordHash.Should().Be($"hashed:{Password}");
        var employee = await f.Context.Employees.AsNoTracking().SingleAsync(e => e.Id == activated.EmployeeId);
        employee.EmployeeCode.Should().Be("NV900");
        employee.DepartmentId.Should().Be(f.World.DepartmentA.Id);
        employee.JobPositionId.Should().Be(f.World.DataAnalyst.Id);
        employee.FullName.Should().Be("Joiner Nguyen");

        var member = await f.GetMember(user.Id);
        member.Kind.Should().Be(MemberKinds.Member);
        member.Roles.Should().Equal(MemberRoles.Employee);

        // The link works only once
        var reuse = () => f.Activate(token, "Again");
        await reuse.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Activate_LinksAnExistingProfileWithTheSameWorkEmail()
    {
        var f = await Fixture.CreateAsync();
        var email = $"newjoiner_{Guid.NewGuid():N}@test.local";
        var profile = await f.Context.Employees.SingleAsync(e => e.Id == f.World.Unassigned.Id);
        profile.WorkEmail = email;
        await f.Context.SaveChangesAsync();

        var invite = await f.Invite(new InviteMemberRow { Email = email, FullName = "New Joiner" });
        var activated = await f.Activate(invite.Created.Single().Token!, null);

        activated.EmployeeId.Should().Be(f.World.Unassigned.Id);
        (await f.ListMembers(new GetPagedMembersUseCaseInput { PageSize = 100 })).TotalItems.Should().Be(7); // no duplicate row
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ResendAndRevoke_RotateTheTokenAndReleaseTheSeat()
    {
        var f = await Fixture.CreateAsync();
        var invite = await f.Invite(new InviteMemberRow { Email = "resend@test.local", FullName = "Resend" });
        var created = invite.Created.Single();

        var resent = await new ResendInvitationUseCase(f.Context, f.CurrentUser, f.Sender.Object, f.Audit.Object)
            .ExecuteAsync(new ResendInvitationUseCaseInput { Id = created.Id });
        resent.Token.Should().NotBe(created.Token);
        var oldLink = () => new GetInvitationUseCase(f.Context).ExecuteAsync(new GetInvitationUseCaseInput { Token = created.Token! });
        await oldLink.Should().ThrowAsync<NotFoundException>();

        await new RevokeInvitationUseCase(f.Context, f.CurrentUser, f.Audit.Object)
            .ExecuteAsync(new RevokeInvitationUseCaseInput { Id = created.Id });

        (await f.Directory.CountSeatsInUseAsync(f.World.Organization.Id)).Should().Be(2);
        (await f.ListMembers(new GetPagedMembersUseCaseInput { Status = MemberStatuses.Pending })).TotalItems.Should().Be(0);
        var activateRevoked = () => f.Activate(resent.Token!, null);
        await activateRevoked.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task UpdateMember_ChangesRolesAndPlacement_ButKeepsTheLastOwner()
    {
        var f = await Fixture.CreateAsync();
        var member = await f.CreateAccountAsync("member@test.local", Roles.Employee, f.World.Analyst);

        var promoted = await f.Update(new UpdateMemberUseCaseInput
        {
            Id = member.Id,
            Roles = new List<string> { MemberRoles.Manager },
            DepartmentId = f.World.DepartmentB.Id,
            JobPositionId = string.Empty, // clear the position
        });
        promoted.Roles.Should().Equal(MemberRoles.Manager);
        promoted.DepartmentId.Should().Be(f.World.DepartmentB.Id);
        promoted.JobPositionId.Should().BeNull();

        var demoteLastOwner = () => f.Update(new UpdateMemberUseCaseInput
        {
            Id = f.Owner.Id,
            Roles = new List<string> { MemberRoles.Employee },
        });
        await demoteLastOwner.Should().ThrowAsync<ConflictException>();

        // An owner without a profile gets one at the first placement
        var placedOwner = await f.Update(new UpdateMemberUseCaseInput { Id = f.Owner.Id, DepartmentId = f.World.DepartmentA.Id });
        placedOwner.EmployeeId.Should().NotBeNull();
        placedOwner.EmployeeCode.Should().StartWith("NV");

        var withoutProfile = await f.CreateAccountAsync("noprofile@test.local", Roles.Employee, null);
        var withoutDepartment = () => f.Update(new UpdateMemberUseCaseInput
        {
            Id = withoutProfile.Id,
            JobPositionId = f.World.DataAnalyst.Id.ToString(),
        });
        (await withoutDepartment.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("NO_EMPLOYEE_PROFILE");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetMember_FindsAnAccountByItsEmployeeProfileId()
    {
        var f = await Fixture.CreateAsync();
        var account = await f.CreateAccountAsync("profiled@test.local", Roles.Employee, f.World.Analyst);

        var byEmployee = await f.GetMember(f.World.Analyst.Id);

        byEmployee.Id.Should().Be(account.Id);
        byEmployee.EmployeeId.Should().Be(f.World.Analyst.Id);
        var unknown = () => f.GetMember(Guid.NewGuid());
        await unknown.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task DeactivateAndReactivate_ToggleAccessAndKeepTheReason()
    {
        var f = await Fixture.CreateAsync();
        var member = await f.CreateAccountAsync("leaver@test.local", Roles.Employee, f.World.AnalystInDepartmentB);

        var deactivated = await new DeactivateMemberUseCase(f.Context, f.CurrentUser, f.Audit.Object, f.Directory)
            .ExecuteAsync(new DeactivateMemberUseCaseInput { Id = member.Id, Reason = "  Nghỉ việc  " });
        deactivated.Status.Should().Be(MemberStatuses.Inactive);
        deactivated.DeactivatedReason.Should().Be("Nghỉ việc");
        (await f.Context.Employees.AsNoTracking().SingleAsync(e => e.Id == f.World.AnalystInDepartmentB.Id))
            .Status.Should().Be(Statuses.Employee.Inactive);

        var self = () => new DeactivateMemberUseCase(f.Context, f.CurrentUser, f.Audit.Object, f.Directory)
            .ExecuteAsync(new DeactivateMemberUseCaseInput { Id = f.Owner.Id, Reason = "x" });
        await self.Should().ThrowAsync<ConflictException>();

        var reactivated = await new ReactivateMemberUseCase(f.Context, f.CurrentUser, f.Audit.Object, f.Directory)
            .ExecuteAsync(new ReactivateMemberUseCaseInput { Id = member.Id });
        reactivated.Status.Should().Be(MemberStatuses.Active);
        reactivated.DeactivatedReason.Should().BeNull();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task GetRoles_CountsActiveHoldersAndListsPermissions()
    {
        var f = await Fixture.CreateAsync();
        await f.CreateAccountAsync("manager@test.local", Roles.Manager, null);
        await f.CreateAccountAsync("employee2@test.local", Roles.Employee, null);

        var permissionService = new Mock<IPermissionService>();
        permissionService.Setup(p => p.HasAnyAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(true);
        permissionService.Setup(p => p.GetPermissionsAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync(new[] { Permissions.UserRole.UserRead });

        var roles = await new GetRolesUseCase(f.Context, f.CurrentUser, permissionService.Object).ExecuteAsync(new GetRolesUseCaseInput());

        roles.Select(r => (r.Role, r.MemberCount, r.Assignable)).Should().Equal(
            (MemberRoles.Owner, 1, true),
            (MemberRoles.Manager, 1, true),
            (MemberRoles.Employee, 1, true));
        roles[0].Permissions.Should().Equal(Permissions.UserRole.UserRead);
    }

    // ── Job grades, departments, positions ──

    [Fact]
    [Trait("Category", "Integration")]
    public async Task JobGrades_DefaultUntilRenamed_AndCountPositionsAndEmployees()
    {
        var f = await Fixture.CreateAsync();
        await f.Context.JobPositions.Where(p => p.Id == f.World.DataAnalyst.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.JobGrade, JobGrades.G1));

        var grades = await new GetJobGradesUseCase(f.Context, f.CurrentUser).ExecuteAsync(new GetJobGradesUseCaseInput());
        grades.Select(g => g.Code).Should().Equal(JobGrades.G1, JobGrades.G2, JobGrades.G3);
        grades[0].Name.Should().Be(JobGrades.Defaults[JobGrades.G1].Name);
        grades[0].PositionCount.Should().Be(1);
        grades[0].EmployeeCount.Should().Be(2); // Analyst + AnalystInDepartmentB (the INACTIVE one is excluded)

        var update = new UpdateJobGradeUseCase(f.Context, f.CurrentUser, f.Audit.Object);
        await update.ExecuteAsync(new UpdateJobGradeUseCaseInput { Code = "g1", Name = "Nhân viên" });
        var renamed = await update.ExecuteAsync(new UpdateJobGradeUseCaseInput { Code = "G1", Name = "Chuyên viên", Description = "Mô tả" });

        renamed.Name.Should().Be("Chuyên viên");
        renamed.IsCustomized.Should().BeTrue();
        (await f.Context.JobGrades.CountAsync(g => g.OrganizationId == f.World.Organization.Id)).Should().Be(1); // upsert, not insert twice
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Departments_ReturnManagerHeadcountAndGradeDistribution()
    {
        var f = await Fixture.CreateAsync();
        await f.Context.JobPositions.Where(p => p.Id == f.World.DataAnalyst.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.JobGrade, JobGrades.G2));

        await new UpdateDepartmentUseCase(f.Context, f.CurrentUser, f.Audit.Object).ExecuteAsync(new UpdateDepartmentUseCaseInput
        {
            Id = f.World.DepartmentA.Id,
            Code = f.World.DepartmentA.Code,
            Name = "Analytics",
            ManagerEmployeeId = f.World.Analyst.Id,
            Status = Statuses.MasterData.Active,
        });

        var detail = await new GetDepartmentByIdUseCase(f.Context, f.CurrentUser)
            .ExecuteAsync(new GetDepartmentByIdUseCaseInput { Id = f.World.DepartmentA.Id });
        detail.ManagerName.Should().Be(f.World.Analyst.FullName);
        detail.Headcount.Should().Be(2); // Analyst + Unassigned (INACTIVE excluded)
        detail.GradeDistribution.Should().Equal(new Dictionary<string, int> { ["G1"] = 0, ["G2"] = 1, ["G3"] = 0 });

        var list = await new GetPagedDepartmentsUseCase(f.Context, f.CurrentUser)
            .ExecuteAsync(new GetPagedDepartmentsUseCaseInput { PageSize = 10 });
        list.Items.Single(d => d.Id == f.World.DepartmentB.Id).Headcount.Should().Be(2);

        var inactiveManager = () => new UpdateDepartmentUseCase(f.Context, f.CurrentUser, f.Audit.Object).ExecuteAsync(new UpdateDepartmentUseCaseInput
        {
            Id = f.World.DepartmentB.Id,
            Code = f.World.DepartmentB.Code,
            Name = "Finance",
            ManagerEmployeeId = f.World.Inactive.Id,
            Status = Statuses.MasterData.Active,
        });
        (await inactiveManager.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("INVALID_MANAGER");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task JobPositions_StoreDepartmentAndGrade_AndExposeHeadcountAndRequirementSet()
    {
        var f = await Fixture.CreateAsync();
        var created = await new CreateJobPositionUseCase(f.Context, f.CurrentUser, f.Audit.Object).ExecuteAsync(new CreateJobPositionUseCaseInput
        {
            Code = $"BA_{Guid.NewGuid():N}"[..12],
            Name = "Business Analyst",
            DepartmentId = f.World.DepartmentB.Id,
            JobGrade = "g3",
        });

        var list = await new GetPagedJobPositionsUseCase(f.Context, f.CurrentUser)
            .ExecuteAsync(new GetPagedJobPositionsUseCaseInput { DepartmentId = f.World.DepartmentB.Id, JobGrade = JobGrades.G3 });
        var row = list.Items.Should().ContainSingle().Subject;
        row.Id.Should().Be(created.Id);
        row.DepartmentName.Should().Be("Finance");
        row.JobGradeName.Should().Be(JobGrades.Defaults[JobGrades.G3].Name);

        var analyst = await new GetJobPositionByIdUseCase(f.Context, f.CurrentUser)
            .ExecuteAsync(new GetJobPositionByIdUseCaseInput { Id = f.World.DataAnalyst.Id });
        analyst.Headcount.Should().Be(2);
        analyst.HasRequirementSet.Should().BeTrue();
        analyst.ActiveRequirementSetVersionNo.Should().Be(1);

        var archiveDepartment = () => new ArchiveDepartmentUseCase(f.Context, f.CurrentUser, f.Audit.Object)
            .ExecuteAsync(new ArchiveDepartmentUseCaseInput { Id = f.World.DepartmentB.Id });
        await archiveDepartment.Should().ThrowAsync<ConflictException>(); // still has employees and a position
    }

    /// <summary>
    /// Test world + an Owner account calling the use cases, with the external services mocked.
    /// </summary>
    private sealed class Fixture
    {
        public required SkillGapTestWorld World { get; init; }
        public required User Owner { get; init; }
        public required ICurrentUser CurrentUser { get; init; }
        public required MemberDirectory Directory { get; init; }
        public Mock<IAuditService> Audit { get; } = new();
        public Mock<IPermissionService> Permissions { get; } = new();
        public Mock<IInvitationSender> Sender { get; } = new();
        public Mock<IPasswordHasher> Hasher { get; } = new();
        public Infrastructure.Persistence.AppDbContext Context => World.Context;

        public static async Task<Fixture> CreateAsync()
        {
            var context = PostgresTestDatabase.CreateContext();
            await PostgresTestDatabase.MigrateAsync(context);
            await EnsureRolesAsync(context);
            var world = await SkillGapTestWorld.CreateAsync(context);

            var owner = new User
            {
                OrganizationId = world.Organization.Id,
                Email = $"owner_{Guid.NewGuid():N}@test.local",
                PasswordHash = "x",
                DisplayName = "Owner",
            };
            context.Users.Add(owner);
            context.UserRoles.Add(new UserRole
            {
                UserId = owner.Id,
                RoleId = await context.Roles.Where(r => r.Code == Roles.Owner).Select(r => r.Id).SingleAsync(),
                AssignedAt = DateTimeOffset.UtcNow,
            });
            await context.SaveChangesAsync();

            var currentUser = new Mock<ICurrentUser>();
            currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(world.Organization.Id);
            currentUser.Setup(c => c.OrganizationId).Returns(world.Organization.Id);
            currentUser.Setup(c => c.UserId).Returns(owner.Id);
            currentUser.Setup(c => c.Roles).Returns(new List<string> { Roles.Owner });
            currentUser.Setup(c => c.IsAdmin).Returns(true);

            var fixture = new Fixture
            {
                World = world,
                Owner = owner,
                CurrentUser = currentUser.Object,
                Directory = new MemberDirectory(context),
            };
            fixture.Permissions
                .Setup(p => p.HasAnyAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<IReadOnlyCollection<string>>()))
                .ReturnsAsync(true);
            fixture.Sender
                .Setup(s => s.SendAsync(It.IsAny<InvitationMessage>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((InvitationMessage m, CancellationToken _) => $"http://localhost:5173/activate/{m.Token}");
            fixture.Hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns((string p) => $"hashed:{p}");
            return fixture;
        }

        public Task<InviteMembersUseCaseOutput> Invite(params InviteMemberRow[] rows) =>
            new InviteMembersUseCase(Context, CurrentUser, Permissions.Object, Sender.Object, Audit.Object, Directory)
                .ExecuteAsync(new InviteMembersUseCaseInput { Rows = rows.ToList() });

        public Task<ActivateInvitationUseCaseOutput> Activate(string token, string? fullName) =>
            new ActivateInvitationUseCase(Context, Hasher.Object)
                .ExecuteAsync(new ActivateInvitationUseCaseInput { Token = token, FullName = fullName, Password = Password });

        public Task<GetPagedMembersUseCaseOutput> ListMembers(GetPagedMembersUseCaseInput input) =>
            new GetPagedMembersUseCase(CurrentUser, Directory).ExecuteAsync(input);

        public Task<GetMemberByIdUseCaseOutput> GetMember(Guid id) =>
            new GetMemberByIdUseCase(Context, CurrentUser, Directory).ExecuteAsync(new GetMemberByIdUseCaseInput { Id = id });

        public Task<UpdateMemberUseCaseOutput> Update(UpdateMemberUseCaseInput input) =>
            new UpdateMemberUseCase(Context, CurrentUser, Permissions.Object, Audit.Object, Directory).ExecuteAsync(input);

        /// <summary>An account with one role, optionally linked to an existing employee profile.</summary>
        public async Task<User> CreateAccountAsync(string emailPrefix, string roleCode, Employee? profile)
        {
            var user = new User
            {
                OrganizationId = World.Organization.Id,
                Email = $"{emailPrefix.Replace("@", $"_{Guid.NewGuid():N}@")}",
                PasswordHash = "x",
                DisplayName = profile?.FullName ?? emailPrefix,
            };
            Context.Users.Add(user);
            Context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = await Context.Roles.Where(r => r.Code == roleCode).Select(r => r.Id).SingleAsync(),
                AssignedAt = DateTimeOffset.UtcNow,
            });
            if (profile != null)
            {
                (await Context.Employees.SingleAsync(e => e.Id == profile.Id)).UserId = user.Id;
            }

            await Context.SaveChangesAsync();
            return user;
        }

        /// <summary>The roles table is seeded by DbSeeder at startup, not by the migrations.</summary>
        private static async Task EnsureRolesAsync(Infrastructure.Persistence.AppDbContext context)
        {
            var existing = await context.Roles.Select(r => r.Code).ToListAsync();
            foreach (var (code, name, scope) in Roles.Definitions.Where(d => !existing.Contains(d.Code)))
            {
                context.Roles.Add(new Role { Code = code, Name = name, ScopeType = scope });
            }

            await context.SaveChangesAsync();
        }
    }
}
