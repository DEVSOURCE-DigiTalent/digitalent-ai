using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng capability_baselines. Mức đầu vào của nhân viên ở một lĩnh vực năng lực (competency_categories),
/// ghi một lần khi nộp bài đầu vào và giữ nguyên về sau — mức đã xác nhận được tính riêng.
/// Chỉ có dòng cho lĩnh vực thuộc mục tiêu vị trí (TargetLevel ≥ 1); BaselineLevel = 0 là chưa đạt Cơ bản.
/// </summary>
public class CapabilityBaseline : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid CompetencyCategoryId { get; set; }
    public short TargetLevel { get; set; }
    public short BaselineLevel { get; set; }
    public DateTimeOffset AssessedAt { get; set; }
}
