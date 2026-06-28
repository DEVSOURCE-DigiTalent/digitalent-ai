using DigiTalent.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace DigiTalent.Api.Authorization;

/// <summary>
/// Authorization handler that checks if the current user has the required permission.
/// Registered as a singleton; uses ICurrentUserService (scoped) via DI.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ICurrentUserService _currentUser;

    public PermissionAuthorizationHandler(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (!_currentUser.IsAuthenticated)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        if (_currentUser.HasPermission(requirement.PermissionCode))
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail();
        }

        return Task.CompletedTask;
    }
}
