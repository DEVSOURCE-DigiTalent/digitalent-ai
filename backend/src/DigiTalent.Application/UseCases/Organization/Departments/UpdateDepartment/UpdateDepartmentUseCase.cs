using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Cập nhật phòng ban (gửi đủ tất cả field). Muốn archive thì dùng ArchiveDepartment.
/// </summary>
public class UpdateDepartmentUseCase : IUseCase<UpdateDepartmentUseCaseInput, UpdateDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public UpdateDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<UpdateDepartmentUseCaseOutput> ExecuteAsync(UpdateDepartmentUseCaseInput input)
    {
        UpdateDepartmentUseCaseOutput? result = null;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            result = await ExecuteCoreAsync(input);
        });
        return result!;
    }

    private async Task<UpdateDepartmentUseCaseOutput> ExecuteCoreAsync(UpdateDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban cần sửa (trong tổ chức của người gọi)
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == input.Id && d.OrganizationId == organizationId);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        if (department.Status == Statuses.MasterData.Archived)
        {
            throw new ConflictException("Archived departments cannot be edited.");
        }

        // 2. Mã mới không được trùng với phòng ban KHÁC trong cùng tổ chức
        var code = input.Code.Trim().ToUpper();
        var codeExists = await _context.Departments.AnyAsync(d =>
            d.OrganizationId == department.OrganizationId && d.Code == code && d.Id != input.Id);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        // 5. Gán giá trị mới rồi lưu (EF tự biết field nào thay đổi để UPDATE)
        var oldValues = new { department.Code, department.Name, department.ManagerEmployeeId, department.Status };
        if (input.ManagerEmployeeId.HasValue && input.ManagerEmployeeId != department.ManagerEmployeeId)
        {
            if (department.ManagerEmployeeId.HasValue)
                throw new ConflictException("Phòng ban đã có trưởng phòng.");
            await DepartmentRules.AssignManagerAsync(_context, department, input.ManagerEmployeeId.Value, _currentUser.UserId, requireDepartmentMembership: true);
        }
        department.Code = code;
        department.Name = input.Name.Trim();
        department.Description = input.Description;
        department.Status = input.Status;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync("DEPARTMENT_UPDATED", "departments", department.Id, oldValues,
            new { department.Code, department.Name, department.ManagerEmployeeId, department.Status }, department.Name);

        return new UpdateDepartmentUseCaseOutput { Id = department.Id };
    }
}
