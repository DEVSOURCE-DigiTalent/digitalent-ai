using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Đặt mức năng lực riêng cho một phòng ban, có thể cao hơn khóa doanh nghiệp đã có (đặt trước, mua sau: khóa chưa mua nằm
/// trên lộ trình của nhân viên và bị khóa tới khi doanh nghiệp mua). Inherit = true bỏ mức riêng, nhân viên học theo chuẩn vị trí.
/// </summary>
public class UpdateDepartmentCeilingsUseCase : IUseCase<UpdateDepartmentCeilingsUseCaseInput, UpdateDepartmentCeilingsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly CapabilityCeilingReader _reader;

    public UpdateDepartmentCeilingsUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IAuditService auditService,
        CapabilityCeilingReader reader)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _reader = reader;
    }

    public async Task<UpdateDepartmentCeilingsUseCaseOutput> ExecuteAsync(UpdateDepartmentCeilingsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        // 1. Phòng ban của tổ chức, còn hoạt động
        var department = await _context.Departments.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == input.DepartmentId
                                      && d.OrganizationId == organizationId
                                      && d.Status == Statuses.MasterData.Active)
            ?? throw new NotFoundException("Department not found.");

        // 2. Mức riêng hiện có của phòng ban (toàn doanh nghiệp không có mức chọn tay: là mọi khóa đã có)
        var deptRows = await _context.CapabilityCeilings
            .Where(c => c.OrganizationId == organizationId && c.DepartmentId == department.Id)
            .ToListAsync();
        var oldValues = deptRows.ToDictionary(r => r.CompetencyCategoryId.ToString(), r => r.CeilingLevel);

        if (input.Inherit)
        {
            // Thiết lập riêng chỉ là phần ghi đè: bỏ đi thì phòng ban dùng lại phạm vi doanh nghiệp.
            _context.CapabilityCeilings.RemoveRange(deptRows);
        }
        else
        {
            // Any domain of the matrix, any level up to the platform maximum (validated); buying is a separate step.
            var domainIds = (await _reader.LoadDomainsAsync(organizationId)).Select(domain => domain.Id).ToHashSet();
            if (input.Ceilings.Any(item => !domainIds.Contains(item.CategoryId)))
            {
                throw new BadRequestException("A competency domain is not part of the ceiling matrix.", "ceilings", "CATEGORY_NOT_IN_MATRIX");
            }

            var byCategory = deptRows.ToDictionary(r => r.CompetencyCategoryId);
            foreach (var item in input.Ceilings)
            {
                if (!byCategory.TryGetValue(item.CategoryId, out var row))
                {
                    row = new CapabilityCeiling
                    {
                        OrganizationId = organizationId,
                        DepartmentId = department.Id,
                        CompetencyCategoryId = item.CategoryId,
                    };
                    _context.CapabilityCeilings.Add(row);
                }

                row.CeilingLevel = (short)item.Level;
                row.UpdatedByUserId = _currentUser.UserId;
            }
        }

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "CAPABILITY_CEILING_UPDATED",
            "capability_ceilings",
            department.Id,
            oldValues.Count == 0 ? null : oldValues,
            input.Inherit
                ? new { inherit = true }
                : new { ceilings = input.Ceilings.ToDictionary(c => c.CategoryId.ToString(), c => c.Level) },
            $"Phạm vi phòng ban {department.Code} - {department.Name}");

        return await _reader.ReadAsync<UpdateDepartmentCeilingsUseCaseOutput>(organizationId);
    }
}
