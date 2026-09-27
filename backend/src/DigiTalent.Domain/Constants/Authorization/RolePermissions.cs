namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// MA TRẬN QUYỀN MẶC ĐỊNH (chép từ bảng trong doc 09 mục 6) — dùng để SEED bảng role_permissions.
///
/// Lúc chạy, quyền được đọc từ database (bảng role_permissions), KHÔNG đọc từ file này:
/// admin có thể chỉnh ma trận trên giao diện. SYSTEM_ADMIN luôn có mọi quyền nên không cần liệt kê.
///
/// Làm module mới: thêm mã vào Permissions.cs, khai báo role nào có quyền ở đây,
/// chạy lại app (Development) → DbSeeder tự thêm quyền còn thiếu.
/// </summary>
public static class RolePermissions
{
    public static readonly IReadOnlyDictionary<string, string[]> Defaults = new Dictionary<string, string[]>
    {
        [Roles.HrManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
            Permissions.Department.CreateUpdate,
            Permissions.JobPosition.Read,
            Permissions.JobPosition.CreateUpdate,
        },
        [Roles.DepartmentManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
            Permissions.JobPosition.Read,
        },
        [Roles.Trainer] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
            Permissions.JobPosition.Read,
        },
        [Roles.Employee] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
            Permissions.JobPosition.Read,
        },
    };
}
