using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

/// <summary>
/// Workforce list (OW-10 people of a position, OW-19): employees in the caller's scope with their latest skill gap
/// snapshot and course progress, the most at risk first (most HIGH gaps, then most gaps, then name).
/// Gap and learning filters need the computed values, so rows are built for the whole scope and paged in memory.
/// </summary>
public class GetWorkforceUseCase : IUseCase<GetWorkforceUseCaseInput, GetWorkforceUseCaseOutput>
{
    private readonly EmployeeScope _employeeScope;
    private readonly WorkforceReader _reader;

    public GetWorkforceUseCase(EmployeeScope employeeScope, WorkforceReader reader)
    {
        _employeeScope = employeeScope;
        _reader = reader;
    }

    public async Task<GetWorkforceUseCaseOutput> ExecuteAsync(GetWorkforceUseCaseInput input)
    {
        var employees = _employeeScope.VisibleEmployees();

        if (string.IsNullOrWhiteSpace(input.Status))
        {
            employees = employees.Where(e => e.Status == Statuses.Employee.Active || e.Status == Statuses.Employee.Inactive);
        }
        else
        {
            var status = input.Status.Trim().ToUpperInvariant();
            employees = employees.Where(e => e.Status == status);
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

        var rows = (await _reader.LoadRowsAsync(employees))
            .Where(row => MatchesGap(row, input.Gap) && MatchesLearning(row, input.Learning))
            .OrderByDescending(row => row.HighCount ?? -1)
            .ThenByDescending(row => row.GapCount ?? -1)
            .ThenBy(row => row.FullName, NameOrder.Vietnamese)
            .ToList();

        return new GetWorkforceUseCaseOutput
        {
            Items = rows.Skip((input.PageIndex - 1) * input.PageSize).Take(input.PageSize).ToList(),
            PageIndex = input.PageIndex,
            PageSize = input.PageSize,
            TotalItems = rows.Count,
        };
    }

    private static bool MatchesGap(WorkforceRow row, string? gap) => gap?.ToUpperInvariant() switch
    {
        "HIGH" => row.HighCount > 0,
        "ANY" => row.GapCount > 0,
        "NONE" => row.HasSnapshot && row.GapCount == 0,
        "UNKNOWN" => !row.HasSnapshot,
        _ => true,
    };

    private static bool MatchesLearning(WorkforceRow row, string? learning) => learning?.ToUpperInvariant() switch
    {
        "OVERDUE" => row.OverdueCourses > 0,
        "ACTIVE" => row.ActiveCourses > 0,
        "NONE" => row.ActiveCourses == 0,
        _ => true,
    };
}
