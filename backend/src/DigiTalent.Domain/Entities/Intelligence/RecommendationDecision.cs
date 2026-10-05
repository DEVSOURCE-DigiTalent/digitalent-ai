using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng recommendation_decisions. Quyết định của HR / quản lý với 1 khóa học được gợi ý cho 1 nhân viên
/// (mỗi cặp nhân viên + khóa học một dòng, cập nhật tại chỗ; REOPENED = trả về trạng thái chờ duyệt).
/// </summary>
public class RecommendationDecision : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public Guid? SkillGapRunId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public Guid DecidedByUserId { get; set; }
    public DateTimeOffset DecidedAt { get; set; }
}
