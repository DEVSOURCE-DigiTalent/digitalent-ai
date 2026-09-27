namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Lấy danh sách mã quyền của các role, đọc từ bảng role_permissions + permissions trong database.
/// Kết quả được cache vài phút nên không phải truy vấn ở mọi request.
/// </summary>
public interface IPermissionReader
{
    Task<HashSet<string>> GetPermissionsAsync(IEnumerable<string> roleCodes);
}
