using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Phòng ban và vị trí của doanh nghiệp dùng thử. Vị trí mới chỉ dùng mã trong danh mục chuẩn.
/// Thêm vào DbContext, người gọi lưu trong cùng giao dịch.
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

    public JobPosition Position(Department department, string name)
    {
        var code = JobPositionCatalog.ResolveCode(name);
        var position = _positions.Find(p => p.DepartmentId == department.Id && p.Status == Statuses.MasterData.Active
            && (Same(p.Name, name) || Same(p.Code, name) || p.Code.Equals(code, StringComparison.OrdinalIgnoreCase)));
        if (position == null)
        {
            if (code == null || _positions.Any(p => p.DepartmentId == department.Id && p.Status != Statuses.MasterData.Archived))
                throw new BadRequestException("Vị trí công việc không thuộc phòng ban đã chọn hoặc ngoài 5 vị trí chuẩn.", "position", "INVALID_JOB_POSITION");
            position = _positions.Find(p => p.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
            if (position != null && (position.DepartmentId.HasValue || position.Status != Statuses.MasterData.Active))
                throw new BadRequestException("Vị trí chuẩn đã được dùng tại phòng khác hoặc đã ngừng sử dụng.", "position", "INVALID_JOB_POSITION");
            if (position == null)
            {
                position = new JobPosition { OrganizationId = _organizationId, Code = code, Name = JobPositionCatalog.Positions[code] };
                _context.JobPositions.Add(position);
                _positions.Add(position);
            }
            position.DepartmentId = department.Id;
        }

        return position;
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
