using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Cập nhật phòng ban (gửi đủ tất cả field).
/// </summary>
public class UpdateDepartmentUseCase : IUseCase<UpdateDepartmentUseCaseInput, UpdateDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public UpdateDepartmentUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateDepartmentUseCaseOutput> ExecuteAsync(UpdateDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban cần sửa
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == input.Id);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        // 2. Mã mới không được trùng với phòng ban KHÁC (d.Id != input.Id)
        var code = input.Code.Trim().ToUpper();
        var codeExists = await _context.Departments.AnyAsync(d => d.Code == code && d.Id != input.Id);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        // 3. Gán giá trị mới rồi lưu (EF tự biết field nào thay đổi để UPDATE)
        department.Code = code;
        department.Name = input.Name.Trim();
        department.Description = input.Description;
        department.IsActive = input.IsActive;

        await _context.SaveChangesAsync();

        return new UpdateDepartmentUseCaseOutput { Id = department.Id };
    }
}
