using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Member list of the caller's organization (OW-02): accounts, employee profiles and pending invitations,
/// filtered and paged, with capability and learning metrics for the returned page.
/// </summary>
public class GetPagedMembersUseCase : IUseCase<GetPagedMembersUseCaseInput, GetPagedMembersUseCaseOutput>
{
    private readonly ICurrentUser _currentUser;
    private readonly MemberDirectory _directory;

    public GetPagedMembersUseCase(ICurrentUser currentUser, MemberDirectory directory)
    {
        _currentUser = currentUser;
        _directory = directory;
    }

    public async Task<GetPagedMembersUseCaseOutput> ExecuteAsync(GetPagedMembersUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var members = await _directory.ListAsync(organizationId);

        // 1. Filters (applied in memory, see MemberDirectory)
        IEnumerable<MemberListItem> query = members;
        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            query = query.Where(m => m.Status == input.Status);
        }

        if (!string.IsNullOrWhiteSpace(input.Role))
        {
            var role = input.Role.Trim().ToUpperInvariant();
            var roleCodes = MemberRoles.RoleCodesOf(role);
            query = query.Where(m => m.Roles.Contains(role) || m.RoleCodes.Any(roleCodes.Contains));
        }

        if (input.DepartmentId.HasValue)
        {
            query = query.Where(m => m.DepartmentId == input.DepartmentId);
        }

        if (input.JobPositionId.HasValue)
        {
            query = query.Where(m => m.JobPositionId == input.JobPositionId);
        }

        if (!string.IsNullOrWhiteSpace(input.JobGrade))
        {
            query = query.Where(m => m.JobGrade == input.JobGrade);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim();
            query = query.Where(m => Contains(m.FullName, keyword) || Contains(m.Email, keyword) || Contains(m.EmployeeCode, keyword));
        }

        var filtered = query.ToList();

        // 2. Page, then load the metrics of that page only
        var items = filtered
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .ToList();
        await _directory.AddMetricsAsync(items);

        return new GetPagedMembersUseCaseOutput
        {
            Items = items,
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = filtered.Count,
        };
    }

    private static bool Contains(string? value, string keyword) =>
        value != null && value.Contains(keyword, StringComparison.OrdinalIgnoreCase);
}
