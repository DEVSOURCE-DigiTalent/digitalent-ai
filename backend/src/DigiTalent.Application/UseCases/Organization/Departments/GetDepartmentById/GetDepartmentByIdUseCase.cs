using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Xem chi tiết 1 phòng ban (trong tổ chức của người gọi).
/// </summary>
public class GetDepartmentByIdUseCase : IUseCase<GetDepartmentByIdUseCaseInput, GetDepartmentByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetDepartmentByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetDepartmentByIdUseCaseOutput> ExecuteAsync(GetDepartmentByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        // Select thẳng sang Output → chỉ lấy đúng các cột cần, không load cả entity
        var department = await _context.Departments
            .Where(d => d.Id == input.Id && d.OrganizationId == organizationId)
            .Select(d => new GetDepartmentByIdUseCaseOutput
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description,
                ParentDepartmentId = d.ParentDepartmentId,
                ParentDepartmentName = _context.Departments
                    .Where(p => p.Id == d.ParentDepartmentId)
                    .Select(p => p.Name)
                    .FirstOrDefault(),
                ManagerEmployeeId = d.ManagerEmployeeId,
                ManagerName = _context.Employees
                    .Where(e => e.Id == d.ManagerEmployeeId)
                    .Select(e => e.FullName)
                    .FirstOrDefault(),
                Status = d.Status,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
            })
            .FirstOrDefaultAsync();

        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        return department;
    }
}
