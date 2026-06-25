using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Service for resource-level data scope authorization.
/// Checks whether the current user can access specific resources based on
/// department scope, ownership, or assigned content relationships.
///
/// Usage in service layer:
///   _scopeAuth.EnsureDepartmentAccess(employee.DepartmentId);
///   _scopeAuth.EnsureOwnership(resource.EmployeeId, currentUser.EmployeeId);
/// </summary>
public class ResourceScopeAuthorizationService
{
    private readonly ICurrentUserService _currentUser;

    public ResourceScopeAuthorizationService(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    /// <summary>
    /// Ensures the current user can access data belonging to the given department.
    /// Throws UnauthorizedAccessException if user lacks GLOBAL scope and is not a manager of that department.
    /// </summary>
    public void EnsureDepartmentAccess(Guid? departmentId)
    {
        if (_currentUser.Roles.Any(r => r is "SYSTEM_ADMIN" or "HR_MANAGER"))
            return;

        if (departmentId.HasValue && _currentUser.ManagedDepartmentIds.Contains(departmentId.Value))
            return;

        throw new UnauthorizedAccessException("You do not have access to data in this department.");
    }

    /// <summary>
    /// Ensures the current user is the owner of the given resource.
    /// </summary>
    public void EnsureOwnership(Guid? resourceOwnerEmployeeId, Guid? currentUserEmployeeId)
    {
        if (currentUserEmployeeId.HasValue && resourceOwnerEmployeeId == currentUserEmployeeId)
            return;

        throw new UnauthorizedAccessException("You can only access your own data.");
    }

    /// <summary>
    /// Ensures the current user has GLOBAL access (SYSTEM_ADMIN or HR_MANAGER).
    /// </summary>
    public void EnsureGlobalAccess()
    {
        if (_currentUser.Roles.Any(r => r is "SYSTEM_ADMIN" or "HR_MANAGER"))
            return;

        throw new UnauthorizedAccessException("You do not have global access to this resource.");
    }

    /// <summary>
    /// Checks if the user has access to the given department (without throwing).
    /// </summary>
    public bool CanAccessDepartment(Guid? departmentId)
    {
        if (_currentUser.Roles.Any(r => r is "SYSTEM_ADMIN" or "HR_MANAGER"))
            return true;

        if (departmentId.HasValue && _currentUser.ManagedDepartmentIds.Contains(departmentId.Value))
            return true;

        return false;
    }

    /// <summary>
    /// Checks if the user is the owner of the resource (without throwing).
    /// </summary>
    public bool IsOwner(Guid? resourceOwnerEmployeeId, Guid? currentUserEmployeeId)
    {
        return currentUserEmployeeId.HasValue && resourceOwnerEmployeeId == currentUserEmployeeId;
    }
}
