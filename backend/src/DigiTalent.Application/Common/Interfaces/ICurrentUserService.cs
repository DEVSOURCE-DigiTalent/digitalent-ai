namespace DigiTalent.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? EmployeeId { get; }
    string? Email { get; }
    List<string> Roles { get; }
    List<string> Permissions { get; }
    List<Guid> ManagedDepartmentIds { get; }
    bool IsAuthenticated { get; }
    bool HasPermission(string permission);
}
