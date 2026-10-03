using DigiTalent.Domain.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Ranh giới tổ chức. MVP chỉ có 1 tổ chức (seed sẵn); cột organization_id để mở rộng sau.
/// </summary>
public class Organization : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string Status { get; set; } = Statuses.Simple.Active;
}
