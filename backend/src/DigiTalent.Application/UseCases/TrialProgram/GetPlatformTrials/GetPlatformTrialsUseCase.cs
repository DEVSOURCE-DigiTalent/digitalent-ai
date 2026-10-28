using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// GET /platform/trials — doanh nghiệp dùng thử cho quản trị nền tảng: chờ phân công mentor trước (theo giờ mong muốn chấm),
/// rồi đang chấm, đã công bố, chưa gửi yêu cầu.
/// </summary>
public class GetPlatformTrialsUseCase : IUseCase<GetPlatformTrialsUseCaseInput, GetPlatformTrialsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformTrialsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetPlatformTrialsUseCaseOutput> ExecuteAsync(GetPlatformTrialsUseCaseInput input) =>
        new() { Items = await LoadAsync(_context, null, input.Stage) };

    /// <summary>Hàng của các doanh nghiệp dùng thử (mọi doanh nghiệp, hoặc chỉ của một mentor).</summary>
    public static async Task<List<PlatformTrialItem>> LoadAsync(IApplicationDbContext context, Guid? mentorUserId, string? stage)
    {
        var trials = await (
                from trial in context.TrialWorkspaces.AsNoTracking()
                join organization in context.Organizations.AsNoTracking() on trial.OrganizationId equals organization.Id
                join owner in context.Users.AsNoTracking() on trial.OwnerUserId equals owner.Id
                where mentorUserId == null || trial.MentorUserId == mentorUserId
                select new { Trial = trial, OrganizationName = organization.Name, OwnerName = owner.DisplayName, OwnerEmail = owner.Email })
            .ToListAsync();
        var organizationIds = trials.Select(t => t.Trial.OrganizationId).ToList();
        var mentorIds = trials.Where(t => t.Trial.MentorUserId.HasValue).Select(t => t.Trial.MentorUserId!.Value).Distinct().ToList();
        var mentors = await context.Users.AsNoTracking().Where(u => mentorIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        // Hồ sơ nhân viên của doanh nghiệp dùng thử = người tham gia (chủ doanh nghiệp chỉ có hồ sơ khi tự làm bài).
        var employees = await context.Employees.AsNoTracking()
            .Where(e => organizationIds.Contains(e.OrganizationId) && e.UserId != null && e.Status != Statuses.Employee.Archived)
            .GroupBy(e => e.OrganizationId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        var invitations = await context.MemberInvitations.AsNoTracking()
            .Where(i => organizationIds.Contains(i.OrganizationId) && i.Status == Statuses.MemberInvitation.Pending)
            .GroupBy(i => i.OrganizationId)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        var assessments = await context.TrialAssessments.AsNoTracking()
            .Where(a => organizationIds.Contains(a.OrganizationId))
            .GroupBy(a => a.OrganizationId)
            .Select(g => new { g.Key, Submitted = g.Count(), Reviewed = g.Count(a => a.ReviewedAt != null) })
            .ToDictionaryAsync(g => g.Key);

        var rank = new Dictionary<string, int>
        {
            [TrialProgramRules.StageRequested] = 0,
            [TrialProgramRules.StageAssigned] = 1,
            [TrialProgramRules.StageReported] = 2,
            [TrialProgramRules.StageSetup] = 3,
        };
        return trials
            .Select(t =>
            {
                var counts = assessments.GetValueOrDefault(t.Trial.OrganizationId);
                return new PlatformTrialItem
                {
                    OrganizationId = t.Trial.OrganizationId,
                    OrganizationName = t.OrganizationName,
                    OwnerName = t.OwnerName,
                    OwnerEmail = t.OwnerEmail,
                    Stage = TrialProgramRules.StageOf(t.Trial),
                    StartedAt = t.Trial.StartedAt,
                    TestDeadline = t.Trial.TestDeadline,
                    PreferredReviewAt = t.Trial.PreferredReviewAt,
                    RequestNote = t.Trial.RequestNote,
                    RequestedAt = t.Trial.RequestedAt,
                    MentorUserId = t.Trial.MentorUserId,
                    MentorName = t.Trial.MentorUserId is { } m ? mentors.GetValueOrDefault(m) : null,
                    ReportPublishedAt = t.Trial.ReportPublishedAt,
                    Participants = employees.GetValueOrDefault(t.Trial.OrganizationId) + invitations.GetValueOrDefault(t.Trial.OrganizationId),
                    Submitted = counts?.Submitted ?? 0,
                    Reviewed = counts?.Reviewed ?? 0,
                };
            })
            .Where(item => string.IsNullOrWhiteSpace(stage) || item.Stage == stage.Trim().ToUpperInvariant())
            .OrderBy(item => rank[item.Stage])
            .ThenBy(item => item.PreferredReviewAt ?? DateTimeOffset.MaxValue)
            .ThenByDescending(item => item.StartedAt)
            .ToList();
    }
}
