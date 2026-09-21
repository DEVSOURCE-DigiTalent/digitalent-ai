namespace DigiTalent.Application.Common.Exceptions;

/// <summary>
/// Không tìm thấy dữ liệu → API trả 404.
/// VD: throw new NotFoundException($"Department '{id}' not found.");
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
