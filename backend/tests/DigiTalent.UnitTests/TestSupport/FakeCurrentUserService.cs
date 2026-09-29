using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.UnitTests.TestSupport;

/// <summary>
/// Minimal ICurrentUserService stand-in for unit tests that exercise services
/// which accept the interface but do not depend on request-scoped identity.
/// </summary>
public class FakeCurrentUserService : ICurrentUserService
{
    public Guid? UserId { get; set; }
    public Guid? EmployeeId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<Guid> ManagedDepartmentIds { get; set; } = new();
    public bool IsAuthenticated { get; set; } = true;

    public bool HasPermission(string permission) => Permissions.Contains(permission);
}
