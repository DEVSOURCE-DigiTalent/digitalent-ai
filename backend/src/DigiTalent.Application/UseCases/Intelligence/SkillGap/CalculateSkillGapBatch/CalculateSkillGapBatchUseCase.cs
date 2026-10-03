using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>
/// Tính skill gap cho mọi nhân viên ACTIVE trong phạm vi người gọi (lọc thêm theo phòng ban / vị trí).
/// Department Manager chỉ quét được phòng của mình. Nhân viên không tính được → nằm trong danh sách Skipped kèm lý do.
/// </summary>
public class CalculateSkillGapBatchUseCase : IUseCase<CalculateSkillGapBatchUseCaseInput, CalculateSkillGapBatchUseCaseOutput>
{
    public const int MaxEmployeesPerBatch = 500;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunService _runService;

    public CalculateSkillGapBatchUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        SkillGapRunService runService)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _runService = runService;
    }

    public async Task<CalculateSkillGapBatchUseCaseOutput> ExecuteAsync(CalculateSkillGapBatchUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _employeeScope.VisibleEmployees().Where(e => e.Status == Statuses.Employee.Active);

        if (input.DepartmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == input.DepartmentId.Value);
        }

        if (input.JobPositionId.HasValue)
        {
            query = query.Where(e => e.JobPositionId == input.JobPositionId.Value);
        }

        if (await query.CountAsync() > MaxEmployeesPerBatch)
        {
            throw new BadRequestException(
                $"Too many employees for one batch (max {MaxEmployeesPerBatch}). Filter by department or job position.",
                "departmentId",
                "BATCH_TOO_LARGE");
        }

        var employees = await query.AsNoTracking().OrderBy(e => e.EmployeeCode).ToListAsync();
        var outcomes = await _runService.StageRunsAsync(employees, organizationId, Statuses.SkillGapGeneratedBy.UserRequest);
        await _context.SaveChangesAsync();

        return new CalculateSkillGapBatchUseCaseOutput
        {
            CalculatedCount = outcomes.Count(o => o.Run != null),
            Runs = outcomes
                .Where(o => o.Run != null)
                .Select(o => new CalculatedSkillGapRun { EmployeeId = o.Employee.Id, RunId = o.Run!.Id, GapCount = o.Run.GapCount })
                .ToList(),
            Skipped = outcomes
                .Where(o => o.SkipReason != null)
                .Select(o => new SkippedEmployee { EmployeeId = o.Employee.Id, EmployeeName = o.Employee.FullName, Reason = o.SkipReason! })
                .ToList(),
        };
    }
}
