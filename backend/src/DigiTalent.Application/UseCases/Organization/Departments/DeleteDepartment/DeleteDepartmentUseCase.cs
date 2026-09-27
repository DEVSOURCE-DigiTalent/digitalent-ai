using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Xóa phòng ban.
/// </summary>
public class DeleteDepartmentUseCase : IUseCase<DeleteDepartmentUseCaseInput, DeleteDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<DeleteDepartmentUseCaseOutput> ExecuteAsync(DeleteDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban cần xóa (trong tổ chức của user)
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == input.Id && d.OrganizationId == _currentUser.OrganizationId);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        // 2. Không cho xóa khi phòng ban còn nhân viên (database cũng có khóa ngoại chặn)
        var hasEmployees = await _context.Employees.AnyAsync(e => e.DepartmentId == department.Id);
        if (hasEmployees)
        {
            throw new ConflictException("Cannot delete a department that still has employees.");
        }

        // 3. Xóa và lưu
        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return new DeleteDepartmentUseCaseOutput { Id = department.Id };
    }
}
