using DigiTalent.Domain.Common;

// Mọi entity dùng chung 1 namespace để chỉ cần 1 dòng using
namespace DigiTalent.Domain.Entities;

/// <summary>
/// Phòng ban trong tổ chức.
/// </summary>
public class Department : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
