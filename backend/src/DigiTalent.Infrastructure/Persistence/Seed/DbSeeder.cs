using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Tạo dữ liệu nền khi chạy môi trường Development. Chạy lại nhiều lần vẫn an toàn:
///   1. 1 tổ chức mặc định
///   2. 5 role + mọi mã quyền trong Permissions.cs + ma trận RolePermissions.Defaults
///      (chỉ THÊM phần còn thiếu — không ghi đè ma trận admin đã chỉnh)
///   3. Mỗi role 1 tài khoản (chỉ khi bảng users còn trống). Mật khẩu chung: Admin@1234
/// </summary>
public static class DbSeeder
{
    private const string DefaultPassword = "Admin@1234";
    private const string DefaultOrganizationCode = "DIGITALENT";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher passwordHasher)
    {
        var organization = await SeedOrganizationAsync(db);
        await SeedRolesAsync(db);
        await SeedPermissionsAsync(db);
        await SeedRolePermissionsAsync(db);
        await SeedUsersAsync(db, passwordHasher, organization.Id);
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

    private static async Task SeedUsersAsync(AppDbContext db, IPasswordHasher passwordHasher, Guid organizationId)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var passwordHash = passwordHasher.Hash(DefaultPassword);
        var roleIds = await db.Roles.ToDictionaryAsync(r => r.Code, r => r.Id);
        var now = DateTimeOffset.UtcNow;

        User CreateUser(string email, string displayName, string roleCode) => new()
        {
            OrganizationId = organizationId,
            Email = email,
            DisplayName = displayName,
            PasswordHash = passwordHash,
            UserRoles = new List<UserRole> { new() { RoleId = roleIds[roleCode], AssignedAt = now } },
        };

        var admin = CreateUser("admin@digitalent.ai", "System Admin", Roles.SystemAdmin);
        var hr = CreateUser("hr@digitalent.ai", "HR Manager", Roles.HrManager);
        var manager = CreateUser("manager@digitalent.ai", "Department Manager", Roles.DepartmentManager);
        var trainer = CreateUser("trainer@digitalent.ai", "Trainer", Roles.Trainer);
        var employee = CreateUser("employee@digitalent.ai", "Employee", Roles.Employee);
        db.Users.AddRange(admin, hr, manager, trainer, employee);
        await db.SaveChangesAsync();

        await SeedDemoOrganizationStructureAsync(db, organizationId, hr, manager, trainer, employee);
    }

    /// <summary>
    /// 1 phòng ban + hồ sơ nhân sự cho 4 tài khoản nghiệp vụ, để test phạm vi phòng ban của manager.
    /// Chưa gán vị trí công việc (job_position_id = NULL là hợp lệ).
    /// </summary>
    private static async Task SeedDemoOrganizationStructureAsync(
        AppDbContext db, Guid organizationId, User hr, User manager, User trainer, User employee)
    {
        var department = new Department { OrganizationId = organizationId, Code = "OPS", Name = "Operations" };
        db.Departments.Add(department);
        await db.SaveChangesAsync();

        Employee CreateEmployee(User user, string code, Guid? directManagerId = null) => new()
        {
            OrganizationId = organizationId,
            UserId = user.Id,
            DepartmentId = department.Id,
            DirectManagerId = directManagerId,
            EmployeeCode = code,
            FullName = user.DisplayName,
            WorkEmail = user.Email,
            Status = Statuses.Employee.Active,
        };

        var managerProfile = CreateEmployee(manager, "EMP-0001");
        db.Employees.Add(managerProfile);
        await db.SaveChangesAsync();

        db.Employees.AddRange(
            CreateEmployee(hr, "EMP-0002"),
            CreateEmployee(trainer, "EMP-0003"),
            CreateEmployee(employee, "EMP-0004", managerProfile.Id));
        department.ManagerEmployeeId = managerProfile.Id;
        await db.SaveChangesAsync();
    }
}
