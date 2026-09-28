namespace DigiTalent.Application.Services.Intelligence.SkillGap;

/// <summary>1 dòng yêu cầu năng lực của vị trí (lấy từ bộ tiêu chuẩn ACTIVE).</summary>
public sealed record SkillGapRequirementLine(Guid CompetencyId, int RequiredLevel, decimal WeightPercent, bool Mandatory);

/// <summary>
/// Tham số tính skill gap — đọc từ system_settings "intelligence.skill_gap" (spec D-S3-04).
/// </summary>
public sealed record SkillGapSettings(decimal MandatoryMultiplier, decimal MediumWeightThreshold)
{
    public static SkillGapSettings Default { get; } = new(1.5m, 20m);
}

/// <summary>Kết quả 1 năng lực. CurrentLevel null = chưa có cấp độ xác nhận; Severity null = đã đạt.</summary>
public sealed record SkillGapLineResult(
    Guid CompetencyId,
    short RequiredLevel,
    short? CurrentLevel,
    short GapSteps,
    decimal WeightPercent,
    bool Mandatory,
    decimal MandatoryMultiplier,
    decimal PriorityScore,
    string? Severity);

public sealed record SkillGapSummary(
    int TotalRequired,
    int TotalMet,
    int TotalGap,
    int HighCount,
    int MediumCount,
    int LowCount,
    decimal CoveragePercent);

public sealed record SkillGapResult(IReadOnlyList<SkillGapLineResult> Items, SkillGapSummary Summary);

/// <summary>
/// Nội dung cột skill_gap_runs.summary_snapshot (jsonb, camelCase) — FE hiển thị ngay, không tính lại.
/// Lưu kèm tham số đã dùng để snapshot cũ vẫn giải thích được khi cấu hình đổi.
/// </summary>
public sealed record SkillGapSnapshot(
    Guid JobPositionId,
    int RequirementSetVersionNo,
    int TotalRequired,
    int TotalMet,
    int TotalGap,
    int HighCount,
    int MediumCount,
    int LowCount,
    decimal CoveragePercent,
    SkillGapSettings Config)
{
    public static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new(System.Text.Json.JsonSerializerDefaults.Web);
}

/// <summary>Lý do không tính được skill gap cho 1 nhân viên (trả về FE để dịch).</summary>
public static class SkillGapSkipReasons
{
    public const string EmployeeNotActive = "EMPLOYEE_NOT_ACTIVE";
    public const string NoJobPosition = "NO_JOB_POSITION";
    public const string NoActiveRequirementSet = "NO_ACTIVE_REQUIREMENT_SET";
}
