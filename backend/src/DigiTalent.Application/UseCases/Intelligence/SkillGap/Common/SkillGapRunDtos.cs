namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;

/// <summary>1 dòng danh sách snapshot skill gap (API contract: spec §4.7).</summary>
public class SkillGapRunListItem
{
    public Guid RunId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? JobPositionName { get; set; }
    public int RequirementSetVersionNo { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string GeneratedBy { get; set; } = string.Empty;
    public int GapCount { get; set; }
    public int HighCount { get; set; }
    public decimal CoveragePercent { get; set; }
}

public class SkillGapRunDetail : SkillGapRunListItem
{
    public Guid RequirementSetId { get; set; }
    public string CalculationVersion { get; set; } = string.Empty;
    public SkillGapSummaryDto Summary { get; set; } = new();
    public List<SkillGapItemDto> Items { get; set; } = new();
}

public class SkillGapSummaryDto
{
    public int TotalRequired { get; set; }
    public int TotalMet { get; set; }
    public int TotalGap { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public decimal CoveragePercent { get; set; }
    public SkillGapConfigDto Config { get; set; } = new();
}

public class SkillGapConfigDto
{
    public decimal MandatoryMultiplier { get; set; }
}

public class SkillGapItemDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    /// <summary>Thứ tự nhóm (miền 1–6) — FE gộp radar và bảng theo miền (D-B3).</summary>
    public int CategorySortOrder { get; set; }
    /// <summary>Mã năng lực trong Thông tư 02/2025 (ví dụ "4.2"); null nếu không mapping.</summary>
    public string? FrameworkCode { get; set; }
    public short RequiredLevel { get; set; }
    /// <summary>null = chưa có cấp độ xác nhận.</summary>
    public short? CurrentLevel { get; set; }
    public short GapSteps { get; set; }
    public decimal WeightPercent { get; set; }
    public bool Mandatory { get; set; }
    public decimal MandatoryMultiplier { get; set; }
    public decimal PriorityScore { get; set; }
    /// <summary>HIGH / MEDIUM / LOW; null = đã đạt.</summary>
    public string? Severity { get; set; }
}
