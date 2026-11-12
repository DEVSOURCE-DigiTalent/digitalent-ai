namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Ma trận sau khi lưu, kèm số phòng ban có thiết lập riêng bị hạ theo phạm vi doanh nghiệp mới.</summary>
public class UpdateOrganizationCeilingsUseCaseOutput : CapabilityCeilingsDto
{
    public int AdjustedDepartmentCount { get; set; }
}
