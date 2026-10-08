using DigiTalent.Api.Common;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Gắn lên action của controller để yêu cầu quyền. Chạy TRƯỚC khi vào action:
///   - Chưa đăng nhập / token sai / hết hạn → 401
///   - Tài khoản đã bị khóa / vô hiệu hóa    → 401
///   - Đã đăng nhập nhưng không có quyền     → 403
///   - Có quyền                              → cho vào action
///
/// Quyền của từng role đọc từ database (bảng role_permissions) qua IPermissionService.
/// Every role, including PLATFORM_ADMIN, must hold an explicit permission.
///
/// VD: [HasPermission(Permissions.Department.CreateUpdate)]
/// Truyền nhiều mã → chỉ cần có 1 trong các mã là được.
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
        var services = context.HttpContext.RequestServices;
        var currentUser = services.GetRequiredService<ICurrentUser>();

        // 1. Chưa đăng nhập → 401
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("Please log in."))
            {
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return;
        }

        // 2. Token còn hạn nhưng tài khoản đã bị khóa / vô hiệu hóa → 401 (buộc đăng nhập lại)
        var permissionService = services.GetRequiredService<IPermissionService>();
        if (currentUser.UserId == null || !await permissionService.IsAccountUsableAsync(currentUser.UserId.Value))
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("Your session is no longer valid. Please log in again."))
            {
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return;
        }

        // 3. Không có quyền nào trong danh sách → 403
        if (!await permissionService.HasAnyAsync(currentUser.Roles, _permissions))
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("You do not have permission to do this."))
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
        }
    }
}
