namespace DigiTalent.Application.Services.Intelligence.Recommendation;

/// <summary>1 năng lực đang thiếu, lấy từ snapshot skill gap mới nhất.</summary>
public sealed record RecommendationGap(
    Guid CompetencyId,
    string CompetencyName,
    short RequiredLevel,
    short? CurrentLevel,
    bool Mandatory,
    decimal PriorityScore,
    string? Severity);

/// <summary>Khóa học dạy năng lực nào lên cấp nào (course_competencies).</summary>
public sealed record CourseTeaching(Guid CompetencyId, short TargetLevel, string CoverageType, decimal? CoverageWeight);

/// <summary>
/// Khóa học PUBLISHED (version mới nhất) kèm trạng thái học của nhân viên.
/// Eligibility null = không có dữ liệu tiên quyết → coi như đủ điều kiện.
/// </summary>
public sealed record CandidateCourse(
    Guid CourseId,
    string Code,
    string Title,
    short? EntryLevel,
    int? EstimatedDurationMinutes,
    string? EnrollmentStatus,
    bool IsCompleted,
    IReadOnlyList<CourseTeaching> Teaches,
    CourseEligibility? Eligibility = null);

/// <summary>
/// Điều kiện vào khóa (B7, căn cứ khung chương trình A7): đã hoàn thành mọi khóa tiên quyết (course_prerequisites),
/// HOẶC mức đã xác nhận thấp nhất trên các năng lực của khóa mà vị trí có yêu cầu ≥ mức khóa − 1 (được bỏ qua khóa thấp nếu đã đạt).
/// MinConfirmedLevel: năng lực chưa xác nhận tính 0. CourseLevel: target_level cao nhất trong các năng lực đó.
/// </summary>
public sealed record CourseEligibility(bool PrerequisitesCompleted, short MinConfirmedLevel, short CourseLevel)
{
    public bool IsMet => PrerequisitesCompleted || MinConfirmedLevel >= CourseLevel - 1;
}

/// <summary>
/// Trọng số xếp hạng (scoring_configs loại RECOMMENDATION_WEIGHTS), tổng = 100.
/// Version = scoring_configs.version, hoặc "DEFAULT" khi chưa có / cấu hình hỏng.
/// </summary>
public sealed record RecommendationWeights(decimal GapPriorityCoverage, decimal MandatoryCoverage, decimal EntryLevelFit, string Version)
{
    public const string DefaultVersion = "DEFAULT";

    public static RecommendationWeights Default { get; } = new(70m, 20m, 10m, DefaultVersion);
}

/// <summary>Điểm của từng thành phần (trọng số × tỉ lệ), cộng lại ≈ Score.</summary>
public sealed record RecommendationBreakdown(decimal GapPriorityCoverage, decimal MandatoryCoverage, decimal EntryLevelFit);

/// <summary>1 năng lực đang thiếu mà khóa học lấp được — dữ liệu để giải thích lý do gợi ý.</summary>
public sealed record RecommendationReason(
    Guid CompetencyId,
    string CompetencyName,
    short? CurrentLevel,
    short RequiredLevel,
    short CourseTargetLevel,
    string CoverageType,
    short ClosesSteps,
    bool Mandatory,
    string? Severity);

public sealed record RankedCourse(
    CandidateCourse Course,
    decimal Score,
    RecommendationBreakdown Breakdown,
    IReadOnlyList<RecommendationReason> Reasons,
    string Explanation,
    IReadOnlyList<string> Warnings);

public static class RecommendationWarnings
{
    public const string EntryLevelNotMet = "ENTRY_LEVEL_NOT_MET";
}

/// <summary>Lý do danh sách gợi ý rỗng (spec §5.6 R6).</summary>
public static class RecommendationEmptyReasons
{
    public const string NoEmployeeProfile = "NO_EMPLOYEE_PROFILE";
    public const string NoSkillGapRun = "NO_SKILL_GAP_RUN";
    public const string NoGap = "NO_GAP";
    public const string NoMatchingCourse = "NO_MATCHING_COURSE";
}

/// <summary>Mã component trong scoring_config_items của RECOMMENDATION_WEIGHTS.</summary>
public static class RecommendationComponents
{
    public const string GapPriorityCoverage = "GAP_PRIORITY_COVERAGE";
    public const string MandatoryCoverage = "MANDATORY_COVERAGE";
    public const string EntryLevelFit = "ENTRY_LEVEL_FIT";
}
