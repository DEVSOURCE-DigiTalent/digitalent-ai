namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Vi phạm quy tắc nghiệp vụ / trùng dữ liệu → API trả 409.
/// VD: mã phòng ban đã tồn tại, không được xóa phòng ban còn nhân viên...
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
