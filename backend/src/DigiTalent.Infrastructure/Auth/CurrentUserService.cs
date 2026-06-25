using System.Security.Claims;
using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DigiTalent.Infrastructure.Auth;

/// <summary>
/// Extracts current user information from the HTTP context (JWT claims).
/// Registered as Scoped so it resolves per-request.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var sub = _httpContextAccessor.HttpContext?.User.FindFirstValue("user_id")
                      ?? _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? _httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public Guid? EmployeeId
    {
        get
        {
            var empId = _httpContextAccessor.HttpContext?.User.FindFirstValue("employee_id");
            return Guid.TryParse(empId, out var id) ? id : null;
        }
    }

    public string? Email =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public string? FullName =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

    public List<string> Roles =>
        _httpContextAccessor.HttpContext?.User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .Distinct()
            .ToList() ?? new();

    public List<string> Permissions =>
        _httpContextAccessor.HttpContext?.User.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .Distinct()
            .ToList() ?? new();

    public List<Guid> ManagedDepartmentIds
    {
        get
        {
            var deptIds = _httpContextAccessor.HttpContext?.User.Claims
                .Where(c => c.Type == "department_id")
                .Select(c => c.Value)
                .ToList();

            if (deptIds == null || deptIds.Count == 0)
                return new();

            return deptIds
                .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

    public bool HasPermission(string permission) =>
        Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);
}
