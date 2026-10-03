using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DomainRoles = DigiTalent.Domain.Constants.Authorization.Roles;

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

    public Guid? EmployeeId => ReadGuidClaim("emp_id");

    public Guid? DepartmentId => ReadGuidClaim("dept_id");

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    public List<string> Roles =>
        _httpContextAccessor.HttpContext?.User.FindAll("role").Select(c => c.Value).ToList() ?? new List<string>();

    public bool IsInRole(string roleCode) =>
        Roles.Contains(roleCode, StringComparer.OrdinalIgnoreCase);

    public bool IsAdmin =>
        IsInRole(DomainRoles.SystemAdmin) || IsInRole(DomainRoles.HrManager);

    public bool IsDepartmentManager =>
        IsInRole(DomainRoles.DepartmentManager);

    public Guid GetRequiredOrganizationId() =>
        OrganizationId ?? throw new ForbiddenException("Your account is not linked to an organization.");

    public Guid GetRequiredDepartmentId() =>
        DepartmentId ?? throw new ForbiddenException("Your account is not linked to any department.");

    private Guid? ReadGuidClaim(string claimName)
    {
        var value = _httpContextAccessor.HttpContext?.User.FindFirst(claimName)?.Value;
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
