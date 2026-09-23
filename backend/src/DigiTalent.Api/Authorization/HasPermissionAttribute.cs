using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Gắn lên action của controller để yêu cầu quyền. Chạy TRƯỚC khi vào action:
///   - Chưa đăng nhập / token sai / hết hạn → 401
///   - Đã đăng nhập nhưng không có quyền     → 403
///   - Có quyền                              → cho vào action
///
/// Quyền của từng role đọc từ database (bảng role_permissions), có cache 5 phút.
/// SYSTEM_ADMIN luôn được đi qua.
///
/// VD: [HasPermission(Permissions.Department.CreateUpdate)]
/// Truyền nhiều mã → chỉ cần có 1 trong các mã là được (giống cm-service).
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class HasPermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string[] _permissions;

    public HasPermissionAttribute(params string[] permissions)
    {
        _permissions = permissions;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var currentUser = context.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();

        // 1. Chưa đăng nhập → 401
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("Please log in."))
            {
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return;
        }

        // 2. Admin hệ thống thì bỏ qua mọi kiểm tra
        if (currentUser.Roles.Contains(Roles.SystemAdmin))
        {
            return;
        }

        // 3. Không có quyền nào trong danh sách → 403
        var permissionReader = context.HttpContext.RequestServices.GetRequiredService<IPermissionReader>();
        var granted = await permissionReader.GetPermissionsAsync(currentUser.Roles);

        if (!_permissions.Any(granted.Contains))
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("You do not have permission to do this."))
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
        }
    }
}
