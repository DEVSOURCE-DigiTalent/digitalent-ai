using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Employees;

/// <summary>
/// Tạo hồ sơ nhân sự mới trong tổ chức của người gọi.
/// </summary>
public class CreateEmployeeUseCase : IUseCase<CreateEmployeeUseCaseInput, CreateEmployeeUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateEmployeeUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateEmployeeUseCaseOutput> ExecuteAsync(CreateEmployeeUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var code = input.EmployeeCode.Trim().ToUpper();

        // 1. Kiểm tra trùng mã nhân viên trong cùng tổ chức
        var codeExists = await _context.Employees
            .AnyAsync(e => e.OrganizationId == organizationId && e.EmployeeCode == code);
        if (codeExists)
        {
            throw new ConflictException($"Employee code '{code}' already exists.");
        }

        // 2. Kiểm tra trùng work email trong cùng tổ chức (nếu có cung cấp)
        string? email = string.IsNullOrWhiteSpace(input.WorkEmail) ? null : input.WorkEmail.Trim().ToLower();
        if (!string.IsNullOrEmpty(email))
        {
            var emailExists = await _context.Employees
                .AnyAsync(e => e.OrganizationId == organizationId && e.WorkEmail == email);
            if (emailExists)
            {
                throw new ConflictException($"Work email '{email}' already exists.");
            }
        }

        // 3. Phòng ban phải tồn tại trong tổ chức và chưa bị archive
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Id == input.DepartmentId && d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived);
        if (!departmentExists)
        {
            throw new BadRequestException($"Department '{input.DepartmentId}' does not exist or is archived.");
        }

        // 4. Vị trí công việc (nếu có) phải tồn tại trong tổ chức và chưa bị archive
        var positionId = input.PositionId ?? input.JobPositionId;
        if (positionId.HasValue)
        {
            var positionExists = await _context.JobPositions
                .AnyAsync(p => p.Id == positionId.Value && p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived);
            if (!positionExists)
            {
                throw new BadRequestException($"Job position '{positionId.Value}' does not exist or is archived.");
            }
        }

        // 5. Quản lý trực tiếp (nếu có) phải thuộc cùng tổ chức và chưa bị archive
        if (input.DirectManagerId.HasValue)
        {
            var managerExists = await _context.Employees
                .AnyAsync(m => m.Id == input.DirectManagerId.Value && m.OrganizationId == organizationId && m.Status != Statuses.Employee.Archived);
            if (!managerExists)
            {
                throw new BadRequestException($"Direct manager '{input.DirectManagerId.Value}' does not exist or is archived.");
            }
        }

        // 6. Tài khoản user (nếu có) phải tồn tại và chưa được gán cho nhân sự khác
        if (input.UserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == input.UserId.Value && (u.OrganizationId == null || u.OrganizationId == organizationId));
            if (!userExists)
            {
                throw new BadRequestException($"User '{input.UserId.Value}' does not exist.");
            }

            var userAssigned = await _context.Employees
                .AnyAsync(e => e.UserId == input.UserId.Value);
            if (userAssigned)
            {
                throw new ConflictException($"User '{input.UserId.Value}' is already assigned to another employee profile.");
            }
        }

        // 7. Tạo entity và lưu
        var status = string.IsNullOrWhiteSpace(input.Status)
            ? Statuses.Employee.Active
            : input.Status.Trim().ToUpper();

        var employee = new Employee
        {
            OrganizationId = organizationId,
            EmployeeCode = code,
            FullName = input.FullName.Trim(),
            DepartmentId = input.DepartmentId,
            JobPositionId = positionId,
            DirectManagerId = input.DirectManagerId,
            WorkEmail = email,
            Phone = string.IsNullOrWhiteSpace(input.Phone) ? null : input.Phone.Trim(),
            JoinedAt = input.JoinedAt,
            UserId = input.UserId,
            Status = status,
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return new CreateEmployeeUseCaseOutput { Id = employee.Id };
    }
}
