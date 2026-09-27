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

    /// <summary>competencies.status</summary>
    public static class Competency
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }

    /// <summary>competencies.competency_type</summary>
    public static class CompetencyType
    {
        public const string CoreDigital = "CORE_DIGITAL";
        public const string Professional = "PROFESSIONAL";
        public const string Internal = "INTERNAL";
        public const string Behavioural = "BEHAVIOURAL";
    }

    /// <summary>position_requirement_sets.status</summary>
    public static class PositionRequirementSet
    {
        public const string Draft = "DRAFT";
        public const string Active = "ACTIVE";
        public const string Archived = "ARCHIVED";
    }
}
