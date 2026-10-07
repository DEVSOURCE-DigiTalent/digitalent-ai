namespace DigiTalent.Domain.Constants;

/// <summary>
/// Shared grade scale of job positions (job_positions.job_grade, job_grades.code). Codes are fixed and must match
/// the CHECK constraints in docs/database/DigiTalent_AI_Canonical_v2_3.sql; each organization may rename them.
/// </summary>
public static class JobGrades
{
    public const string G1 = "G1";
    public const string G2 = "G2";
    public const string G3 = "G3";

    /// <summary>Grade codes in display order.</summary>
    public static readonly IReadOnlyList<string> Codes = new[] { G1, G2, G3 };

    /// <summary>Name and description used while an organization has not customised a grade.</summary>
    public static readonly IReadOnlyDictionary<string, (string Name, string Description)> Defaults =
        new Dictionary<string, (string Name, string Description)>
        {
            [G1] = ("Cấp Tác nghiệp / Chuyên viên", "Thực hiện công việc chuyên môn, tác nghiệp trực tiếp"),
            [G2] = ("Cấp Quản lý trực tiếp / Trưởng nhóm", "Quản lý nhóm, phân công, giám sát và đánh giá công việc"),
            [G3] = ("Cấp Lãnh đạo / Quản lý cấp cao", "Định hướng chiến lược, quản trị phòng ban và tổ chức"),
        };

    public static bool IsValid(string? code) => code is G1 or G2 or G3;
}
