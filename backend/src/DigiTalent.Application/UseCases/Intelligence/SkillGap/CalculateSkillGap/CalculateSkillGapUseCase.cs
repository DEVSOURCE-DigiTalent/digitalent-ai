using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>
/// Tính skill gap cho 1 nhân viên trong phạm vi người gọi, lưu snapshot mới (generated_by = USER_REQUEST).
/// Không tính được (chưa gán vị trí, vị trí chưa có bộ tiêu chuẩn ACTIVE, nhân viên không ACTIVE) → 400 kèm mã lý do.
/// </summary>
public class CalculateSkillGapUseCase : IUseCase<CalculateSkillGapUseCaseInput, SkillGapRunDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunService _runService;
    private readonly SkillGapRunReader _runReader;

    public CalculateSkillGapUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        SkillGapRunService runService,
        SkillGapRunReader runReader)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _runService = runService;
        _runReader = runReader;
    }

    public async Task<SkillGapRunDetail> ExecuteAsync(CalculateSkillGapUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var employee = await _employeeScope.GetVisibleEmployeeAsync(input.EmployeeId);
        var requirementSetOverride = input.RequirementSetId.HasValue
            ? await GetActiveRequirementSetAsync(input.RequirementSetId.Value, organizationId)
            : null;

        var outcome = (await _runService.StageRunsAsync(
            new[] { employee }, organizationId, Statuses.SkillGapGeneratedBy.UserRequest, requirementSetOverride)).Single();

        if (outcome.SkipReason != null)
        {
            throw new BadRequestException(SkipMessage(outcome.SkipReason), "employeeId", outcome.SkipReason);
        }

        await _context.SaveChangesAsync();

        return await _runReader.FindDetailAsync(_employeeScope.VisibleEmployees(), outcome.Run!.Id)
            ?? throw new NotFoundException($"Skill gap run '{outcome.Run.Id}' not found.");
    }

    private async Task<PositionRequirementSet> GetActiveRequirementSetAsync(Guid requirementSetId, Guid organizationId)
    {
        var set = await (from s in _context.PositionRequirementSets.AsNoTracking()
                         join p in _context.JobPositions on s.JobPositionId equals p.Id
                         where s.Id == requirementSetId && p.OrganizationId == organizationId
                         select s).FirstOrDefaultAsync()
                  ?? throw new NotFoundException($"Position requirement set with ID '{requirementSetId}' not found.");

        if (set.Status != Statuses.PositionRequirementSet.Active)
        {
            throw new BadRequestException("Only an active requirement set can be used for skill gap analysis.", "requirementSetId", "REQUIREMENT_SET_NOT_ACTIVE");
        }

        return set;
    }

    private static string SkipMessage(string reason) => reason switch
    {
        SkillGapSkipReasons.EmployeeNotActive => "Skill gap can only be calculated for active employees.",
        SkillGapSkipReasons.NoJobPosition => "The employee has no job position assigned.",
        SkillGapSkipReasons.NoActiveRequirementSet => "The employee's job position has no active requirement set.",
        _ => "Skill gap cannot be calculated for this employee.",
    };
}
