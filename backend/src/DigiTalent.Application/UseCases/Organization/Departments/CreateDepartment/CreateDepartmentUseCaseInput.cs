// Mọi use case của Department dùng chung 1 namespace → controller chỉ cần 1 dòng using
namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Dữ liệu frontend gửi lên khi tạo phòng ban.
/// </summary>
public class CreateDepartmentUseCaseInput
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
