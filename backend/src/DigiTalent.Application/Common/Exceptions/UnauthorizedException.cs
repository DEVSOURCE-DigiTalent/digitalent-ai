namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Sai thông tin đăng nhập → 401. (Đã đăng nhập nhưng không đủ quyền thì dùng ForbiddenException → 403.)
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
