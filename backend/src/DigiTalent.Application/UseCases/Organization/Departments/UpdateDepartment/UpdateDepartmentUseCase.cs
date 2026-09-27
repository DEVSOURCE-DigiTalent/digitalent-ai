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
    private readonly ICurrentUser _currentUser;

    public UpdateDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateDepartmentUseCaseOutput> ExecuteAsync(UpdateDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban cần sửa (trong tổ chức của user)
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == input.Id && d.OrganizationId == _currentUser.OrganizationId);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        // 2. Mã mới không được trùng với phòng ban KHÁC trong cùng tổ chức
        var code = input.Code.Trim().ToUpper();
        var codeExists = await _context.Departments
            .AnyAsync(d => d.OrganizationId == department.OrganizationId && d.Code == code && d.Id != input.Id);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        // 3. Gán giá trị mới rồi lưu (EF tự biết field nào thay đổi để UPDATE)
        department.Code = code;
        department.Name = input.Name.Trim();
        department.Description = input.Description;
        department.Status = input.Status;

        await _context.SaveChangesAsync();

        return new UpdateDepartmentUseCaseOutput { Id = department.Id };
    }
}
