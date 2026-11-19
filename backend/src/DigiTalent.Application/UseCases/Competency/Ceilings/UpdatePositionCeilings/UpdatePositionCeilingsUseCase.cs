using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Khung năng lực số theo vị trí (OW-05 tab 2): chủ doanh nghiệp đặt mức cần đạt từng lĩnh vực cho một trong 5 vị trí chuẩn,
/// dùng chung ở mọi phòng ban. Mức được ghi vào chuẩn vị trí (<see cref="PositionLevelWriter"/>); có thể cao hơn khóa doanh
/// nghiệp đã có (đặt trước, mua sau). Inherit = true bỏ mọi mức đã đặt, vị trí theo đề xuất của hệ thống.
/// </summary>
public class UpdatePositionCeilingsUseCase : IUseCase<UpdatePositionCeilingsUseCaseInput, UpdatePositionCeilingsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;
    private readonly CapabilityCeilingReader _reader;

    public UpdatePositionCeilingsUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService, CapabilityCeilingReader reader)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _reader = reader;
    }

    public async Task<UpdatePositionCeilingsUseCaseOutput> ExecuteAsync(UpdatePositionCeilingsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");

        // One of the 5 standard positions: the row with the catalog code, else an older row naming the same position (as
        // CapabilityCeilingReader shows it), else a new row.
        var code = JobPositionCatalog.ResolveCode(input.Code)
            ?? throw new BadRequestException(StandardPositions.NotStandard, "code", "INVALID_JOB_POSITION");
        var positions = await _context.JobPositions
            .Where(p => p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived).ToListAsync();
        var position = positions.FirstOrDefault(p => p.Code.Equals(code, StringComparison.OrdinalIgnoreCase))
            ?? positions.FirstOrDefault(p => !JobPositionCatalog.Positions.ContainsKey(p.Code)
                && ReferencePositionMatrixService.MatchPosition(p.Code, p.Name) == code);
        if (position == null)
        {
            var (created, error) = StandardPositions.Resolve(_context, organizationId, positions, code);
            position = created ?? throw new BadRequestException(error!, "code", "INVALID_JOB_POSITION");
        }
        if (position.Status != Statuses.MasterData.Active)
            throw new BadRequestException(StandardPositions.NotActive, "code", "INVALID_JOB_POSITION");
        // a position created here is saved with its first standard version (PositionLevelWriter)

        var levels = input.Inherit ? null : input.Ceilings.ToDictionary(c => c.CategoryId, c => c.Level);
        var changed = await new PositionLevelWriter(_context).SaveAsync(organizationId, position, levels, userId);

        if (changed)
        {
            await _auditService.LogAsync(
                "CAPABILITY_CEILING_UPDATED",
                "job_positions",
                position.Id,
                null,
                input.Inherit ? new { inherit = true } : new { ceilings = input.Ceilings.ToDictionary(c => c.CategoryId.ToString(), c => c.Level) },
                $"Khung năng lực số vị trí {position.Code} - {position.Name}");
        }

        return await _reader.ReadAsync<UpdatePositionCeilingsUseCaseOutput>(organizationId);
    }
}
