namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// BẢNG PHÂN QUYỀN: role nào được làm gì (chép từ bảng trong doc 09 mục 6).
/// SYSTEM_ADMIN có mọi quyền nên không cần liệt kê.
///
/// Token chỉ chứa role của user. Mỗi request, backend tra bảng này để biết user có quyền hay không.
/// </summary>
public static class RolePermissions
{
    private static readonly Dictionary<string, string[]> Map = new()
    {
        [Roles.HrManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
            Permissions.Department.CreateUpdate,
        },
        [Roles.DepartmentManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
        },
        [Roles.Trainer] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
        },
        [Roles.Employee] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Department.Read,
        },
        [Roles.CertificateVerifier] = new[]
        {
            Permissions.Account.ViewOwn,
        },
    };

    /// <summary>
    /// Kiểm tra: trong các role của user, có role nào được quyền <paramref name="permission"/> không.
    /// </summary>
    public static bool HasPermission(IEnumerable<string> roles, string permission)
    {
        if (roles.Contains(Roles.SystemAdmin))
        {
            return true;
        }

        return GetPermissions(roles).Contains(permission);
    }

    /// <summary>
    /// Gộp tất cả quyền từ các role của user (trả cho frontend để ẩn/hiện nút).
    /// </summary>
    public static List<string> GetPermissions(IEnumerable<string> roles)
    {
        if (roles.Contains(Roles.SystemAdmin))
        {
            return Map.Values.SelectMany(p => p).Distinct().ToList();
        }

        return roles
            .Where(role => Map.ContainsKey(role))
            .SelectMany(role => Map[role])
            .Distinct()
            .ToList();
    }
}
