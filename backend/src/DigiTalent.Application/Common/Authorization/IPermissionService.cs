namespace DigiTalent.Application.Common.Authorization;

/// <summary>
/// Tra quyền của các role từ database (bảng role_permissions).
/// Dùng bởi [HasPermission] (Api) và use case GetCurrentUser.
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Mọi mã quyền của các role (SYSTEM_ADMIN → mọi quyền trong bảng permissions).
    /// </summary>
    Task<IReadOnlyCollection<string>> GetPermissionsAsync(IReadOnlyCollection<string> roleCodes);

    /// <summary>
    /// Có ít nhất 1 quyền trong danh sách không?
    /// </summary>
    Task<bool> HasAnyAsync(IReadOnlyCollection<string> roleCodes, IReadOnlyCollection<string> permissions);

    /// <summary>
    /// Tài khoản còn được dùng không (tồn tại, không INACTIVE, không đang bị khóa)?
    /// Token vẫn còn hạn nhưng tài khoản bị khóa / vô hiệu hóa giữa chừng → phải chặn ngay.
    /// </summary>
    Task<bool> IsAccountUsableAsync(Guid userId);
}
