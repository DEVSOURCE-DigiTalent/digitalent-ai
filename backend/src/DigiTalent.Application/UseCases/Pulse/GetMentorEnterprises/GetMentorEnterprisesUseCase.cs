using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /mentor/enterprises — danh sách doanh nghiệp thuộc phạm vi phụ trách của mentor đang đăng nhập
/// (doanh nghiệp dùng thử được phân công và các doanh nghiệp chính thức), kèm thống kê bài cuối cấp theo từng đơn vị.
/// </summary>
public class GetMentorEnterprisesUseCase : IUseCase<GetMentorEnterprisesUseCaseInput, GetMentorEnterprisesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly TimeProvider _clock;

    public GetMentorEnterprisesUseCase(
        IApplicationDbContext context,
        PulseReviewScope scope,
        TimeProvider clock)
    {
        _context = context;
        _scope = scope;
        _clock = clock;
    }

    public async Task<GetMentorEnterprisesUseCaseOutput> ExecuteAsync(GetMentorEnterprisesUseCaseInput input)
    {
        var organizations = await _scope.ReviewableOrganizations()
            .AsNoTracking()
            .ToListAsync();

        if (organizations.Count == 0)
        {
            return new GetMentorEnterprisesUseCaseOutput();
        }

        var orgIds = organizations.Select(o => o.Id).ToList();

        var openTrials = await _context.TrialWorkspaces
            .AsNoTracking()
            .Where(t => t.ConvertedAt == null && orgIds.Contains(t.OrganizationId))
            .ToDictionaryAsync(t => t.OrganizationId);

        var owners = await (
                from user in _context.Users.AsNoTracking()
                join userRole in _context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where role.Code == Roles.Owner
                      && user.OrganizationId != null
                      && orgIds.Contains(user.OrganizationId.Value)
                orderby user.CreatedAt
                select new
                {
                    OrganizationId = user.OrganizationId!.Value,
                    user.DisplayName,
                    user.Email,
                })
            .ToListAsync();

        var ownerByOrg = owners
            .GroupBy(o => o.OrganizationId)
            .ToDictionary(g => g.Key, g => g.First());

        var trialOwnerIds = openTrials.Values
            .Select(t => t.OwnerUserId)
            .Distinct()
            .ToList();
        var trialOwnerUsers = trialOwnerIds.Count == 0
            ? new Dictionary<Guid, (string DisplayName, string Email)>()
            : await _context.Users
                .AsNoTracking()
                .Where(u => trialOwnerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => (u.DisplayName, u.Email));

        var departmentCounts = await _context.Departments
            .AsNoTracking()
            .Where(d => orgIds.Contains(d.OrganizationId) && d.Status != Statuses.MasterData.Archived)
            .GroupBy(d => d.OrganizationId)
            .Select(g => new { OrganizationId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.OrganizationId, g => g.Count);

        var employeeCounts = await _scope.ReviewableEmployees()
            .AsNoTracking()
            .Where(e => orgIds.Contains(e.OrganizationId) && e.Status != Statuses.Employee.Archived)
            .GroupBy(e => e.OrganizationId)
            .Select(g => new { OrganizationId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.OrganizationId, g => g.Count);

        var submissionRows = await (
                from submission in _context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join employee in _scope.ReviewableEmployees().AsNoTracking() on enrollment.EmployeeId equals employee.Id
                where enrollment.Status != Statuses.Enrollment.Cancelled
                      && orgIds.Contains(employee.OrganizationId)
                select new
                {
                    employee.OrganizationId,
                    Enrollment = enrollment,
                    Submission = submission,
                })
            .ToListAsync();

        var now = _clock.GetUtcNow();
        var enrollmentSummaries = submissionRows
            .GroupBy(r => r.Enrollment.Id)
            .Select(g =>
            {
                var first = g.First();
                var submissions = g.Select(r => r.Submission).OrderBy(s => s.AttemptNo).ToList();
                var status = PulseRules.FinalStatusOf(first.Enrollment, submissions, true, now);
                var latestSubmittedAt = submissions[^1].SubmittedAt;
                return new
                {
                    first.OrganizationId,
                    Status = status,
                    LatestSubmittedAt = latestSubmittedAt,
                };
            })
            .GroupBy(x => x.OrganizationId)
            .ToDictionary(
                g => g.Key,
                g => new
                {
                    PendingCount = g.Count(x => x.Status == PulseFinalStatus.Pending),
                    RetryCount = g.Count(x => x.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady),
                    FlaggedCount = g.Count(x => x.Status is PulseFinalStatus.Flagged or PulseFinalStatus.DeadlineMissed),
                    ReviewedCount = g.Count(x => x.Status is PulseFinalStatus.Approved or PulsePreStatus.NotYet),
                    TotalSubmissions = g.Count(),
                    LatestSubmittedAt = g.Max(x => (DateTimeOffset?)x.LatestSubmittedAt),
                });

        var items = organizations
            .Select(org =>
            {
                var trial = openTrials.GetValueOrDefault(org.Id);
                var owner = ownerByOrg.GetValueOrDefault(org.Id);
                var ownerName = owner?.DisplayName;
                var ownerEmail = owner?.Email;
                if (ownerName == null && trial != null && trialOwnerUsers.TryGetValue(trial.OwnerUserId, out var fallbackOwner))
                {
                    ownerName = fallbackOwner.DisplayName;
                    ownerEmail = fallbackOwner.Email;
                }

                var stats = enrollmentSummaries.GetValueOrDefault(org.Id);

                return new MentorEnterpriseItemDto
                {
                    OrganizationId = org.Id,
                    OrganizationCode = org.Code,
                    OrganizationName = org.Name,
                    Stage = trial != null ? "TRIAL" : "OFFICIAL",
                    OwnerName = ownerName,
                    OwnerEmail = ownerEmail,
                    DepartmentCount = departmentCounts.GetValueOrDefault(org.Id),
                    EmployeeCount = employeeCounts.GetValueOrDefault(org.Id),
                    PendingCount = stats?.PendingCount ?? 0,
                    RetryCount = stats?.RetryCount ?? 0,
                    FlaggedCount = stats?.FlaggedCount ?? 0,
                    ReviewedCount = stats?.ReviewedCount ?? 0,
                    TotalSubmissions = stats?.TotalSubmissions ?? 0,
                    LatestSubmittedAt = stats?.LatestSubmittedAt,
                    AssignedAt = trial?.MentorAssignedAt,
                };
            })
            .OrderByDescending(i => i.PendingCount > 0 || i.FlaggedCount > 0 ? 1 : 0)
            .ThenByDescending(i => i.PendingCount)
            .ThenByDescending(i => i.FlaggedCount + i.RetryCount)
            .ThenByDescending(i => i.LatestSubmittedAt ?? DateTimeOffset.MinValue)
            .ThenBy(i => i.OrganizationName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new GetMentorEnterprisesUseCaseOutput
        {
            TotalEnterprises = items.Count,
            PendingCount = items.Sum(i => i.PendingCount),
            AttentionCount = items.Sum(i => i.RetryCount + i.FlaggedCount),
            ReviewedCount = items.Sum(i => i.ReviewedCount),
            Items = items,
        };
    }
}
