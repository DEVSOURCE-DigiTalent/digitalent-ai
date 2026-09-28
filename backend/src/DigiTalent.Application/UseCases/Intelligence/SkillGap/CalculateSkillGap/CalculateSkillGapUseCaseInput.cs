namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class CalculateSkillGapUseCaseInput
{
    public Guid EmployeeId { get; set; }

    /// <summary>Tùy chọn: bộ tiêu chuẩn ACTIVE khác để so sánh (VD: vị trí dự kiến thăng tiến). Mặc định: vị trí hiện tại.</summary>
    public Guid? RequirementSetId { get; set; }
}
