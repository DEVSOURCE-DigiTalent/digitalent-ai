using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Tạo phòng ban mới trong tổ chức của người gọi.
/// </summary>
public class CreateDepartmentUseCase : IUseCase<CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public CreateDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<CreateDepartmentUseCaseOutput> ExecuteAsync(CreateDepartmentUseCaseInput input)
    {
        CreateDepartmentUseCaseOutput? result = null;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            result = await ExecuteCoreAsync(input);
        });
        return result!;
    }

    private async Task<CreateDepartmentUseCaseOutput> ExecuteCoreAsync(CreateDepartmentUseCaseInput input)
    {
        // 1. Phòng ban luôn thuộc tổ chức của người tạo
        var organizationId = _currentUser.GetRequiredOrganizationId();

        // 2. Chuẩn hóa mã: bỏ khoảng trắng, viết HOA (tránh "it" và "IT" bị coi là 2 mã khác nhau)
        var code = input.Code.Trim().ToUpper();

        // 3. Kiểm tra nghiệp vụ: mã không trùng trong cùng tổ chức
        var codeExists = await _context.Departments
            .AnyAsync(d => d.OrganizationId == organizationId && d.Code == code);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        if (!input.ManagerEmployeeId.HasValue)
            throw new BadRequestException("Cần chọn trưởng phòng trước khi tạo phòng ban.", "managerEmployeeId", "INVALID_MANAGER");

        // 6. Tạo entity và lưu xuống database
        var department = new Department
        {
            OrganizationId = organizationId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description,
            Status = Statuses.MasterData.Active,
        };

        _context.Departments.Add(department);
        await DepartmentRules.AssignManagerAsync(_context, department, input.ManagerEmployeeId.Value, _currentUser.UserId, requireDepartmentMembership: false);
        await _context.SaveChangesAsync();

        // 7. Ghi nhật ký (sau khi lưu xong — AuditService tự SaveChanges)
        await _auditService.LogAsync("DEPARTMENT_CREATED", "departments", department.Id,
            newValues: new { department.Code, department.Name, department.ManagerEmployeeId }, entityLabel: department.Name);

        // 8. Trả kết quả
        return new CreateDepartmentUseCaseOutput { Id = department.Id };
    }
}
