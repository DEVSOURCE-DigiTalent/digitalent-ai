using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Employees;

/// <summary>
/// Lấy chi tiết nhân sự theo Id trong phạm vi tổ chức của người gọi.
/// </summary>
public class GetEmployeeByIdUseCase : IUseCase<GetEmployeeByIdUseCaseInput, GetEmployeeByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetEmployeeByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetEmployeeByIdUseCaseOutput> ExecuteAsync(GetEmployeeByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var employee = await _context.Employees
            .Where(e => e.Id == input.Id && e.OrganizationId == organizationId)
            .Select(e => new GetEmployeeByIdUseCaseOutput
            {
                Id = e.Id,
                OrganizationId = e.OrganizationId,
                UserId = e.UserId,
                DepartmentId = e.DepartmentId,
                DepartmentName = _context.Departments
                    .Where(d => d.Id == e.DepartmentId)
                    .Select(d => d.Name)
                    .FirstOrDefault(),
                JobPositionId = e.JobPositionId,
                PositionName = _context.JobPositions
                    .Where(p => p.Id == e.JobPositionId)
                    .Select(p => p.Name)
                    .FirstOrDefault(),
                DirectManagerId = e.DirectManagerId,
                DirectManagerName = _context.Employees
                    .Where(m => m.Id == e.DirectManagerId)
                    .Select(m => m.FullName)
                    .FirstOrDefault(),
                EmployeeCode = e.EmployeeCode,
                FullName = e.FullName,
                WorkEmail = e.WorkEmail,
                Phone = e.Phone,
                Status = e.Status,
                JoinedAt = e.JoinedAt,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
            })
            .FirstOrDefaultAsync();

        if (employee == null)
        {
            throw new NotFoundException($"Employee '{input.Id}' not found.");
        }

        return employee;
    }
}
