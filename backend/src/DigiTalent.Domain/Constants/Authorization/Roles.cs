namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Mã các role (schema v2.3 — chỉ còn 5 role). Frontend dùng đúng các chuỗi này — KHÔNG đổi tên.
/// Xác thực chứng chỉ bằng mã QR là API công khai, không cần đăng nhập nên không có role riêng.
/// </summary>
public static class Roles
{
    public const string SystemAdmin = "SYSTEM_ADMIN";
    public const string HrManager = "HR_MANAGER";
    public const string DepartmentManager = "DEPARTMENT_MANAGER";
    public const string Trainer = "TRAINER";
    public const string Employee = "EMPLOYEE";
}
