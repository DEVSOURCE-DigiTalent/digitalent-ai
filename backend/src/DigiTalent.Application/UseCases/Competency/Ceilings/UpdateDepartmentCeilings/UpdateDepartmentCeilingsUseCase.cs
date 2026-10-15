using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Đặt trần riêng cho một phòng ban (doanh nghiệp lớn). Chặn khi trần phòng ban cao hơn trần doanh nghiệp
/// ở bất kỳ lĩnh vực nào; Inherit = true đưa phòng ban về kế thừa trần doanh nghiệp.
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

        // 2. Trần doanh nghiệp phải được lưu trước
        var rows = await _context.CapabilityCeilings
            .Where(c => c.OrganizationId == organizationId && (c.DepartmentId == null || c.DepartmentId == department.Id))
            .ToListAsync();
        var orgCeilings = rows.Where(r => r.DepartmentId == null).ToDictionary(r => r.CompetencyCategoryId, r => r.CeilingLevel);
        if (orgCeilings.Count == 0)
        {
            throw new BadRequestException("Save the organization ceiling first.", "ceilings", "ORGANIZATION_CEILING_REQUIRED");
        }

        var deptRows = rows.Where(r => r.DepartmentId == department.Id).ToList();
        var oldValues = deptRows.ToDictionary(r => r.CompetencyCategoryId.ToString(), r => r.CeilingLevel);

        if (input.Inherit)
        {
            // Trần riêng chỉ là phần ghi đè: bỏ đi thì phòng ban dùng lại trần doanh nghiệp.
            _context.CapabilityCeilings.RemoveRange(deptRows);
        }
        else
        {
            // 3. Quy tắc: trần phòng ban ≤ trần doanh nghiệp, xét riêng từng lĩnh vực
            foreach (var item in input.Ceilings)
            {
                if (!orgCeilings.TryGetValue(item.CategoryId, out var orgLevel))
                {
                    throw new BadRequestException("A competency domain is not part of the ceiling matrix.", "ceilings", "CATEGORY_NOT_IN_MATRIX");
                }

                if (item.Level > orgLevel)
                {
                    throw new BadRequestException(
                        "A department ceiling cannot be higher than the organization ceiling.", "ceilings", "CEILING_ABOVE_ORGANIZATION");
                }
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
            $"Trần phòng ban {department.Code} - {department.Name}");

        return await _reader.ReadAsync<UpdateDepartmentCeilingsUseCaseOutput>(organizationId);
    }
}
