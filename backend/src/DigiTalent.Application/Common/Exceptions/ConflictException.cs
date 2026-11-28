namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Vi phạm quy tắc nghiệp vụ / trùng dữ liệu → API trả 409.
/// VD: mã phòng ban đã tồn tại, không được xóa phòng ban còn nhân viên...
/// Có thể kèm mã máy (VD SIGN_JOB_ALREADY_RUNNING), trả về trong errors[].message như BadRequestException.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }

    public ConflictException(string message, string field, string code) : base(message)
    {
        Field = field;
        Code = code;
    }

    public string? Field { get; }

    public string? Code { get; }
}
