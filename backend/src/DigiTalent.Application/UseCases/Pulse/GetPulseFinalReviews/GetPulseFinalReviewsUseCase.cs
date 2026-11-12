using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /pulse/final-reviews — hàng chờ chấm bài (§10): quản lý nhận bài đánh giá trước khi học và bài cuối khóa;
/// mentor DigiTalent chỉ nhận bài cuối cấp sau mỗi cấp độ theo từng lĩnh vực của các doanh nghiệp thuộc phạm vi.
/// Mỗi bài kèm kết quả phần trắc nghiệm (từng câu) và bản ghi (màn hình / camera với link đã ký, nhật ký giám sát).
/// Phạm vi theo <see cref="PulseReviewScope"/>.
/// </summary>
public class GetPulseFinalReviewsUseCase : IUseCase<GetPulseFinalReviewsUseCaseInput, GetPulseFinalReviewsUseCaseOutput>
{
    private static readonly string[] ActiveStatusOrder =
    {
        PulseFinalStatus.Pending, PulseFinalStatus.Flagged, PulseFinalStatus.DeadlineMissed,
        PulseFinalStatus.RetryReady, PulseFinalStatus.RetryWait,
    };

    private static readonly string[] AllStatusOrder =
    {
        PulseFinalStatus.Pending, PulseFinalStatus.Flagged, PulseFinalStatus.DeadlineMissed,
        PulseFinalStatus.RetryReady, PulseFinalStatus.RetryWait,
        PulseFinalStatus.Approved, PulsePreStatus.NotYet,
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
    private readonly IMemoryCache? _cache;

    public GetPulseFinalReviewsUseCase(
        IApplicationDbContext context,
        PulseReviewScope scope,
        PulseCatalogReader catalog,
        PulseFinalReader final,
        PulseRecordingReader recordings,
        PulseExamPaper paper,
        ICurrentUser currentUser,
        TimeProvider clock,
        IGeminiService gemini,
        IMemoryCache? cache = null)
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
        _cache = cache;
    }

    private sealed record PreAssessmentRow(
        CoursePreAssessment PreAssessment,
        Guid EmployeeId,
        Guid OrganizationId,
        string FullName,
        string DepartmentName,
        string? PositionName,
        Guid CourseId,
        string Code,
        string Title);

