using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Employees;

/// <summary>
/// Lưu trữ (archive) hồ sơ nhân viên trong tổ chức của người gọi — không xóa cứng.
/// </summary>
public class ArchiveEmployeeUseCase : IUseCase<ArchiveEmployeeUseCaseInput, ArchiveEmployeeUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ArchiveEmployeeUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ArchiveEmployeeUseCaseOutput> ExecuteAsync(ArchiveEmployeeUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == input.Id && e.OrganizationId == organizationId);
        if (employee == null)
        {
            throw new NotFoundException($"Employee '{input.Id}' not found.");
        }

        if (employee.Status == Statuses.Employee.Archived)
        {
            return new ArchiveEmployeeUseCaseOutput { Id = employee.Id };
        }

        // Không cho phép archive nếu nhân viên đang là quản lý của một phòng ban đang hoạt động
        var managesActiveDepartment = await _context.Departments
            .AnyAsync(d => d.ManagerEmployeeId == employee.Id && d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived);
        if (managesActiveDepartment)
        {
            throw new ConflictException("Cannot archive employee who is currently managing an active department.");
        }

        employee.Status = Statuses.Employee.Archived;
        await _context.SaveChangesAsync();

        return new ArchiveEmployeeUseCaseOutput { Id = employee.Id };
    }
}
