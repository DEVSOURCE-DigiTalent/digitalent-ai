using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Departments;

/// <summary>
/// Lưu trữ (archive) phòng ban — KHÔNG xóa cứng, vì lịch sử đào tạo/đánh giá còn tham chiếu tới.
/// Chỉ archive được khi không còn nhân viên và không còn phòng ban con đang hoạt động.
/// </summary>
public class ArchiveDepartmentUseCase : IUseCase<ArchiveDepartmentUseCaseInput, ArchiveDepartmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ArchiveDepartmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ArchiveDepartmentUseCaseOutput> ExecuteAsync(ArchiveDepartmentUseCaseInput input)
    {
        // 1. Tìm phòng ban trong tổ chức của người gọi
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == input.Id && d.OrganizationId == organizationId);
        if (department == null)
        {
            throw new NotFoundException($"Department '{input.Id}' not found.");
        }

        if (department.Status == Statuses.MasterData.Archived)
        {
            return new ArchiveDepartmentUseCaseOutput { Id = department.Id };
        }

        // 2. Còn nhân viên (chưa archive) → không cho archive
        var hasEmployees = await _context.Employees
            .AnyAsync(e => e.DepartmentId == department.Id && e.Status != Statuses.Employee.Archived);
        if (hasEmployees)
        {
            throw new ConflictException("Department still has employees. Transfer them before archiving.");
        }

        // 3. Còn phòng ban con chưa archive → không cho archive
        var hasActiveChildren = await _context.Departments
            .AnyAsync(d => d.ParentDepartmentId == department.Id && d.Status != Statuses.MasterData.Archived);
        if (hasActiveChildren)
        {
            throw new ConflictException("Department still has sub-departments. Archive or move them first.");
        }

        // 4. Đổi trạng thái rồi lưu
        department.Status = Statuses.MasterData.Archived;
        await _context.SaveChangesAsync();

        return new ArchiveDepartmentUseCaseOutput { Id = department.Id };
    }
}
