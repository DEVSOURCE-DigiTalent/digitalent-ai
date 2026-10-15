namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>Ma trận sau khi lưu, kèm số phòng ban có trần riêng bị hạ theo trần doanh nghiệp mới.</summary>
public class UpdateOrganizationCeilingsUseCaseOutput : CapabilityCeilingsDto
{
    public int AdjustedDepartmentCount { get; set; }
}
