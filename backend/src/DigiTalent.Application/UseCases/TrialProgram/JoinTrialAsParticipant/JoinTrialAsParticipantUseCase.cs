using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /trial/me/join — chủ doanh nghiệp dùng thử tự tham gia như một nhân viên: tạo hồ sơ nhân viên (phòng ban, vị trí
/// theo tên) và thêm role EMPLOYEE cho chính tài khoản đó. Sau đó chủ doanh nghiệp làm bài đánh giá tổng hợp (mentor chấm,
/// có tên trong bảng năng lực) và học thử khóa Cơ bản cùng nhân viên. Chủ doanh nghiệp không chấm bài.
/// </summary>
public class JoinTrialAsParticipantUseCase : IUseCase<JoinTrialAsParticipantUseCaseInput, JoinTrialAsParticipantUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public JoinTrialAsParticipantUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<JoinTrialAsParticipantUseCaseOutput> ExecuteAsync(JoinTrialAsParticipantUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        var owner = await _context.Users.Include(u => u.UserRoles).FirstAsync(u => u.Id == trial.OwnerUserId);
        if (await _context.Employees.AnyAsync(e => e.UserId == owner.Id))
        {
            throw new ConflictException("Bạn đã tham gia làm bài.");
        }

        if ((await _reader.LoadParticipantsAsync(trial)).Count >= TrialProgramRules.MaxParticipants)
        {
            throw new BadRequestException($"Dùng thử tối đa {TrialProgramRules.MaxParticipants} người.", "department", "TRIAL_FULL");
        }

        var departmentName = TrialOrgStructure.Clean(input.Department);
        var positionName = TrialOrgStructure.Clean(input.Position);
        if (TrialOrgStructure.Problem(departmentName, positionName) is { } problem)
        {
            throw new BadRequestException(problem, "department", "TRIAL_PLACEMENT_INVALID");
        }

        var structure = await TrialOrgStructure.LoadAsync(_context, trial.OrganizationId);
        var employee = new Employee
        {
            OrganizationId = trial.OrganizationId,
            UserId = owner.Id,
            DepartmentId = structure.Department(departmentName).Id,
            JobPositionId = structure.Position(positionName).Id,
            EmployeeCode = await EmployeeCodeGenerator.NextAsync(_context, trial.OrganizationId),
            FullName = owner.DisplayName,
            WorkEmail = owner.Email,
        };
        _context.Employees.Add(employee);

        var employeeRoleId = await _context.Roles.Where(r => r.Code == Roles.Employee).Select(r => r.Id).FirstAsync();
        if (owner.UserRoles.All(r => r.RoleId != employeeRoleId))
        {
            owner.UserRoles.Add(new UserRole { RoleId = employeeRoleId, AssignedAt = _reader.Now, AssignedByUserId = owner.Id });
        }

        await _context.SaveChangesAsync();
        return new JoinTrialAsParticipantUseCaseOutput { EmployeeId = employee.Id };
    }
}
