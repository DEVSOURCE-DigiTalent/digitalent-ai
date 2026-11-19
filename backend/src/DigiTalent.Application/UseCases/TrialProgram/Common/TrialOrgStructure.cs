using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Phòng ban và vị trí của doanh nghiệp dùng thử. Phòng ban đặt tên tùy ý; vị trí là 1 trong 5 vị trí chuẩn, dùng chung cho
/// mọi phòng ban (<see cref="StandardPositions"/>). Thêm vào DbContext, người gọi lưu trong cùng giao dịch.
/// </summary>
public sealed class TrialOrgStructure
{
    public const int MaxNameLength = 150;

    private readonly IApplicationDbContext _context;
    private readonly Guid _organizationId;
    private readonly List<Department> _departments;
    private readonly List<JobPosition> _positions;
    private readonly HashSet<string> _departmentCodes;

    private TrialOrgStructure(IApplicationDbContext context, Guid organizationId, List<Department> departments, List<JobPosition> positions,
        HashSet<string> departmentCodes)
    {
        _context = context;
        _organizationId = organizationId;
        _departments = departments;
        _positions = positions;
        _departmentCodes = departmentCodes;
    }

    public static async Task<TrialOrgStructure> LoadAsync(IApplicationDbContext context, Guid organizationId) =>
        new(context, organizationId,
            await context.Departments.Where(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active).ToListAsync(),
            await context.JobPositions.Where(p => p.OrganizationId == organizationId).ToListAsync(),
            (await context.Departments.Where(d => d.OrganizationId == organizationId).Select(d => d.Code).ToListAsync()).ToHashSet(StringComparer.OrdinalIgnoreCase));

    /// <summary>Gộp khoảng trắng thừa của tên nhập tay.</summary>
    public static string Clean(string? value) => string.Join(' ', (value ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries));

    /// <summary>Lý do tên phòng ban / vị trí không dùng được (null = hợp lệ).</summary>
    public static string? Problem(string department, string position) =>
        department.Length == 0 || position.Length == 0 ? "Thiếu phòng ban hoặc vị trí."
        : department.Length > MaxNameLength || position.Length > MaxNameLength ? "Tên phòng ban hoặc vị trí quá dài."
        : null;

    public Department Department(string name, out bool created)
    {
        var department = _departments.FirstOrDefault(d => Same(d.Name, name));
        created = department == null;
        if (department == null)
        {
            department = new Department { OrganizationId = _organizationId, Code = NextCode("PB", _departmentCodes), Name = name };
            _context.Departments.Add(department);
            _departments.Add(department);
        }

        return department;
    }

    /// <summary>The organization's position for one of the 5 standard positions, whatever the department.</summary>
    public JobPosition Position(string name)
    {
        var (position, error) = StandardPositions.Resolve(_context, _organizationId, _positions, name);
        return position ?? throw new BadRequestException(error!, "position", "INVALID_JOB_POSITION");
    }

    private static bool Same(string a, string b) => string.Equals(a.Trim(), b, StringComparison.OrdinalIgnoreCase);

    private static string NextCode(string prefix, HashSet<string> taken)
    {
        for (var i = taken.Count + 1; ; i++)
        {
            var code = $"{prefix}{i:00}";
            if (taken.Add(code))
            {
                return code;
            }
        }
    }
}
