namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Yêu cầu không hợp lệ mà validator không bắt được (cần đọc database mới biết) → API trả 400.
/// VD: sai email hoặc mật khẩu khi đăng nhập.
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}
