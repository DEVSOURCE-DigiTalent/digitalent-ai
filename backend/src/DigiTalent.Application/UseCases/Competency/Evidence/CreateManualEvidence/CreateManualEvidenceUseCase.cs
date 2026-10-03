using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

/// <summary>
/// HR ghi nhận thủ công cấp độ năng lực đã xác nhận của nhân viên (source_type = MANUAL_OVERRIDE), spec §6.3–6.4.
/// Trong 1 transaction: thay thế bằng chứng cũ, tạo bằng chứng mới, cập nhật hồ sơ năng lực và — qua domain event —
/// tính lại skill gap + tạo thông báo. Audit log ghi sau commit (best-effort, E5).
/// </summary>
public class CreateManualEvidenceUseCase : IUseCase<CreateManualEvidenceUseCaseInput, CreateManualEvidenceUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly IAuditService _auditService;

    public CreateManualEvidenceUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _auditService = auditService;
    }

    public async Task<CreateManualEvidenceUseCaseOutput> ExecuteAsync(CreateManualEvidenceUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var confirmedByUserId = _currentUser.UserId
            ?? throw new ForbiddenException("Only a signed-in user can confirm competency levels.");

        var employee = await _employeeScope.GetVisibleEmployeeAsync(input.EmployeeId);
        if (employee.UserId == confirmedByUserId)
        {
            // Nguyên tắc 4 mắt: không tự xác nhận cấp độ năng lực của chính mình (spec §6.4 E13)
            throw new ForbiddenException("You cannot confirm your own competency level.");
        }

        if (employee.Status != Statuses.Employee.Active)
        {
            throw new BadRequestException("Competency levels can only be confirmed for active employees.", "employeeId", "EMPLOYEE_NOT_ACTIVE");
        }

        await EnsureActiveCompetencyAsync(input.CompetencyId, organizationId);

        var now = DateTimeOffset.UtcNow;
        var superseded = await SupersedePreviousEvidenceAsync(employee.Id, input.CompetencyId);
        var evidence = new CompetencyEvidence
        {
            EmployeeId = employee.Id,
            CompetencyId = input.CompetencyId,
            SourceType = Statuses.EvidenceSourceType.ManualOverride,
            Status = Statuses.EvidenceStatus.Confirmed,
            IsLevelConfirming = true,
            ConfirmedLevel = input.ConfirmedLevel,
            ConfirmedByUserId = confirmedByUserId,
            ConfirmedAt = now,
            ReviewNote = input.ReviewNote.Trim(),
            SupersedesEvidenceId = superseded?.Id,
        };
        _context.CompetencyEvidences.Add(evidence);

        var (profile, previousLevel) = await UpsertProfileAsync(employee.Id, input.CompetencyId, input.ConfirmedLevel, evidence.Id, now);

        _context.AddDomainEvent(new EmployeeCompetencyLevelConfirmed(employee.Id, input.CompetencyId, input.ConfirmedLevel, evidence.Id));
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "COMPETENCY_LEVEL_OVERRIDE",
            "employee_competency_profiles",
            profile.Id,
            new { confirmedLevel = previousLevel },
            new { confirmedLevel = input.ConfirmedLevel, evidenceId = evidence.Id, reviewNote = evidence.ReviewNote });

        return new CreateManualEvidenceUseCaseOutput
        {
            EvidenceId = evidence.Id,
            EmployeeId = employee.Id,
            CompetencyId = input.CompetencyId,
            PreviousLevel = previousLevel,
            ConfirmedLevel = input.ConfirmedLevel,
            SupersededEvidenceId = superseded?.Id,
        };
    }

    private async Task EnsureActiveCompetencyAsync(Guid competencyId, Guid organizationId)
    {
        var exists = await (from competency in _context.Competencies
                            join category in _context.CompetencyCategories on competency.CategoryId equals category.Id
                            where competency.Id == competencyId
                                  && category.OrganizationId == organizationId
                                  && competency.Status == Statuses.Competency.Active
                            select competency.Id).AnyAsync();
        if (!exists)
        {
            throw new NotFoundException($"Active competency with ID '{competencyId}' not found.");
        }
    }

    /// <summary>
    /// Bằng chứng đang xác nhận cấp độ → SUPERSEDED và bỏ cờ is_level_confirming
    /// (CHECK ck_competency_evidences_level_confirming_rule chỉ cho cờ này khi CONFIRMED — spec E6).
    /// Trả về bằng chứng gần nhất để liên kết supersedes_evidence_id.
    /// </summary>
    private async Task<CompetencyEvidence?> SupersedePreviousEvidenceAsync(Guid employeeId, Guid competencyId)
    {
        var confirming = await _context.CompetencyEvidences
            .Where(e => e.EmployeeId == employeeId
                        && e.CompetencyId == competencyId
                        && e.Status == Statuses.EvidenceStatus.Confirmed
                        && e.IsLevelConfirming)
            .ToListAsync();

        foreach (var previous in confirming)
        {
            previous.Status = Statuses.EvidenceStatus.Superseded;
            previous.IsLevelConfirming = false;
        }

        return confirming.OrderByDescending(e => e.ConfirmedAt).FirstOrDefault();
    }

    private async Task<(EmployeeCompetencyProfile Profile, short? PreviousLevel)> UpsertProfileAsync(
        Guid employeeId, Guid competencyId, short confirmedLevel, Guid evidenceId, DateTimeOffset now)
    {
        var profile = await _context.EmployeeCompetencyProfiles
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.CompetencyId == competencyId);

        if (profile == null)
        {
            profile = new EmployeeCompetencyProfile
            {
                EmployeeId = employeeId,
                CompetencyId = competencyId,
                ConfirmedLevel = confirmedLevel,
                LatestConfirmingEvidenceId = evidenceId,
                ConfirmedAt = now,
                RowVersion = 1,
            };
            _context.EmployeeCompetencyProfiles.Add(profile);
            return (profile, null);
        }

        var previousLevel = profile.ConfirmedLevel;
        profile.ConfirmedLevel = confirmedLevel;
        profile.LatestConfirmingEvidenceId = evidenceId;
        profile.ConfirmedAt = now;
        profile.RowVersion += 1; // concurrency token: ghi đồng thời → 409
        return (profile, previousLevel);
    }
}
