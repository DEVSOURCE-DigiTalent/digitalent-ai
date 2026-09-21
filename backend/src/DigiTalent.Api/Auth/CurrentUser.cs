using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants.Authorization;

namespace DigiTalent.Api.Auth;

/// <summary>
/// Đọc thông tin user từ token của request hiện tại.
/// (Token đã được kiểm tra chữ ký + hạn dùng ở bước UseAuthentication trong Program.cs.)
/// </summary>
public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;

    public Guid? UserId
    {
        get
        {
            var sub = _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value;
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public List<string> Roles =>
        _httpContextAccessor.HttpContext?.User.FindAll("role").Select(c => c.Value).ToList() ?? new List<string>();

    public bool HasPermission(string permission)
    {
        return RolePermissions.HasPermission(Roles, permission);
    }
}
