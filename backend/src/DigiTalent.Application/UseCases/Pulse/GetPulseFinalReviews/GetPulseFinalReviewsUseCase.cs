using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /pulse/final-reviews — hàng chờ bài cuối khóa của quản lý (§10): bài chờ quyết định, người đang trong cửa sổ
/// nộp lại, ca quá hạn và cờ hai lần chưa đạt. Phạm vi theo <see cref="PulseReviewScope"/>.
/// </summary>
public class GetPulseFinalReviewsUseCase : IUseCase<GetPulseFinalReviewsUseCaseInput, GetPulseFinalReviewsUseCaseOutput>
{
    private static readonly string[] StatusOrder =
    {
        PulseFinalStatus.Pending, PulseFinalStatus.Flagged, PulseFinalStatus.DeadlineMissed,
        PulseFinalStatus.RetryReady, PulseFinalStatus.RetryWait,
    };

    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly PulseLearnerReader _learner;
    private readonly PulseFinalReader _final;
    private readonly ICurrentUser _currentUser;

    public GetPulseFinalReviewsUseCase(
        IApplicationDbContext context, PulseReviewScope scope, PulseLearnerReader learner, PulseFinalReader final, ICurrentUser currentUser)
    {
        _context = context;
        _scope = scope;
        _learner = learner;
        _final = final;
        _currentUser = currentUser;
    }

    public async Task<GetPulseFinalReviewsUseCaseOutput> ExecuteAsync(GetPulseFinalReviewsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var rows = await (
                from submission in _context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join employee in _scope.ReviewableEmployees().AsNoTracking() on enrollment.EmployeeId equals employee.Id
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                where enrollment.Status != Statuses.Enrollment.Completed && enrollment.Status != Statuses.Enrollment.Cancelled
                select new
                {
                    Submission = submission,
                    Enrollment = enrollment,
                    EmployeeId = employee.Id,
                    employee.FullName,
                    DepartmentName = department.Name,
                    PositionName = _context.JobPositions.Where(p => p.Id == employee.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();

        var catalog = await _learner.LoadCatalogAsync(organizationId);
        var categoryIds = catalog.Select(c => c.CategoryId).Distinct().ToList();
        var categoryNames = await _context.CompetencyCategories.AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => PulseLearnerReader.DisplayName(c.Name));
        var byCode = catalog.ToDictionary(c => c.Code, StringComparer.OrdinalIgnoreCase);

        var now = _learner.Now;
        var attemptDtos = await _final.MapByIdAsync(rows.Select(r => r.Submission).ToList());
        var items = new List<PulseFinalReviewItemDto>();
        foreach (var group in rows.GroupBy(r => r.Enrollment.Id))
        {
            var first = group.First();
            var submissions = group.Select(r => r.Submission).OrderBy(s => s.AttemptNo).ToList();
            var status = PulseRules.FinalStatusOf(first.Enrollment, submissions, true, now);
            if (!StatusOrder.Contains(status))
            {
                continue;
            }

            var last = submissions[^1];
            var catalogCourse = byCode.GetValueOrDefault(first.Code);
            items.Add(new PulseFinalReviewItemDto
            {
                SubmissionId = last.Id,
                Status = status,
                EmployeeId = first.EmployeeId,
                EmployeeName = first.FullName,
                DepartmentName = first.DepartmentName,
                PositionName = first.PositionName,
                CourseId = first.CourseId,
                CourseCode = first.Code,
                CourseTitle = first.Title,
                DomainName = catalogCourse != null ? categoryNames.GetValueOrDefault(catalogCourse.CategoryId) : null,
                Tier = catalogCourse?.Tier,
                AttemptNo = last.AttemptNo,
                MaxAttempts = PulseRules.MaxFinalAttempts,
                Attempts = submissions.Select(s => attemptDtos[s.Id]).ToList(),
                AiHint = status == PulseFinalStatus.Pending ? PulseRules.AiHint(last.EvidenceText) : null,
            });
        }

        items = items
            .OrderBy(i => Array.IndexOf(StatusOrder, i.Status))
            .ThenBy(i => i.Attempts.LastOrDefault()?.SubmittedAt)
            .ToList();

        return new GetPulseFinalReviewsUseCaseOutput
        {
            PendingCount = items.Count(i => i.Status == PulseFinalStatus.Pending),
            RetryCount = items.Count(i => i.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady),
            DeadlineMissedCount = items.Count(i => i.Status == PulseFinalStatus.DeadlineMissed),
            FlaggedCount = items.Count(i => i.Status == PulseFinalStatus.Flagged),
            Criteria = PulseRules.FinalCriteria.ToList(),
            Items = items,
        };
    }
}
