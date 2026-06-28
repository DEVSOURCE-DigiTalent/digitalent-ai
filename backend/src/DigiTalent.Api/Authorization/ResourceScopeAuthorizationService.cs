using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Shared.Constants;

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
        if (_currentUser.Roles.Any(r => r is RoleConstants.SystemAdmin or RoleConstants.HRManager))
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
        if (_currentUser.Roles.Any(r => r is RoleConstants.SystemAdmin or RoleConstants.HRManager))
            return;

        throw new UnauthorizedAccessException("You do not have global access to this resource.");
    }

    /// <summary>
    /// Ensures the current user is a Trainer for the specified course.
    /// </summary>
    public void EnsureTrainerAccess(Guid courseId, Guid? ownerTrainerId)
    {
        if (_currentUser.Roles.Any(r => r is RoleConstants.SystemAdmin or RoleConstants.HRManager))
            return;

        if (_currentUser.EmployeeId.HasValue && ownerTrainerId == _currentUser.EmployeeId.Value)
            return;

        throw new UnauthorizedAccessException("You do not have trainer access to this course.");
    }

    /// <summary>
    /// Checks if the user has access to the given department (without throwing).
    /// </summary>
    public bool CanAccessDepartment(Guid? departmentId)
    {
        if (_currentUser.Roles.Any(r => r is RoleConstants.SystemAdmin or RoleConstants.HRManager))
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

    /// <summary>
    /// Checks if the user has GLOBAL access (without throwing).
    /// </summary>
    public bool HasGlobalAccess()
    {
        return _currentUser.Roles.Any(r => r is RoleConstants.SystemAdmin or RoleConstants.HRManager);
    }

    /// <summary>
    /// Checks if the user is a department manager (without throwing).
    /// </summary>
    public bool IsDepartmentManager()
    {
        return _currentUser.Roles.Contains(RoleConstants.DepartmentManager);
    }

    /// <summary>
    /// Checks if the user is an Employee (own-data only role).
    /// </summary>
    public bool IsEmployee()
    {
        return _currentUser.Roles.Contains(RoleConstants.Employee);
    }
}
