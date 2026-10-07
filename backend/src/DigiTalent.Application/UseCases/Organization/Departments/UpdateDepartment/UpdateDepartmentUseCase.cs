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

        // 3. Phòng ban cha hợp lệ và không tạo vòng lặp (cha không được là chính nó hoặc phòng ban con của nó)
        if (input.ParentDepartmentId.HasValue)
        {
            await EnsureValidParentAsync(department.Id, department.OrganizationId, input.ParentDepartmentId.Value);
        }

        // 4. Trưởng phòng mới (nếu đổi) phải là nhân viên ACTIVE cùng tổ chức
        if (input.ManagerEmployeeId.HasValue && input.ManagerEmployeeId != department.ManagerEmployeeId)
        {
            await DepartmentRules.EnsureValidManagerAsync(_context, department.OrganizationId, input.ManagerEmployeeId.Value);
        }

        // 5. Gán giá trị mới rồi lưu (EF tự biết field nào thay đổi để UPDATE)
        var oldValues = new { department.Code, department.Name, department.ManagerEmployeeId, department.Status };
        department.Code = code;
        department.Name = input.Name.Trim();
        department.Description = input.Description;
        department.ParentDepartmentId = input.ParentDepartmentId;
        department.ManagerEmployeeId = input.ManagerEmployeeId;
        department.Status = input.Status;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync("DEPARTMENT_UPDATED", "departments", department.Id, oldValues,
            new { department.Code, department.Name, department.ManagerEmployeeId, department.Status }, department.Name);

        return new UpdateDepartmentUseCaseOutput { Id = department.Id };
    }

    private async Task EnsureValidParentAsync(Guid departmentId, Guid organizationId, Guid parentId)
    {
        // Đi ngược lên từ phòng ban cha; nếu gặp lại chính phòng ban đang sửa → vòng lặp
        var visited = new HashSet<Guid>();
        Guid? currentId = parentId;
        while (currentId.HasValue)
        {
            if (currentId.Value == departmentId || !visited.Add(currentId.Value))
            {
                throw new BadRequestException("A department cannot be its own parent or sub-department.");
            }

            var current = await _context.Departments
                .Where(d => d.Id == currentId.Value && d.OrganizationId == organizationId)
                .Select(d => new { d.ParentDepartmentId, d.Status })
                .FirstOrDefaultAsync();

            if (current == null || (currentId.Value == parentId && current.Status == Statuses.MasterData.Archived))
            {
                throw new BadRequestException("Parent department does not exist or is archived.");
            }

            currentId = current.ParentDepartmentId;
        }
    }
}
