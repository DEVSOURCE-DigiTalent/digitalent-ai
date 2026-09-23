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
/// Quyền của từng role tra trong bảng RolePermissions (Domain).
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


    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var currentUser = context.HttpContext.RequestServices.GetRequiredService<ICurrentUser>();

        // 1. Chưa đăng nhập → 401
        if (!currentUser.IsAuthenticated)
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("Please log in."))
            {
                StatusCode = StatusCodes.Status401Unauthorized,
            };
            return Task.CompletedTask;
        }

        // 2. Không có quyền nào trong danh sách → 403 (SYSTEM_ADMIN được RolePermissions cho qua)
        if (!_permissions.Any(currentUser.HasPermission))
        {
            context.Result = new ObjectResult(ApiResponse<object>.Fail("You do not have permission to do this."))
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
        }

        return Task.CompletedTask;
    }
}
