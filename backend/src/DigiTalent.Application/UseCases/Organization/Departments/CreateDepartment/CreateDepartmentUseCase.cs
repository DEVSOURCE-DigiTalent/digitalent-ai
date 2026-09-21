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

    public CreateDepartmentUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateDepartmentUseCaseOutput> ExecuteAsync(CreateDepartmentUseCaseInput input)
    {
        // 1. Chuẩn hóa mã: bỏ khoảng trắng, viết HOA (tránh "it" và "IT" bị coi là 2 mã khác nhau)
        var code = input.Code.Trim().ToUpper();

        // 2. Kiểm tra nghiệp vụ: mã không được trùng
        var codeExists = await _context.Departments.AnyAsync(d => d.Code == code);
        if (codeExists)
        {
            throw new ConflictException($"Department code '{code}' already exists.");
        }

        // 3. Tạo entity và lưu xuống database
        var department = new Department
        {
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description,
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        // 4. Trả kết quả
        return new CreateDepartmentUseCaseOutput { Id = department.Id };
    }
}
