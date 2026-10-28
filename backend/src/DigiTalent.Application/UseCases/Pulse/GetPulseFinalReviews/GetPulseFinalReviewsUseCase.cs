using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /pulse/final-reviews — hàng chờ chấm bài của quản lý (§10): bài đánh giá trước khi học chờ quyết định, bài cuối
/// khóa chờ quyết định, người đang trong cửa sổ nộp lại, ca quá hạn và cờ hai lần chưa đạt. Mỗi bài kèm kết quả phần trắc
/// nghiệm (từng câu) và, khi có giám sát, bản ghi (đoạn ghi màn hình / camera với link đã ký, nhật ký giám sát). Phạm vi
/// theo <see cref="PulseReviewScope"/>.
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
    private readonly PulseCatalogReader _catalog;
    private readonly PulseFinalReader _final;
    private readonly PulseRecordingReader _recordings;
    private readonly PulseExamPaper _paper;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _clock;
    private readonly IGeminiService _gemini;

    public GetPulseFinalReviewsUseCase(
        IApplicationDbContext context,
        PulseReviewScope scope,
        PulseCatalogReader catalog,
        PulseFinalReader final,
        PulseRecordingReader recordings,
        PulseExamPaper paper,
        ICurrentUser currentUser,
        TimeProvider clock,
        IGeminiService gemini)
    {
        _context = context;
        _scope = scope;
        _catalog = catalog;
        _final = final;
        _recordings = recordings;
        _paper = paper;
        _currentUser = currentUser;
        _clock = clock;
        _gemini = gemini;
    }

    public async Task<GetPulseFinalReviewsUseCaseOutput> ExecuteAsync(GetPulseFinalReviewsUseCaseInput input)
    {
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
                    employee.OrganizationId,
                    employee.FullName,
                    DepartmentName = department.Name,
                    PositionName = _context.JobPositions.Where(p => p.Id == employee.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();

        var preRows = await (
                from preAssessment in _context.CoursePreAssessments.AsNoTracking()
                join employee in _scope.ReviewableEmployees().AsNoTracking() on preAssessment.EmployeeId equals employee.Id
                join course in _context.Courses.AsNoTracking() on preAssessment.CourseId equals course.Id
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                where preAssessment.Decision == null
                select new
                {
                    PreAssessment = preAssessment,
                    EmployeeId = employee.Id,
                    employee.OrganizationId,
                    employee.FullName,
                    DepartmentName = department.Name,
                    PositionName = _context.JobPositions.Where(p => p.Id == employee.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();

        // Danh mục khóa theo tổ chức của người làm bài (mentor chấm cho nhiều doanh nghiệp dùng thử).
        var organizationIds = rows.Select(r => r.OrganizationId).Concat(preRows.Select(r => r.OrganizationId)).Distinct().ToList();
        var byCode = new Dictionary<(Guid, string), PulseCourseRef>();
        foreach (var organizationId in organizationIds)
        {
            foreach (var course in await _catalog.LoadAsync(organizationId))
            {
                byCode[(organizationId, course.Code.ToUpperInvariant())] = course;
            }
        }

        var categoryIds = byCode.Values.Select(c => c.CategoryId).Distinct().ToList();
        var categoryNames = await _context.CompetencyCategories.AsNoTracking()
            .Where(c => categoryIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => PulseLearnerReader.DisplayName(c.Name));
        var organizationNames = await _context.Organizations.AsNoTracking()
            .Where(o => organizationIds.Contains(o.Id))
            .ToDictionaryAsync(o => o.Id, o => o.Name);

        var now = _clock.GetUtcNow();
        var attemptDtos = await _final.MapByIdAsync(rows.Select(r => r.Submission).ToList(), forReviewer: true);
        var preChoiceItems = await _paper.LoadItemsAsync(preRows
            .Where(r => r.PreAssessment.ChoiceTotal != null)
            .Select(r => r.PreAssessment.Id)
            .ToList());
        var items = new List<PulseFinalReviewItemDto>();
        var assignmentContent = await new DigiTalent.Application.UseCases.Learning.Content.LearningContentReader(_context)
            .FinalsAsync(rows.Select(r => r.CourseId).Distinct().ToList());
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
            var catalogCourse = byCode.GetValueOrDefault((first.OrganizationId, first.Code.ToUpperInvariant()));
            items.Add(new PulseFinalReviewItemDto
            {
                Kind = Statuses.ProctoringKind.Final,
                Assignment = assignmentContent.GetValueOrDefault(first.CourseId),
                SubmissionId = last.Id,
                Status = status,
                EmployeeId = first.EmployeeId,
                EmployeeName = first.FullName,
                OrganizationName = organizationNames.GetValueOrDefault(first.OrganizationId),
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
                ProctoringSessionId = last.ProctoringSessionId,
            });
        }

        foreach (var row in preRows)
        {
            var catalogCourse = byCode.GetValueOrDefault((row.OrganizationId, row.Code.ToUpperInvariant()));
            var preAssessment = row.PreAssessment;
            items.Add(new PulseFinalReviewItemDto
            {
                Kind = Statuses.ProctoringKind.PreAssessment,
                SubmissionId = preAssessment.Id,
                Status = PulseFinalStatus.Pending,
                EmployeeId = row.EmployeeId,
                EmployeeName = row.FullName,
                OrganizationName = organizationNames.GetValueOrDefault(row.OrganizationId),
                DepartmentName = row.DepartmentName,
                PositionName = row.PositionName,
                CourseId = row.CourseId,
                CourseCode = row.Code,
                CourseTitle = row.Title,
                DomainName = catalogCourse != null ? categoryNames.GetValueOrDefault(catalogCourse.CategoryId) : null,
                Tier = catalogCourse?.Tier,
                AttemptNo = 1,
                MaxAttempts = 1,
                Attempts = new List<PulseFinalAttemptDto>
                {
                    new()
                    {
                        SubmissionId = preAssessment.Id,
                        AttemptNo = 1,
                        EvidenceText = preAssessment.EvidenceText,
                        SubmittedAt = preAssessment.SubmittedAt,
                        ProctoringSessionId = preAssessment.ProctoringSessionId,
                        Choice = PulseExamPaper.Result(
                            preAssessment.ChoiceScore, preAssessment.ChoiceTotal, null, true, preChoiceItems.GetValueOrDefault(preAssessment.Id)),
                    },
                },
                ProctoringSessionId = preAssessment.ProctoringSessionId,
            });
        }

        // Load recordings trước để lấy events cho AI phân tích gian lận
        var recordings = await _recordings.LoadAsync(items
            .Where(i => i.ProctoringSessionId.HasValue)
            .Select(i => i.ProctoringSessionId!.Value)
            .ToList());
        foreach (var item in items.Where(i => i.ProctoringSessionId.HasValue))
        {
            item.Recording = recordings.GetValueOrDefault(item.ProctoringSessionId!.Value);
        }

        // AI evaluation: gọi Gemini song song cho tất cả bài PENDING (đánh giá bài + phát hiện gian lận)
        var defaultCriteria = PulseRules.FinalCriteria.Select(c => c.Title).ToList();
        var aiTasks = items
            .Where(i => i.Status == PulseFinalStatus.Pending && i.Attempts.Count > 0)
            .Select(async item =>
            {
                var evidence = item.Attempts[^1].EvidenceText ?? "";
                var prompt = item.Assignment?.PromptHtml ?? "";
                var criteria = item.Assignment?.Criteria is { Count: > 0 }
                    ? item.Assignment.Criteria
                    : (IReadOnlyList<string>)defaultCriteria;

                // Lấy events giám sát để AI phân tích gian lận
                List<ProctoringEventInfo>? events = null;
                if (item.Recording?.Events is { Count: > 0 } evts)
                {
                    events = evts.Select(e => new ProctoringEventInfo(e.Kind, e.OffsetMs, e.DurationMs)).ToList();
                }

                item.AiHint = await _gemini.EvaluateEvidenceAsync(evidence, prompt, criteria, events);
            })
            .ToList();
        await Task.WhenAll(aiTasks);

        items = items
            .OrderBy(i => Array.IndexOf(StatusOrder, i.Status))
            .ThenBy(i => i.Attempts.LastOrDefault()?.SubmittedAt)
            .ToList();

        return new GetPulseFinalReviewsUseCaseOutput
        {
            PendingCount = items.Count(i => i.Status == PulseFinalStatus.Pending),
            PreAssessmentCount = items.Count(i => i.Kind == Statuses.ProctoringKind.PreAssessment),
            RetryCount = items.Count(i => i.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady),
            DeadlineMissedCount = items.Count(i => i.Status == PulseFinalStatus.DeadlineMissed),
            FlaggedCount = items.Count(i => i.Status == PulseFinalStatus.Flagged),
            Criteria = PulseRules.FinalCriteria.ToList(),
            Items = items,
        };
    }
}
