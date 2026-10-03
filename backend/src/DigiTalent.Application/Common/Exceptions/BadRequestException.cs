namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Yêu cầu không hợp lệ mà validator không bắt được (cần đọc database mới biết) → API trả 400.
/// VD: sai email hoặc mật khẩu khi đăng nhập.
/// Có thể kèm mã lỗi theo field để frontend dịch (VD: field "employeeId", code "NO_JOB_POSITION").
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, string field, string code) : base(message)
    {
        Errors = new[] { new BadRequestError(field, code) };
    }

    public IReadOnlyList<BadRequestError> Errors { get; } = Array.Empty<BadRequestError>();
}

public sealed record BadRequestError(string Field, string Code);
