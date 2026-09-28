using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>
/// Danh sách snapshot skill gap trong phạm vi người gọi, sắp theo số năng lực còn thiếu giảm dần rồi họ tên.
/// Mặc định chỉ lấy snapshot mới nhất của mỗi nhân viên (màn hình Team Skill Gap).
/// </summary>
public class GetSkillGapRunsUseCase : IUseCase<GetSkillGapRunsUseCaseInput, GetSkillGapRunsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunReader _runReader;

    public GetSkillGapRunsUseCase(IApplicationDbContext context, EmployeeScope employeeScope, SkillGapRunReader runReader)
    {
        _context = context;
        _employeeScope = employeeScope;
        _runReader = runReader;
    }

    public async Task<GetSkillGapRunsUseCaseOutput> ExecuteAsync(GetSkillGapRunsUseCaseInput input)
    {
        var employees = _employeeScope.VisibleEmployees();

        if (input.EmployeeId.HasValue)
        {
            employees = employees.Where(e => e.Id == input.EmployeeId.Value);
        }

        if (input.DepartmentId.HasValue)
        {
            employees = employees.Where(e => e.DepartmentId == input.DepartmentId.Value);
        }

        if (input.JobPositionId.HasValue)
        {
            employees = employees.Where(e => e.JobPositionId == input.JobPositionId.Value);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var keyword = input.Search.Trim().ToLower();
            employees = employees.Where(e => e.FullName.ToLower().Contains(keyword) || e.EmployeeCode.ToLower().Contains(keyword));
        }

        var runs = _context.SkillGapRuns.AsQueryable();
        if (input.LatestOnly)
        {
            // So theo Id (tie-break) thay vì "GeneratedAt == Max": 2 run trùng thời điểm không làm nhân đôi dòng
            runs = runs.Where(r => r.Id == _context.SkillGapRuns
                .Where(x => x.EmployeeId == r.EmployeeId)
                .OrderByDescending(x => x.GeneratedAt)
                .ThenByDescending(x => x.Id)
                .Select(x => x.Id)
                .First());
        }

        var headers = _runReader.Headers(employees, runs);
        var totalItems = await headers.CountAsync();
        var page = await headers
            .OrderByDescending(h => h.GapCount)
            .ThenBy(h => h.EmployeeName)
            .ThenByDescending(h => h.GeneratedAt)
            .Skip((input.PageIndex - 1) * input.PageSize)
            .Take(input.PageSize)
            .ToListAsync();

        return new GetSkillGapRunsUseCaseOutput
        {
            Items = page.Select(h => _runReader.FillListItem(h, new SkillGapRunListItem())).ToList(),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = totalItems,
        };
    }
}
