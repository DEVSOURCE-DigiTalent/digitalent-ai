namespace DigiTalent.Application.UseCases.Auth;

/// <summary>
/// FE dùng Roles để chọn menu, Permissions để ẩn/hiện nút.
/// </summary>
public class GetCurrentUserUseCaseOutput
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}
