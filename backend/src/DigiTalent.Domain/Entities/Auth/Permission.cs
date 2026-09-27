using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Mã quyền (bảng permissions), VD "department.read". Mã gốc: Constants/Authorization/Permissions.cs.
/// </summary>
public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty; // phần trước dấu chấm, VD "department"
    public string Action { get; set; } = string.Empty; // phần sau dấu chấm, VD "read"
    public string? Description { get; set; }
}