    public async Task<GetPulseFinalReviewsUseCaseOutput> ExecuteAsync(GetPulseFinalReviewsUseCaseInput input)
    {
        var statusOrder = input.IncludeReviewed ? AllStatusOrder : ActiveStatusOrder;
        var isMentor = _currentUser.Roles.Contains(Roles.Mentor);

        var rows = await (
                from submission in _context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join employee in _scope.ReviewableEmployees().AsNoTracking() on enrollment.EmployeeId equals employee.Id
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                where enrollment.Status != Statuses.Enrollment.Cancelled
                      && (input.OrganizationId == null || employee.OrganizationId == input.OrganizationId)
                      && (input.IncludeReviewed || enrollment.Status != Statuses.Enrollment.Completed)
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

        var preRows = isMentor
            ? new List<PreAssessmentRow>()
            : await (
                    from preAssessment in _context.CoursePreAssessments.AsNoTracking()
                    join employee in _scope.ReviewableEmployees().AsNoTracking() on preAssessment.EmployeeId equals employee.Id
                    join course in _context.Courses.AsNoTracking() on preAssessment.CourseId equals course.Id
                    join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                    where (input.OrganizationId == null || employee.OrganizationId == input.OrganizationId)
                          && (input.IncludeReviewed || preAssessment.Decision == null)
                    select new PreAssessmentRow(
                        preAssessment,
                        employee.Id,
                        employee.OrganizationId,
                        employee.FullName,
                        department.Name,
                        _context.JobPositions.Where(p => p.Id == employee.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                        course.Id,
                        course.Code,
                        course.Title))
                .ToListAsync();

        // Danh mục khóa theo tổ chức của người làm bài (mentor chấm cho nhiều doanh nghiệp) + fallback cho khóa cũ/lịch sử.
        var organizationIds = rows.Select(r => r.OrganizationId).Concat(preRows.Select(r => r.OrganizationId)).Distinct().ToList();
        var byCode = new Dictionary<(Guid, string), PulseCourseRef>();
        foreach (var organizationId in organizationIds)
        {
            foreach (var course in await _catalog.LoadAsync(organizationId))
            {
                byCode[(organizationId, course.Code.ToUpperInvariant())] = course;
            }
        }

        var courseIds = rows.Select(r => r.CourseId).Concat(preRows.Select(r => r.CourseId)).Distinct().ToList();
        var courseMeta = courseIds.Count == 0
            ? new Dictionary<Guid, (Guid CategoryId, int Tier)>()
            : (await (
                    from teaching in _context.CourseCompetencies.AsNoTracking()
                    join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                    where courseIds.Contains(teaching.CourseId)
                    select new { teaching.CourseId, competency.CategoryId, teaching.TargetLevel })
                .ToListAsync())
                .GroupBy(r => r.CourseId)
                .ToDictionary(
                    g => g.Key,
                    g => (
                        CategoryId: g.GroupBy(r => r.CategoryId).OrderByDescending(c => c.Count()).ThenBy(c => c.Key).First().Key,
                        Tier: Math.Clamp((int)g.Max(r => r.TargetLevel), 1, PulseRules.MaxLevel)));

        var categoryIds = byCode.Values.Select(c => c.CategoryId)
            .Concat(courseMeta.Values.Select(c => c.CategoryId))
            .Distinct()
            .ToList();
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
        var preReviewerIds = preRows
            .Select(r => r.PreAssessment.ReviewedByUserId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();
        var preReviewerNames = preReviewerIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.Users.AsNoTracking()
                .Where(u => preReviewerIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.DisplayName);
        var items = new List<PulseFinalReviewItemDto>();
        var assignmentContent = await new DigiTalent.Application.UseCases.Learning.Content.LearningContentReader(_context)
            .FinalsAsync(courseIds);
        foreach (var group in rows.GroupBy(r => r.Enrollment.Id))
        {
            var first = group.First();
            var submissions = group.Select(r => r.Submission).OrderBy(s => s.AttemptNo).ToList();
            var status = PulseRules.FinalStatusOf(first.Enrollment, submissions, true, now);
            if (!statusOrder.Contains(status))
            {
                continue;
            }

            var last = submissions[^1];
            var catalogCourse = byCode.GetValueOrDefault((first.OrganizationId, first.Code.ToUpperInvariant()));
            var hasMeta = courseMeta.TryGetValue(first.CourseId, out var fallbackMeta);
            var categoryId = catalogCourse?.CategoryId ?? (hasMeta ? fallbackMeta.CategoryId : (Guid?)null);
            var tier = catalogCourse?.Tier ?? (hasMeta ? fallbackMeta.Tier : (int?)null);
            var domainName = categoryId.HasValue ? categoryNames.GetValueOrDefault(categoryId.Value) : null;
            var assignment = assignmentContent.GetValueOrDefault(first.CourseId);
            var rubric = PulseEssayRubric.Build(null, domainName, tier, assignment?.Criteria, first.Code);
            items.Add(new PulseFinalReviewItemDto
            {
                Kind = Statuses.ProctoringKind.Final,
                Assignment = assignment,
                SubmissionId = last.Id,
                Status = status,
                EmployeeId = first.EmployeeId,
                EmployeeName = first.FullName,
                OrganizationId = first.OrganizationId,
                OrganizationName = organizationNames.GetValueOrDefault(first.OrganizationId),
                DepartmentName = first.DepartmentName,
                PositionName = first.PositionName,
                CourseId = first.CourseId,
                CourseCode = first.Code,
                CourseTitle = first.Title,
                DomainName = domainName,
                Tier = tier,
                Rubric = rubric,
                AttemptNo = last.AttemptNo,
                MaxAttempts = PulseRules.MaxFinalAttempts,
                Attempts = submissions.Select(s => attemptDtos[s.Id]).ToList(),
                ProctoringSessionId = last.ProctoringSessionId,
            });
        }

        foreach (var row in preRows)
        {
            var preAssessment = row.PreAssessment;
            var preStatus = preAssessment.Decision switch
            {
                Statuses.FinalSubmissionDecision.Passed => PulseFinalStatus.Approved,
                Statuses.FinalSubmissionDecision.NotYet => PulsePreStatus.NotYet,
                _ => PulseFinalStatus.Pending,
            };
            if (!statusOrder.Contains(preStatus))
            {
                continue;
            }

            var catalogCourse = byCode.GetValueOrDefault((row.OrganizationId, row.Code.ToUpperInvariant()));
            var hasMeta = courseMeta.TryGetValue(row.CourseId, out var fallbackMeta);
            var categoryId = catalogCourse?.CategoryId ?? (hasMeta ? fallbackMeta.CategoryId : (Guid?)null);
            var tier = catalogCourse?.Tier ?? (hasMeta ? fallbackMeta.Tier : (int?)null);
            var domainName = categoryId.HasValue ? categoryNames.GetValueOrDefault(categoryId.Value) : null;
            var assignment = assignmentContent.GetValueOrDefault(row.CourseId);
            items.Add(new PulseFinalReviewItemDto
            {
                Kind = Statuses.ProctoringKind.PreAssessment,
                Assignment = assignment,
                SubmissionId = preAssessment.Id,
                Status = preStatus,
                EmployeeId = row.EmployeeId,
                EmployeeName = row.FullName,
                OrganizationId = row.OrganizationId,
                OrganizationName = organizationNames.GetValueOrDefault(row.OrganizationId),
                DepartmentName = row.DepartmentName,
                PositionName = row.PositionName,
                CourseId = row.CourseId,
                CourseCode = row.Code,
                CourseTitle = row.Title,
                DomainName = domainName,
                Tier = tier,
                Rubric = PulseRules.FinalCriteria.ToList(),
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
                        Decision = preAssessment.Decision,
                        DecisionReason = preAssessment.DecisionReason,
                        ReviewerName = preAssessment.ReviewedByUserId is { } preReviewer ? preReviewerNames.GetValueOrDefault(preReviewer) : null,
                        ReviewedAt = preAssessment.ReviewedAt,
                        ProctoringSessionId = preAssessment.ProctoringSessionId,
                        Choice = PulseExamPaper.Result(
                            preAssessment.ChoiceScore, preAssessment.ChoiceTotal, preAssessment.Decision, true, preChoiceItems.GetValueOrDefault(preAssessment.Id)),
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
        var toEvaluate = items.Where(i => i.Status == PulseFinalStatus.Pending && i.Attempts.Count > 0).ToList();
        var courseText = await PulseCourseText.LoadAsync(_context, toEvaluate.Select(i => i.CourseId).Distinct().ToList());
        var aiTasks = toEvaluate
            .Select(async item =>
            {
                var evidence = item.Attempts[^1].EvidenceText ?? "";
                var prompt = item.Assignment?.PromptHtml ?? "";
                var rubric = item.Rubric is { Count: > 0 } ? item.Rubric : PulseRules.FinalCriteria;
                var criteria = rubric.Select(r =>
                    r.WeightPercent > 0
                        ? $"{r.Title} ({r.WeightPercent}%{(r.IsRequired ? " - Gate bắt buộc" : "")})"
                        : r.Title).ToList();

                // Lấy events giám sát để AI phân tích gian lận
                List<ProctoringEventInfo>? events = null;
                if (item.Recording?.Events is { Count: > 0 } evts)
                {
                    events = evts.Select(e => new ProctoringEventInfo(e.Kind, e.OffsetMs, e.DurationMs)).ToList();
                }

                var courseContent = courseText.GetValueOrDefault(item.CourseId);
                var forceRefresh = input.RefreshAi && (input.RefreshSubmissionId == null || input.RefreshSubmissionId == item.SubmissionId);
                var cacheKey = BuildAiCacheKey(item.SubmissionId, evidence, prompt, criteria, courseContent, item.DomainName, item.Tier, rubric, events);

                if (!forceRefresh && _cache != null && _cache.TryGetValue<PulseAiHintDto>(cacheKey, out var cachedHint) && cachedHint != null)
                {
                    item.AiHint = cachedHint;
                    return;
                }

                var evaluated = await _gemini.EvaluateEvidenceAsync(
                    evidence,
                    prompt,
                    criteria,
                    events,
                    courseContent,
                    item.DomainName,
                    item.Tier,
                    rubric);
                if (_cache != null && evaluated.Source == "GEMINI")
                {
                    _cache.Set(cacheKey, evaluated, TimeSpan.FromHours(6));
                }

                item.AiHint = evaluated;
            })
            .ToList();
        await Task.WhenAll(aiTasks);

        items = items
            .OrderBy(i => Array.IndexOf(statusOrder, i.Status))
            .ThenBy(i => i.Attempts.LastOrDefault()?.SubmittedAt)
            .ToList();

        return new GetPulseFinalReviewsUseCaseOutput
        {
            PendingCount = items.Count(i => i.Status == PulseFinalStatus.Pending),
            PreAssessmentCount = items.Count(i => i.Kind == Statuses.ProctoringKind.PreAssessment && i.Status == PulseFinalStatus.Pending),
            RetryCount = items.Count(i => i.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady),
            DeadlineMissedCount = items.Count(i => i.Status == PulseFinalStatus.DeadlineMissed),
            FlaggedCount = items.Count(i => i.Status == PulseFinalStatus.Flagged),
            ReviewedCount = items.Count(i => i.Status == PulseFinalStatus.Approved || i.Status == PulsePreStatus.NotYet),
            Criteria = PulseRules.FinalCriteria.ToList(),
            Items = items,
        };
    }

    private static string BuildAiCacheKey(
        Guid submissionId,
        string evidence,
        string prompt,
        IReadOnlyList<string> criteria,
        string? courseContent,
        string? domainName,
        int? tier,
        IReadOnlyList<PulseCriterionDto> rubric,
        IReadOnlyList<ProctoringEventInfo>? events)
    {
        var signature = new StringBuilder()
            .Append(submissionId).Append('|')
            .Append(evidence).Append('|')
            .Append(prompt).Append('|')
            .Append(domainName ?? "").Append('|')
            .Append(tier?.ToString() ?? "").Append('|')
            .Append(string.Join(";", criteria)).Append('|')
            .Append(string.Join(";", rubric.Select(r => $"{r.Number}:{r.Title}:{r.WeightPercent}:{r.IsRequired}"))).Append('|')
            .Append(courseContent ?? "").Append('|')
            .Append(events == null ? "" : string.Join(",", events.Select(e => $"{e.Kind}:{e.OffsetMs}:{e.DurationMs}")));
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(signature.ToString())));
        return $"pulse:ai-hint:v3:{submissionId}:{hash[..16]}";
    }
}
