using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Domain.Entities.Organization;
using DigiTalent.Shared.Security;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public static class SeedUserData
{
    // User IDs
    public static readonly Guid UserAdminId = Guid.Parse("50000000-0000-0000-0000-000000000001");
    public static readonly Guid UserHRId = Guid.Parse("50000000-0000-0000-0000-000000000002");
    public static readonly Guid UserManagerId = Guid.Parse("50000000-0000-0000-0000-000000000003");
    public static readonly Guid UserTrainerId = Guid.Parse("50000000-0000-0000-0000-000000000004");
    public static readonly Guid UserEmployeeId = Guid.Parse("50000000-0000-0000-0000-000000000005");

    // Employee IDs
    public static readonly Guid EmpAdminId = Guid.Parse("50000000-0000-0000-0000-000000000010");
    public static readonly Guid EmpHRId = Guid.Parse("50000000-0000-0000-0000-000000000011");
    public static readonly Guid EmpManagerId = Guid.Parse("50000000-0000-0000-0000-000000000012");
    public static readonly Guid EmpTrainerId = Guid.Parse("50000000-0000-0000-0000-000000000013");
    public static readonly Guid EmpEmployeeId = Guid.Parse("50000000-0000-0000-0000-000000000014");

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var adminPwd = PasswordHelper.HashPassword("Admin@123");
        var hrPwd = PasswordHelper.HashPassword("Hr@123");
        var mgrPwd = PasswordHelper.HashPassword("Manager@123");
        var trainerPwd = PasswordHelper.HashPassword("Trainer@123");
        var empPwd = PasswordHelper.HashPassword("Employee@123");

        var users = new List<User>
        {
            new() { Id = UserAdminId, Email = "admin@digitalent.dev", PasswordHash = adminPwd, FullName = "System Admin", Status = Domain.Enums.UserStatus.Active },
            new() { Id = UserHRId, Email = "hr@digitalent.dev", PasswordHash = hrPwd, FullName = "HR Manager", Status = Domain.Enums.UserStatus.Active },
            new() { Id = UserManagerId, Email = "manager@digitalent.dev", PasswordHash = mgrPwd, FullName = "Department Manager", Status = Domain.Enums.UserStatus.Active },
            new() { Id = UserTrainerId, Email = "trainer@digitalent.dev", PasswordHash = trainerPwd, FullName = "Internal Trainer", Status = Domain.Enums.UserStatus.Active },
            new() { Id = UserEmployeeId, Email = "employee@digitalent.dev", PasswordHash = empPwd, FullName = "Employee User", Status = Domain.Enums.UserStatus.Active },
        };
        context.Users.AddRange(users);

        var orgId = SeedOrganizationData.OrgDevsourceId;

        var employees = new List<Employee>
        {
            new() { Id = EmpAdminId, OrganizationId = orgId, UserId = UserAdminId, DepartmentId = SeedOrganizationData.DeptITId, JobPositionId = SeedOrganizationData.PosTeamLeadId, EmployeeCode = "EMP001", FullName = "System Admin", Email = "admin@digitalent.dev", EmploymentStatus = "ACTIVE" },
            new() { Id = EmpHRId, OrganizationId = orgId, UserId = UserHRId, DepartmentId = SeedOrganizationData.DeptHRId, JobPositionId = SeedOrganizationData.PosHRSId, EmployeeCode = "EMP002", FullName = "HR Manager", Email = "hr@digitalent.dev", EmploymentStatus = "ACTIVE" },
            new() { Id = EmpManagerId, OrganizationId = orgId, UserId = UserManagerId, DepartmentId = SeedOrganizationData.DeptITId, JobPositionId = SeedOrganizationData.PosTeamLeadId, EmployeeCode = "EMP003", FullName = "Department Manager", Email = "manager@digitalent.dev", EmploymentStatus = "ACTIVE" },
            new() { Id = EmpTrainerId, OrganizationId = orgId, UserId = UserTrainerId, DepartmentId = SeedOrganizationData.DeptITId, JobPositionId = SeedOrganizationData.PosSEId, EmployeeCode = "EMP004", FullName = "Internal Trainer", Email = "trainer@digitalent.dev", EmploymentStatus = "ACTIVE" },
            new() { Id = EmpEmployeeId, OrganizationId = orgId, UserId = UserEmployeeId, DepartmentId = SeedOrganizationData.DeptITId, JobPositionId = SeedOrganizationData.PosSEId, EmployeeCode = "EMP005", FullName = "Employee User", Email = "employee@digitalent.dev", EmploymentStatus = "ACTIVE" },
        };
        context.Employees.AddRange(employees);

        // Assign roles to users
        // NOTE: UserRole extends AuditableEntity but has composite PK (UserId, RoleId).
        // Do NOT set Id property -- EF will auto-generate it.
        var userRoles = new List<UserRole>
        {
            new() { UserId = UserAdminId, RoleId = SeedAuthData.RoleSystemAdminId },
            new() { UserId = UserHRId, RoleId = SeedAuthData.RoleHRManagerId },
            new() { UserId = UserManagerId, RoleId = SeedAuthData.RoleDeptManagerId },
            new() { UserId = UserTrainerId, RoleId = SeedAuthData.RoleTrainerId },
            new() { UserId = UserEmployeeId, RoleId = SeedAuthData.RoleEmployeeId },
        };
        context.UserRoles.AddRange(userRoles);

        await context.SaveChangesAsync();
    }
}
