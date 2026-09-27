namespace DigiTalent.Domain.Constants;

/// <summary>
/// Giá trị cột status (lưu varchar). PHẢI khớp CHECK constraint trong
/// docs/database/DigiTalent_AI_Canonical_v2_3.sql — sửa SQL trước rồi mới sửa ở đây.
/// </summary>
public static class Statuses
{
    /// <summary>users.status</summary>
    public static class User
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Locked = "LOCKED";
    }

    /// <summary>employees.status</summary>
    public static class Employee
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Transferred = "TRANSFERRED";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>
    /// Dữ liệu danh mục: departments, job_families, job_positions.
    /// ARCHIVED thay cho xóa cứng (không xóa dòng đã được tham chiếu).
    /// </summary>
    public static class MasterData
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>organizations.status, roles.status</summary>
    public static class Simple
    {
        public const string Active = "ACTIVE";
        public const string Inactive = "INACTIVE";
    }
}
