using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Access;

/// <summary>
/// The 3 enterprise roles of the "Phân quyền" screen (OW-13): plain-language description, permission codes of the
/// underlying system role (read from role_permissions), active members holding it, and whether the caller may grant it.
/// </summary>
public class GetRolesUseCase : IUseCase<GetRolesUseCaseInput, GetRolesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPermissionService _permissionService;

    public GetRolesUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPermissionService permissionService)
    {
        _context = context;
        _currentUser = currentUser;
        _permissionService = permissionService;
    }

    public async Task<GetRolesUseCaseOutput> ExecuteAsync(GetRolesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var canGrantRoles = await _permissionService.HasAnyAsync(_currentUser.Roles, new[] { Permissions.UserRole.RoleAssignBusiness });

        // System role codes of every active account of the organization
        var holders = await (
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                join user in _context.Users on userRole.UserId equals user.Id
                where user.OrganizationId == organizationId && user.Status != Statuses.User.Inactive
                select new { user.Id, role.Code })
            .ToListAsync();

        var output = new GetRolesUseCaseOutput();
        foreach (var description in RoleDescriptions.All)
        {
            var roleCodes = MemberRoles.RoleCodesOf(description.Role);
            var permissions = await _permissionService.GetPermissionsAsync(new[] { description.RoleCode });

            output.Add(new RoleSummary
            {
                Role = description.Role,
                RoleCode = description.RoleCode,
                Name = description.Name,
                Summary = description.Summary,
                Can = description.Can.ToList(),
                Permissions = permissions.OrderBy(code => code, StringComparer.Ordinal).ToList(),
                MemberCount = holders.Where(h => roleCodes.Contains(h.Code)).Select(h => h.Id).Distinct().Count(),
                Assignable = canGrantRoles,
            });
        }

        return output;
    }
}
