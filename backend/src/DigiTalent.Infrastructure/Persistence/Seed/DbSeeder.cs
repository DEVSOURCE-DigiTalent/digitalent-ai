using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Tạo dữ liệu nền khi chạy môi trường Development. Chạy lại nhiều lần vẫn an toàn:
///   1. 1 tổ chức mặc định
///   2. 4 persisted roles + mọi mã quyền trong Permissions.cs + ma trận RolePermissions.Defaults
///      (chỉ THÊM phần còn thiếu — không ghi đè ma trận admin đã chỉnh)
///   3. Bốn tài khoản theo role và ba tài khoản cá nhân, được backfill theo email. Mật khẩu chung: Admin@1234
///   4. Dữ liệu Skill Gap / gợi ý khóa học — xem SkillGapSeeder
///   5. Nội dung khóa học và hồ sơ học viên demo — xem CourseContentSeeder
///   6. Subscription, đợt đào tạo và hành trình học cho các trang cá nhân EM-*
/// </summary>
public static class DbSeeder
{
    private const string DefaultPassword = "Admin@1234";
    private const string DefaultOrganizationCode = "DIGITALENT";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher passwordHasher, string? developmentPassword = null)
    {
        var organization = await SeedOrganizationAsync(db);
        await SeedReferenceDataAsync(db);
        await SeedDemoUsersAsync(db, passwordHasher, organization.Id, developmentPassword ?? DefaultPassword);
        await SkillGapSeeder.SeedDemoAsync(db, organization.Id);
        var authorUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "owner@digitalent.ai");
        if (authorUser != null)
        {
            await CourseContentSeeder.SeedCourseContentAsync(db, organization.Id, authorUser.Id);
            await CourseContentSeeder.SeedDemoLearnerProfilesAsync(db, organization.Id);
        }

        await SeedDemoSubscriptionAsync(db, organization);
        await EmployeeJourneySeeder.SeedDemoAsync(db, organization.Id);
    }

    public static async Task SeedReferenceDataAsync(AppDbContext db)
    {
        await SeedRolesAsync(db);
        await SeedPermissionsAsync(db);
        await SeedRolePermissionsAsync(db);
        await SkillGapSeeder.SeedReferenceAsync(db);
    }

    private static async Task<Organization> SeedOrganizationAsync(AppDbContext db)
    {
        var organization = await db.Organizations.FirstOrDefaultAsync(o => o.Code == DefaultOrganizationCode);
        if (organization != null)
        {
            return organization;
        }

        organization = new Organization { Code = DefaultOrganizationCode, Name = "DigiTalent Demo Company" };
        db.Organizations.Add(organization);
        await db.SaveChangesAsync();
        return organization;
    }

    /// <summary>
    /// Subscription, setup state and one ACTIVE training batch for the demo organization (overview screen).
    /// Idempotent: only missing data is added, so existing Development databases are backfilled.
    /// </summary>
    private static async Task SeedDemoSubscriptionAsync(AppDbContext db, Organization organization)
    {
        organization.SetupCompletedAt ??= DateTimeOffset.UtcNow;

        if (!await db.Subscriptions.AnyAsync(s => s.OrganizationId == organization.Id))
        {
            db.Subscriptions.Add(new Subscription
            {
                OrganizationId = organization.Id,
                PlanCode = "BUSINESS",
                PlanName = "Gói Doanh nghiệp",
                Status = Statuses.Subscription.Active,
                Cycle = "year",
                SeatLimit = 50,
                RenewsAt = DateTimeOffset.UtcNow.AddYears(1),
            });
        }

        var owner = await db.Users.FirstOrDefaultAsync(u => u.OrganizationId == organization.Id && u.Email == "owner@digitalent.ai");
        var course = await db.Courses
            .Where(c => c.OrganizationId == organization.Id && c.Status == Statuses.Course.Published)
            .OrderBy(c => c.Code)
            .FirstOrDefaultAsync();
        if (owner != null && course != null && !await db.TrainingBatches.AnyAsync(b => b.OrganizationId == organization.Id))
        {
            db.TrainingBatches.Add(new TrainingBatch
            {
                OrganizationId = organization.Id,
                Code = "BATCH-Q4-2026",
                Title = "Đợt đào tạo năng lực số Q4/2026",
                CourseId = course.Id,
                Status = Statuses.TrainingBatch.Active,
                StartDate = DateTimeOffset.UtcNow,
                CreatedByUserId = owner.Id,
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(AppDbContext db)
    {
        var existing = await db.Roles.Select(r => r.Code).ToListAsync();

        foreach (var (code, name, scopeType) in Roles.Definitions.Where(d => !existing.Contains(d.Code)))
        {
            db.Roles.Add(new Role { Code = code, Name = name, ScopeType = scopeType });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedPermissionsAsync(AppDbContext db)
    {
        var existing = await db.Permissions.Select(p => p.Code).ToListAsync();

        foreach (var code in Permissions.All().Where(code => !existing.Contains(code)))
        {
            var dot = code.IndexOf('.');
            db.Permissions.Add(new Permission
            {
                Code = code,
                Module = code[..dot],
                Action = code[(dot + 1)..],
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedRolePermissionsAsync(AppDbContext db)
    {
        var roleIds = await db.Roles.ToDictionaryAsync(r => r.Code, r => r.Id);
        var permissionIds = await db.Permissions.ToDictionaryAsync(p => p.Code, p => p.Id);
        var existing = (await db.RolePermissions.Select(rp => new { rp.RoleId, rp.PermissionId }).ToListAsync())
            .Select(rp => (rp.RoleId, rp.PermissionId))
            .ToHashSet();

        foreach (var (roleCode, permissionCodes) in RolePermissions.Defaults)
        {
            foreach (var permissionCode in permissionCodes)
            {
                var pair = (roleIds[roleCode], permissionIds[permissionCode]);
                if (existing.Add(pair))
                {
                    db.RolePermissions.Add(new RolePermission { RoleId = pair.Item1, PermissionId = pair.Item2 });
                }
            }
        }

        await db.SaveChangesAsync();
    }

    public static async Task SeedDemoUsersAsync(AppDbContext db, IPasswordHasher passwordHasher, Guid organizationId, string password)
    {
        var passwordHash = passwordHasher.Hash(password);
        var roleIds = await db.Roles.ToDictionaryAsync(r => r.Code, r => r.Id);
        var now = DateTimeOffset.UtcNow;
        var users = await db.Users
            .Include(user => user.UserRoles)
            .ToDictionaryAsync(user => user.Email, StringComparer.OrdinalIgnoreCase);

        User EnsureUser(string email, string displayName, Guid? organization, string? roleCode)
        {
            if (!users.TryGetValue(email, out var user))
            {
                user = new User
                {
                    Email = email,
                    DisplayName = displayName,
                    PasswordHash = passwordHash,
                    EmailVerifiedAt = now,
                };
                db.Users.Add(user);
                users[email] = user;
            }

            user.OrganizationId = organization;
            user.EmailVerifiedAt ??= now;

            var desiredRoleId = roleCode == null ? (Guid?)null : roleIds[roleCode];
            var managedRoleIds = roleIds.Values.ToHashSet();
            foreach (var assignedRole in user.UserRoles
                         .Where(role => managedRoleIds.Contains(role.RoleId) && role.RoleId != desiredRoleId)
                         .ToList())
            {
                user.UserRoles.Remove(assignedRole);
            }
            if (desiredRoleId.HasValue && user.UserRoles.All(role => role.RoleId != desiredRoleId.Value))
            {
                user.UserRoles.Add(new UserRole { RoleId = desiredRoleId.Value, AssignedAt = now });
            }

            return user;
        }

        EnsureUser("platform@digitalent.ai", "Platform Administrator", null, Roles.PlatformAdmin);
        var owner = EnsureUser("owner@digitalent.ai", "Enterprise Owner", organizationId, Roles.Owner);
        var manager = EnsureUser("manager@digitalent.ai", "Department Manager", organizationId, Roles.Manager);
        var employee = EnsureUser("employee@digitalent.ai", "Employee", organizationId, Roles.Employee);
        EnsureUser("personal@digitalent.ai", "Bùi Thị Cá Nhân", null, null);
        EnsureUser("trial@digitalent.ai", "Lý Văn Dùng Thử", null, null);
        EnsureUser("free@digitalent.ai", "Mai Thị Miễn Phí", null, null);
        await db.SaveChangesAsync();

        await SeedDemoOrganizationStructureAsync(db, organizationId, owner, manager, employee);
    }

    /// <summary>
    /// 1 phòng ban + hồ sơ nhân sự cho 3 tài khoản doanh nghiệp, để test phạm vi phòng ban của manager.
    /// Chưa gán vị trí công việc (job_position_id = NULL là hợp lệ).
    /// </summary>
    private static async Task SeedDemoOrganizationStructureAsync(
        AppDbContext db, Guid organizationId, User owner, User manager, User employee)
    {
        var department = await db.Departments
            .FirstOrDefaultAsync(item => item.OrganizationId == organizationId && item.Code == "OPS");
        if (department == null)
        {
            department = new Department { OrganizationId = organizationId, Code = "OPS", Name = "Operations" };
            db.Departments.Add(department);
            await db.SaveChangesAsync();
        }

        async Task<Employee> EnsureEmployee(User user, string code, Guid? directManagerId = null)
        {
            var profile = await db.Employees.FirstOrDefaultAsync(item => item.UserId == user.Id);
            if (profile == null)
            {
                profile = new Employee
                {
                    OrganizationId = organizationId,
                    UserId = user.Id,
                    EmployeeCode = code,
                    FullName = user.DisplayName,
                    WorkEmail = user.Email,
                };
                db.Employees.Add(profile);
            }
            profile.DepartmentId = department.Id;
            profile.DirectManagerId = directManagerId;
            profile.Status = Statuses.Employee.Active;
            return profile;
        }

        var managerProfile = await EnsureEmployee(manager, "EMP-0001");
        await db.SaveChangesAsync();

        await EnsureEmployee(owner, "EMP-0002");
        await EnsureEmployee(employee, "EMP-0004", managerProfile.Id);
        department.ManagerEmployeeId = managerProfile.Id;
        await db.SaveChangesAsync();
    }
}
