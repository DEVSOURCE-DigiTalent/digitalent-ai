using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// GET /platform/trials — doanh nghiệp dùng thử cho quản trị nền tảng: đang làm bài (hạn gần trước), đã có báo cáo, chưa đặt
/// hạn; kèm số bài đã nộp và trạng thái gợi ý AI của báo cáo.
/// </summary>
public class GetPlatformTrialsUseCase : IUseCase<GetPlatformTrialsUseCaseInput, GetPlatformTrialsUseCaseOutput>
{
    private static readonly Dictionary<string, int> StageRank = new()
    {
        [TrialProgramRules.StageOpen] = 0,
        [TrialProgramRules.StageReported] = 1,
        [TrialProgramRules.StageSetup] = 2,
    };

    private readonly IApplicationDbContext _context;

    public GetPlatformTrialsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetPlatformTrialsUseCaseOutput> ExecuteAsync(GetPlatformTrialsUseCaseInput input)
    {
        var trials = await (
                from trial in _context.TrialWorkspaces.AsNoTracking()
                join organization in _context.Organizations.AsNoTracking() on trial.OrganizationId equals organization.Id
                join owner in _context.Users.AsNoTracking() on trial.OwnerUserId equals owner.Id
                select new { Trial = trial, OrganizationName = organization.Name, OwnerName = owner.DisplayName, OwnerEmail = owner.Email })
            .ToListAsync();
        var organizationIds = trials.Select(t => t.Trial.OrganizationId).ToList();
        var mentorIds = trials.Where(t => t.Trial.MentorUserId.HasValue).Select(t => t.Trial.MentorUserId!.Value).Distinct().ToList();
        var mentors = await _context.Users.AsNoTracking().Where(u => mentorIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        // Hồ sơ nhân viên của doanh nghiệp dùng thử = người tham gia (chủ doanh nghiệp chỉ có hồ sơ khi tự làm bài).
        var employees = await _context.Employees.AsNoTracking()
            .Where(e => organizationIds.Contains(e.OrganizationId) && e.UserId != null && e.Status != Statuses.Employee.Archived)
            .GroupBy(e => e.OrganizationId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        var invitations = await _context.MemberInvitations.AsNoTracking()
            .Where(i => organizationIds.Contains(i.OrganizationId) && i.Status == Statuses.MemberInvitation.Pending)
            .GroupBy(i => i.OrganizationId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        var submitted = await _context.TrialAssessments.AsNoTracking()
            .Where(a => organizationIds.Contains(a.OrganizationId))
            .GroupBy(a => a.OrganizationId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        var insights = await _context.TrialReports.AsNoTracking()
            .Where(r => organizationIds.Contains(r.OrganizationId))
            .ToDictionaryAsync(r => r.OrganizationId, r => r.AiStatus);

        var items = trials
            .Select(t => new PlatformTrialItem
            {
                OrganizationId = t.Trial.OrganizationId,
                OrganizationName = t.OrganizationName,
                OwnerName = t.OwnerName,
                OwnerEmail = t.OwnerEmail,
                Stage = TrialProgramRules.StageOf(t.Trial),
                StartedAt = t.Trial.StartedAt,
                TestDeadline = t.Trial.TestDeadline,
                MentorUserId = t.Trial.MentorUserId,
                MentorName = t.Trial.MentorUserId is { } m ? mentors.GetValueOrDefault(m) : null,
                ReportPublishedAt = t.Trial.ReportPublishedAt,
                Participants = employees.GetValueOrDefault(t.Trial.OrganizationId) + invitations.GetValueOrDefault(t.Trial.OrganizationId),
                Submitted = submitted.GetValueOrDefault(t.Trial.OrganizationId),
                InsightStatus = insights.GetValueOrDefault(t.Trial.OrganizationId),
            })
            .Where(item => string.IsNullOrWhiteSpace(input.Stage) || item.Stage == input.Stage.Trim().ToUpperInvariant())
            .OrderBy(item => StageRank[item.Stage])
            .ThenBy(item => item.TestDeadline ?? DateTimeOffset.MaxValue)
            .ThenByDescending(item => item.StartedAt)
            .ToList();

        return new GetPlatformTrialsUseCaseOutput { Items = items };
    }
}
