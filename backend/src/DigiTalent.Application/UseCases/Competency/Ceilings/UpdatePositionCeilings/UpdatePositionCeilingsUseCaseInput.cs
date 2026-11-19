using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

public class UpdatePositionCeilingsUseCaseInput
{
    // Code of one of the 5 standard positions, from the URL (PUT api/v1/capability-ceilings/positions/{code})
    [JsonIgnore]
    public string Code { get; set; } = string.Empty;

    /// <summary>true = bỏ mọi mức đã đặt cho vị trí, vị trí theo đề xuất của hệ thống (Ceilings bị bỏ qua).</summary>
    public bool Inherit { get; set; }

    /// <summary>Mức cần đạt theo lĩnh vực (1..3); lĩnh vực không có trong danh sách giữ nguyên.</summary>
    public List<CeilingInputItem> Ceilings { get; set; } = new();
}
