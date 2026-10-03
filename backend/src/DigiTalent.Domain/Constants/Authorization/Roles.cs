namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Mã 5 role của hệ thống (doc 09 mục 3). Frontend dùng đúng các chuỗi này — KHÔNG đổi tên.
/// Xác minh chứng chỉ công khai (/verify) KHÔNG cần role nào.
/// </summary>
public static class Roles
{
    public const string SystemAdmin = "SYSTEM_ADMIN";
    public const string HrManager = "HR_MANAGER";
    public const string DepartmentManager = "DEPARTMENT_MANAGER";
    public const string Trainer = "TRAINER";
    public const string Employee = "EMPLOYEE";

    /// <summary>
    /// Thông tin để seed bảng roles: mã, tên hiển thị, phạm vi dữ liệu (roles.scope_type).
    /// </summary>
    public static readonly IReadOnlyList<(string Code, string Name, string ScopeType)> Definitions = new[]
    {
        (SystemAdmin, "System Administrator", "GLOBAL"),
        (HrManager, "HR / Training Manager", "ORGANIZATION"),
        (DepartmentManager, "Department Manager", "DEPARTMENT"),
        (Trainer, "Internal Trainer", "SELF"),
        (Employee, "Employee", "SELF"),
    };
}
