using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Tạo phòng ban mới.
/// </summary>
public class CreateDepartmentUseCase : IUseCase<CreateDepartmentUseCaseInput, CreateDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateDepartmentUseCaseOutput> ExecuteAsync(CreateDepartmentUseCaseInput input)
    {
        // 1. Phòng ban luôn thuộc 1 tổ chức — lấy tổ chức của người đang đăng nhập
        var organizationId = _currentUser.OrganizationId
            ?? throw new ForbiddenException("Your account is not linked to any organization.");

        // 2. Chuẩn hóa mã: bỏ khoảng trắng, viết HOA (tránh "it" và "IT" bị coi là 2 mã khác nhau)
        var code = input.Code.Trim().ToUpper();

        // 3. Kiểm tra nghiệp vụ: mã không được trùng TRONG CÙNG tổ chức
        var codeExists = await _context.Departments
            .AnyAsync(d => d.OrganizationId == organizationId && d.Code == code);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        // 4. Tạo entity và lưu xuống database
        var department = new Department
        {
            OrganizationId = organizationId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description,
            Status = DepartmentStatuses.Active,
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        // 5. Trả kết quả
        return new CreateDepartmentUseCaseOutput { Id = department.Id };
    }
}
