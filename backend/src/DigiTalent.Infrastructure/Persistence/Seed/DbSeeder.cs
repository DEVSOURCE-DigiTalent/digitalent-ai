using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Tạo dữ liệu mẫu khi chạy môi trường Development (chỉ tạo khi bảng còn trống).
/// Mỗi role 1 tài khoản để test phân quyền. Mật khẩu chung: Admin@1234
/// </summary>
public static class DbSeeder
{
    private const string DefaultPassword = "Admin@1234";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher passwordHasher)
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var passwordHash = passwordHasher.Hash(DefaultPassword);

        db.Users.AddRange(
            CreateUser("admin@digitalent.ai", "System Admin", Roles.SystemAdmin, passwordHash),
            CreateUser("hr@digitalent.ai", "HR Manager", Roles.HrManager, passwordHash),
            CreateUser("manager@digitalent.ai", "Department Manager", Roles.DepartmentManager, passwordHash),
            CreateUser("trainer@digitalent.ai", "Trainer", Roles.Trainer, passwordHash),
            CreateUser("employee@digitalent.ai", "Employee", Roles.Employee, passwordHash),
            CreateUser("verifier@digitalent.ai", "Certificate Verifier", Roles.CertificateVerifier, passwordHash));

        await db.SaveChangesAsync();
    }

    private static User CreateUser(string email, string fullName, string role, string passwordHash)
    {
        return new User
        {
            Email = email,
            FullName = fullName,
            PasswordHash = passwordHash,
            Roles = new List<string> { role },
        };
    }
}
