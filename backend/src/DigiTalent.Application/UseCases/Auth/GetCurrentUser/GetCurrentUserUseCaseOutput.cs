namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// FE dùng Roles để chọn menu, Permissions để ẩn/hiện nút.
/// FullName = users.display_name (giữ tên "fullName" cho khớp FE).
/// </summary>
public class GetCurrentUserUseCaseOutput
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public Guid? EmployeeId { get; set; } // null = tài khoản không gắn hồ sơ nhân sự (VD: admin)
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}
