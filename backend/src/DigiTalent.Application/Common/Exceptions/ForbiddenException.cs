namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Có đăng nhập nhưng không được phép làm việc này → API trả 403.
/// VD: tài khoản bị khóa, manager xem nhân viên phòng ban khác.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
