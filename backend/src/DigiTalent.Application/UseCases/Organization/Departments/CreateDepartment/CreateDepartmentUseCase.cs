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

    public CreateDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateDepartmentUseCaseOutput> ExecuteAsync(CreateDepartmentUseCaseInput input)
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

        // 4. Phòng ban cha (nếu có) phải cùng tổ chức và chưa bị archive
        if (input.ParentDepartmentId.HasValue)
        {
            var parentExists = await _context.Departments.AnyAsync(d =>
                d.Id == input.ParentDepartmentId.Value
                && d.OrganizationId == organizationId
                && d.Status != Statuses.MasterData.Archived);
            if (!parentExists)
            {
                throw new BadRequestException("Parent department does not exist or is archived.");
            }
        }

        // 5. Tạo entity và lưu xuống database
        var department = new Department
        {
            OrganizationId = organizationId,
            ParentDepartmentId = input.ParentDepartmentId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description,
            Status = Statuses.MasterData.Active,
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        // 6. Trả kết quả
        return new CreateDepartmentUseCaseOutput { Id = department.Id };
    }
}
