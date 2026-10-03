using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class ActivatePositionRequirementSetUseCase : IUseCase<ActivatePositionRequirementSetUseCaseInput, ActivatePositionRequirementSetUseCaseOutput>
{
    /// <summary>Mã lỗi trả về errors[].message (field "items") để FE dịch.</summary>
    public const string CompetencyNotInFramework = "COMPETENCY_NOT_IN_FRAMEWORK";
    public const string RequirementCountOutOfRange = "REQUIREMENT_COUNT_OUT_OF_RANGE";
    public const string CoreCompetencyMissing = "CORE_COMPETENCY_MISSING";

    /// <summary>MSG07 (SRS §7.3.3) — quyết định D-B7: vị trí chọn 9–24 năng lực của khung, không bắt buộc đủ 24.</summary>
    public const string RequirementCountMessage =
        "A requirement set needs between 9 and 24 competencies of the national digital competence framework (Circular 02/2025) before it can be activated";

    /// <summary>MSG07b — năng lực lõi về an toàn bắt buộc với mọi vị trí.</summary>
    public const string CoreCompetencyMessage =
        "A requirement set must include the core safety competencies 4.1 (protecting devices) and 4.2 (protecting personal data and privacy).";

    private const decimal RequiredTotalWeightPercent = 100m;

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ActivatePositionRequirementSetUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ActivatePositionRequirementSetUseCaseOutput> ExecuteAsync(ActivatePositionRequirementSetUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId;

        var set = await (from s in _context.GetDbSet<PositionRequirementSet>()
                         join p in _context.JobPositions on s.JobPositionId equals p.Id
                         where s.Id == input.Id && p.OrganizationId == orgId
                         select s).FirstOrDefaultAsync();

        if (set == null)
        {
            throw new NotFoundException($"Position requirement set with ID '{input.Id}' not found.");
        }

        if (set.Status == Statuses.PositionRequirementSet.Archived)
        {
            throw new BadRequestException("Cannot activate an archived requirement set.");
        }

        var items = await _context.GetDbSet<PositionRequirementItem>()
            .Where(i => i.RequirementSetId == set.Id)
            .Select(i => new { i.CompetencyId, i.WeightPercent })
            .ToListAsync();
        if (items.Count == 0)
        {
            throw new BadRequestException("Cannot activate a position requirement set with no items.");
        }

        await EnsureCoversNationalFrameworkAsync(items.Select(i => i.CompetencyId).ToList());

        // Skill gap priority & coverage assume weights sum to exactly 100 (drafts may be incomplete).
        var totalWeight = items.Sum(i => i.WeightPercent);
        if (totalWeight != RequiredTotalWeightPercent)
        {
            throw new BadRequestException(
                $"Total weight percent must equal {RequiredTotalWeightPercent} before activation (current: {totalWeight}).");
        }

        if (set.Status != Statuses.PositionRequirementSet.Active)
        {
            // Archive currently active sets for this position
            var activeSets = await _context.GetDbSet<PositionRequirementSet>()
                .Where(s => s.JobPositionId == set.JobPositionId && s.Status == Statuses.PositionRequirementSet.Active && s.Id != set.Id)
                .ToListAsync();

            // ux_requirement_sets_one_active (1 bộ ACTIVE / vị trí) được kiểm tra theo từng câu lệnh:
            // phải archive bộ cũ TRƯỚC khi kích hoạt bộ mới — 2 lần lưu trong cùng 1 transaction.
            await _context.ExecuteInTransactionAsync(async () =>
            {
                foreach (var prevActive in activeSets)
                {
                    prevActive.Status = Statuses.PositionRequirementSet.Archived;
                }
                await _context.SaveChangesAsync();

                set.Status = Statuses.PositionRequirementSet.Active;
                set.ActivatedByUserId = userId;
                set.ActivatedAt = DateTimeOffset.UtcNow;
                set.RowVersion += 1;

                // Nhân viên ở vị trí này được tính lại skill gap theo bộ tiêu chuẩn mới (cùng transaction)
                _context.AddDomainEvent(new PositionRequirementSetActivated(set.Id, set.JobPositionId));
                await _context.SaveChangesAsync();
            });
        }

        return new ActivatePositionRequirementSetUseCaseOutput
        {
            Id = set.Id,
            VersionNo = set.VersionNo,
            Status = set.Status,
            ActivatedAt = set.ActivatedAt
        };
    }

    /// <summary>
    /// D-B7 (thay D-B4): mọi dòng phải là năng lực có mapping tới khung Thông tư 02/2025 đang active; vị trí chọn
    /// từ 9 đến 24 năng lực phù hợp công việc và luôn có năng lực lõi 4.1, 4.2. Bản nháp được phép thiếu; chỉ chặn khi kích hoạt.
    /// </summary>
    private async Task EnsureCoversNationalFrameworkAsync(IReadOnlyList<Guid> competencyIds)
    {
        var frameworkIds = await _context.CompetencyFrameworks
            .Where(f => f.Code == CompetencyFrameworks.Tt02.Code && f.IsActive)
            .Select(f => f.Id)
            .ToListAsync();
        var mapped = await _context.CompetencyFrameworkMappings
            .Where(m => frameworkIds.Contains(m.FrameworkId) && competencyIds.Contains(m.CompetencyId))
            .Select(m => new { m.CompetencyId, m.SourceCode })
            .ToListAsync();

        var unmapped = competencyIds.Except(mapped.Select(m => m.CompetencyId)).ToList();
        if (unmapped.Count > 0)
        {
            var codes = await _context.Competencies
                .Where(c => unmapped.Contains(c.Id))
                .Select(c => c.Code)
                .OrderBy(c => c)
                .ToListAsync();
            throw new BadRequestException(
                "Every competency must belong to the national digital competence framework (Circular 02/2025). "
                + $"Not in the framework: {string.Join(", ", codes)}.",
                "items",
                CompetencyNotInFramework);
        }

        var covered = mapped.Select(m => m.SourceCode).ToHashSet();
        if (covered.Count < CompetencyFrameworks.Tt02.MinRequirementCount)
        {
            throw new BadRequestException(
                $"{RequirementCountMessage} (current: {covered.Count}).",
                "items",
                RequirementCountOutOfRange);
        }

        var missingCore = CompetencyFrameworks.Tt02.CoreCompetencyCodes.Where(code => !covered.Contains(code)).ToList();
        if (missingCore.Count > 0)
        {
            throw new BadRequestException(
                $"{CoreCompetencyMessage} Missing: {string.Join(", ", missingCore)}.",
                "items",
                CoreCompetencyMissing);
        }
    }
}
