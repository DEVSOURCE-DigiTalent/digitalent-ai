using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng capability_baseline_answers. Một câu trả lời của bài đầu vào (mỗi nhân viên làm một lần).
/// </summary>
public class CapabilityBaselineAnswer : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid SelectedOptionId { get; set; }
    public bool IsCorrect { get; set; }
    public DateTimeOffset AnsweredAt { get; set; }
}
