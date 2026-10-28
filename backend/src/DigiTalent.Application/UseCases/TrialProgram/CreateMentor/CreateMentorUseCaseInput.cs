namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Tài khoản mentor mới: quản trị nền tảng đặt mật khẩu ban đầu, mentor đổi lại sau khi đăng nhập.</summary>
public class CreateMentorUseCaseInput
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
