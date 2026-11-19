using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Departments;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Employees;

/// <summary>
/// Cập nhật thông tin hồ sơ nhân viên trong tổ chức của người gọi.
/// </summary>
public class UpdateEmployeeUseCase : IUseCase<UpdateEmployeeUseCaseInput, UpdateEmployeeUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateEmployeeUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateEmployeeUseCaseOutput> ExecuteAsync(UpdateEmployeeUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        // 1. Tìm nhân viên cần sửa
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == input.Id && e.OrganizationId == organizationId);
        if (employee == null)
        {
            throw new NotFoundException($"Employee '{input.Id}' not found.");
        }

        if (employee.Status == Statuses.Employee.Archived)
        {
            throw new ConflictException("Archived employees cannot be edited.");
        }

        // 2. Kiểm tra trùng mã nhân sự với nhân sự khác trong tổ chức
        var code = input.EmployeeCode.Trim().ToUpper();
        var codeExists = await _context.Employees.AnyAsync(e =>
            e.OrganizationId == organizationId && e.EmployeeCode == code && e.Id != input.Id);
        if (codeExists)
        {
            throw new ConflictException($"Employee code '{code}' already exists.");
        }

        // 3. Kiểm tra trùng work email với nhân sự khác trong tổ chức (nếu có cung cấp)
        var email = string.IsNullOrWhiteSpace(input.WorkEmail) ? null : input.WorkEmail.Trim().ToLower();
        if (!string.IsNullOrEmpty(email))
        {
            var emailExists = await _context.Employees.AnyAsync(e =>
                e.OrganizationId == organizationId && e.WorkEmail == email && e.Id != input.Id);
            if (emailExists)
            {
                throw new ConflictException($"Work email '{email}' already exists.");
            }
        }

        // 4. Phòng ban phải tồn tại trong tổ chức và chưa bị archive
        var departmentExists = await _context.Departments
            .AnyAsync(d => d.Id == input.DepartmentId && d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived);
        if (!departmentExists)
        {
            throw new BadRequestException($"Department '{input.DepartmentId}' does not exist or is archived.");
        }

        // 5. Vị trí công việc (nếu có) phải tồn tại trong tổ chức và chưa bị archive
        var positionId = input.PositionId ?? input.JobPositionId;
        if (positionId.HasValue && positionId != employee.JobPositionId)
        {
            var positionExists = await _context.JobPositions
                .AnyAsync(p => p.Id == positionId.Value && p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived);
            if (!positionExists)
            {
                throw new BadRequestException($"Job position '{positionId.Value}' does not exist or is archived.");
            }
        }

        var changesManagerEligibility = input.DepartmentId != employee.DepartmentId || input.UserId != employee.UserId
            || (!string.IsNullOrWhiteSpace(input.Status) && input.Status.Trim().ToUpperInvariant() != Statuses.Employee.Active);
        if (changesManagerEligibility)
            await DepartmentRules.EnsureManagerCanChangePlacementAsync(_context, employee.Id, organizationId);

        var managerId = await DepartmentRules.ResolveDirectManagerAsync(_context, input.DepartmentId, input.DirectManagerId, employee.Id);

        // 7. Tài khoản user (nếu có) phải tồn tại và chưa được gán cho nhân sự khác
        if (input.UserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == input.UserId.Value && (u.OrganizationId == null || u.OrganizationId == organizationId));
            if (!userExists)
            {
                throw new BadRequestException($"User '{input.UserId.Value}' does not exist.");
            }

            var userAssigned = await _context.Employees
                .AnyAsync(e => e.UserId == input.UserId.Value && e.Id != input.Id);
            if (userAssigned)
            {
                throw new ConflictException($"User '{input.UserId.Value}' is already assigned to another employee profile.");
            }
        }

        // 8. Cập nhật các trường
        var previousPositionId = employee.JobPositionId;
        employee.EmployeeCode = code;
        employee.FullName = input.FullName.Trim();
        employee.DepartmentId = input.DepartmentId;
        employee.JobPositionId = positionId;
        employee.DirectManagerId = managerId;
        employee.WorkEmail = email;
        employee.Phone = string.IsNullOrWhiteSpace(input.Phone) ? null : input.Phone.Trim();
        employee.JoinedAt = input.JoinedAt;
        employee.UserId = input.UserId;

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            employee.Status = input.Status.Trim().ToUpper();
        }

        // 9. Đổi vị trí → tính lại skill gap theo tiêu chuẩn của vị trí mới (Sprint 3, domain event)
        if (positionId.HasValue && positionId != previousPositionId)
        {
            _context.AddDomainEvent(new EmployeeJobPositionChanged(employee.Id, previousPositionId, positionId.Value));
        }

        await _context.SaveChangesAsync();

        return new UpdateEmployeeUseCaseOutput { Id = employee.Id };
    }
}
