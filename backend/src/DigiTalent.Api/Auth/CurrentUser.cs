using DigiTalent.Application.Common.Interfaces;

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

    public Guid? UserId => ReadGuidClaim("sub");

    public Guid? OrganizationId => ReadGuidClaim("org");

    public List<string> Roles =>
        _httpContextAccessor.HttpContext?.User.FindAll("role").Select(c => c.Value).ToList() ?? new List<string>();

    private Guid? ReadGuidClaim(string claimName)
    {
        var value = _httpContextAccessor.HttpContext?.User.FindFirst(claimName)?.Value;
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
