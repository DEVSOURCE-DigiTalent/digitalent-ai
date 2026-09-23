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

    public DeleteDepartmentUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteDepartmentUseCaseOutput> ExecuteAsync(DeleteDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban cần xóa
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == input.Id);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        // 2. Kiểm tra nghiệp vụ trước khi xóa.
        //    Khi có bảng Employee: nếu phòng ban còn nhân viên thì
        //    throw new ConflictException("...") để không cho xóa.

        // 3. Xóa và lưu
        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return new DeleteDepartmentUseCaseOutput { Id = department.Id };
    }
}
