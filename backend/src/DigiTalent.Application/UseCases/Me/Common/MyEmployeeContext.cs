using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// Hồ sơ nhân viên của người đang đăng nhập — mọi API /me/* chỉ đọc/ghi dữ liệu của chính hồ sơ này.
/// Tra theo user trong DB (không tin claim emp_id: hồ sơ có thể được tạo/đổi sau khi đăng nhập).
/// Đăng ký Scoped → mỗi request chỉ truy vấn 1 lần.
/// </summary>
public class MyEmployeeContext
{
    public const string NoEmployeeProfileMessage = "Tài khoản của bạn chưa được gắn hồ sơ nhân viên. Vui lòng liên hệ quản trị viên.";

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private Employee? _employee;

    public MyEmployeeContext(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public Guid UserId => _currentUser.UserId ?? throw new ForbiddenException(NoEmployeeProfileMessage);

    public async Task<Employee> GetAsync()
    {
        if (_employee != null)
        {
            return _employee;
        }

        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = UserId;

        _employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.OrganizationId == organizationId)
            ?? throw new ForbiddenException(NoEmployeeProfileMessage);

        return _employee;
    }
}
