namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Mã các role (doc 09 mục 3). Frontend dùng đúng các chuỗi này — KHÔNG đổi tên.
/// </summary>
public static class Roles
{
    public const string SystemAdmin = "SYSTEM_ADMIN";
    public const string HrManager = "HR_MANAGER";
    public const string DepartmentManager = "DEPARTMENT_MANAGER";
    public const string Trainer = "TRAINER";
    public const string Employee = "EMPLOYEE";
    public const string CertificateVerifier = "CERTIFICATE_VERIFIER";
}
