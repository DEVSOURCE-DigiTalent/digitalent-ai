using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>Search: họ tên hoặc mã nhân viên.</summary>
public class GetSkillGapRunsUseCaseInput : PaginationRequest
{
    public Guid? EmployeeId { get; set; }
    public Guid? DepartmentId { get; set; }
    /// <summary>Vị trí HIỆN TẠI của nhân viên.</summary>
    public Guid? JobPositionId { get; set; }
    /// <summary>true (mặc định): chỉ snapshot mới nhất của mỗi nhân viên; false: toàn bộ lịch sử.</summary>
    public bool LatestOnly { get; set; } = true;
}
