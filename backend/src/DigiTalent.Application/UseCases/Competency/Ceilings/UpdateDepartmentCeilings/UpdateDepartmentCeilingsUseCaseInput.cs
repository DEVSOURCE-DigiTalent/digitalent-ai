using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

public class UpdateDepartmentCeilingsUseCaseInput
{
    // DepartmentId comes from the URL (PUT api/v1/capability-ceilings/departments/{departmentId})
    [JsonIgnore]
    public Guid DepartmentId { get; set; }

    /// <summary>true = bỏ mọi trần riêng, phòng ban kế thừa trần doanh nghiệp (Ceilings bị bỏ qua).</summary>
    public bool Inherit { get; set; }

    /// <summary>Trần riêng theo lĩnh vực; lĩnh vực không có trong danh sách giữ nguyên.</summary>
    public List<CeilingInputItem> Ceilings { get; set; } = new();
}
