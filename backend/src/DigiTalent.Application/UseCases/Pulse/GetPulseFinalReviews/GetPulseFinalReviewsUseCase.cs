using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /pulse/final-reviews — kết quả bài đầu vào và bài cuối khóa cho quản lý; hàng chờ chấm cho mentor.
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

    private sealed record PreAssessmentRow(
        CoursePreAssessment PreAssessment,
        Guid EmployeeId,
        Guid OrganizationId,
        string FullName,
        string DepartmentName,
        Guid? JobPositionId,
        Guid CourseId,
        string Code,
        string Title);

    public async Task<GetPulseFinalReviewsUseCaseOutput> ExecuteAsync(GetPulseFinalReviewsUseCaseInput input)
    {
        var statusOrder = input.IncludeReviewed ? AllStatusOrder : ActiveStatusOrder;
        var managerView = _currentUser.IsDepartmentManager && !_currentUser.IsAdmin
            && !_currentUser.Roles.Contains(Roles.Mentor);
        var employees = _scope.ResultEmployees();
        if (input.DepartmentId is { } departmentId)
        {
            employees = employees.Where(e => e.DepartmentId == departmentId);
        }

        var rows = await (
                from submission in _context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join employee in employees.AsNoTracking() on enrollment.EmployeeId equals employee.Id
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
                    employee.JobPositionId,
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();

        var preRows = input.IncludeReviewed
            ? await (
                    from preAssessment in _context.CoursePreAssessments.AsNoTracking()
                    join employee in employees.AsNoTracking() on preAssessment.EmployeeId equals employee.Id
                    join course in _context.Courses.AsNoTracking() on preAssessment.CourseId equals course.Id
                    join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                    where (input.OrganizationId == null || employee.OrganizationId == input.OrganizationId)
                          // Bài cũ chờ chấm đã bị thay bằng bài kiểm tra đầu vào tự chấm: không còn vào hàng chờ; bài đã chấm chỉ còn là lịch sử.
                          && preAssessment.Decision != null
                    select new PreAssessmentRow(
                        preAssessment,
                        employee.Id,
                        employee.OrganizationId,
                        employee.FullName,
                        department.Name,
                        employee.JobPositionId,
                        course.Id,
                        course.Code,
                        course.Title))
                .ToListAsync()
            : new List<PreAssessmentRow>();

        var now = _clock.GetUtcNow();
        var finalGroups = rows
            .GroupBy(r => r.Enrollment.Id)
            .Select(group =>
            {
                var submissions = group.Select(r => r.Submission).OrderBy(s => s.AttemptNo).ToList();
                var first = group.First();
                var status = PulseRules.FinalStatusOf(first.Enrollment, submissions, true, now);
                return new
                {
                    First = first,
                    Submissions = submissions,
                    Status = status,
                    SubmittedAt = submissions[^1].SubmittedAt,
                };
            })
            .Where(g => statusOrder.Contains(g.Status))
            .ToList();

        var filteredPreRows = preRows
            .Select(row =>
            {
                var preStatus = row.PreAssessment.Decision switch
                {
                    Statuses.FinalSubmissionDecision.Passed => PulseFinalStatus.Approved,
                    Statuses.FinalSubmissionDecision.NotYet => PulsePreStatus.NotYet,
                    _ => PulseFinalStatus.Pending,
                };
                return new { Row = row, Status = preStatus };
            })
            .Where(x => statusOrder.Contains(x.Status))
            .ToList();

        var pendingCount = finalGroups.Count(i => i.Status == PulseFinalStatus.Pending)
                           + filteredPreRows.Count(i => i.Status == PulseFinalStatus.Pending);
        var preAssessmentCount = filteredPreRows.Count(i => i.Status == PulseFinalStatus.Pending);
        var retryCount = finalGroups.Count(i => i.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady)
                         + filteredPreRows.Count(i => i.Status is PulseFinalStatus.RetryWait or PulseFinalStatus.RetryReady);
        var deadlineMissedCount = finalGroups.Count(i => i.Status == PulseFinalStatus.DeadlineMissed);
        var flaggedCount = finalGroups.Count(i => i.Status == PulseFinalStatus.Flagged);
        var reviewedCount = finalGroups.Count(i => i.Status == PulseFinalStatus.Approved || i.Status == PulsePreStatus.NotYet)
                            + filteredPreRows.Count(i => i.Status == PulseFinalStatus.Approved || i.Status == PulsePreStatus.NotYet);
        var totalCount = finalGroups.Count + filteredPreRows.Count;

        // Sắp xếp toàn bộ theo thứ tự ưu tiên trước khi phân trang (nếu có).
        var orderedEntries = finalGroups
            .Select(g => (IsFinal: true, g.Status, g.SubmittedAt, Final: (object?)g, Pre: (object?)null))
            .Concat(filteredPreRows.Select(p => (IsFinal: false, p.Status, SubmittedAt: p.Row.PreAssessment.SubmittedAt, Final: (object?)null, Pre: (object?)p)))
            .OrderBy(e => Array.IndexOf(statusOrder, e.Status))
            .ThenBy(e => e.SubmittedAt)
            .ToList();

        var hasPaging = input.Page is > 0 && input.PageSize is > 0;
        var pageSize = hasPaging ? Math.Clamp(input.PageSize!.Value, 1, 200) : (int?)null;
        var pagedEntries = hasPaging
            ? orderedEntries.Skip((input.Page!.Value - 1) * pageSize!.Value).Take(pageSize.Value).ToList()
            : orderedEntries;

        var activeFinalSubmissions = finalGroups
            .Where(g => pagedEntries.Any(e => e.IsFinal && ReferenceEquals(e.Final, g)))
            .ToList();
        var activePreEntries = filteredPreRows
            .Where(p => pagedEntries.Any(e => !e.IsFinal && ReferenceEquals(e.Pre, p)))
            .ToList();

        var organizationIds = activeFinalSubmissions.Select(g => g.First.OrganizationId)
            .Concat(activePreEntries.Select(p => p.Row.OrganizationId))
            .Distinct()
            .ToList();

        var catalogByOrg = await _catalog.LoadManyAsync(organizationIds);
        var byCode = new Dictionary<(Guid, string), PulseCourseRef>();
        foreach (var (orgId, courses) in catalogByOrg)
        {
            foreach (var course in courses)
            {
                byCode[(orgId, course.Code.ToUpperInvariant())] = course;
            }
        }

        var courseIds = activeFinalSubmissions.Select(g => g.First.CourseId)
            .Concat(activePreEntries.Select(p => p.Row.CourseId))
            .Distinct()
            .ToList();
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
        var categoryNames = categoryIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.CompetencyCategories.AsNoTracking()
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => PulseLearnerReader.DisplayName(c.Name));
        var organizationNames = organizationIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.Organizations.AsNoTracking()
                .Where(o => organizationIds.Contains(o.Id))
                .ToDictionaryAsync(o => o.Id, o => o.Name);

        var jobPositionIds = activeFinalSubmissions.Select(g => g.First.JobPositionId)
            .Concat(activePreEntries.Select(p => p.Row.JobPositionId))
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();
        var jobPositionNames = jobPositionIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.JobPositions.AsNoTracking()
                .Where(p => jobPositionIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Name);

        var attemptDtos = await _final.MapByIdAsync(
            activeFinalSubmissions.SelectMany(g => g.Submissions).ToList(),
            forReviewer: true);
        var preChoiceItems = await _paper.LoadItemsAsync(activePreEntries
            .Where(r => r.Row.PreAssessment.ChoiceTotal != null)
            .Select(r => r.Row.PreAssessment.Id)
            .ToList());
        var preReviewerIds = activePreEntries
            .Select(r => r.Row.PreAssessment.ReviewedByUserId)
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
        foreach (var group in activeFinalSubmissions)
        {
            var first = group.First;
            var submissions = group.Submissions;
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
                Status = group.Status,
                EmployeeId = first.EmployeeId,
                EmployeeName = first.FullName,
                OrganizationId = first.OrganizationId,
                OrganizationName = organizationNames.GetValueOrDefault(first.OrganizationId),
                DepartmentName = first.DepartmentName,
                PositionName = first.JobPositionId is { } posId ? jobPositionNames.GetValueOrDefault(posId) : null,
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

        foreach (var entry in activePreEntries)
        {
            var row = entry.Row;
            var preAssessment = row.PreAssessment;
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
                Status = entry.Status,
                EmployeeId = row.EmployeeId,
                EmployeeName = row.FullName,
                OrganizationId = row.OrganizationId,
                OrganizationName = organizationNames.GetValueOrDefault(row.OrganizationId),
                DepartmentName = row.DepartmentName,
                PositionName = row.JobPositionId is { } prePosId ? jobPositionNames.GetValueOrDefault(prePosId) : null,
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

        if (!input.SkipAi)
        {
            // AI evaluation: đọc cache pulse_ai_reviews trước; chỉ gọi Gemini trực tiếp khi refresh thủ công hoặc có đúng 1 bài chưa cache
            // (tránh gọi đồng thời hàng chục request Gemini gây 429 / 504 khi mở hàng chờ nhiều tổ chức).
            var toEvaluate = items.Where(i => !managerView && i.Status == PulseFinalStatus.Pending && i.Attempts.Count > 0).ToList();
            if (toEvaluate.Count > 0)
            {
                var stored = await PulseAiReviewStore.LoadAsync(_context, toEvaluate.Select(i => i.SubmissionId).ToList());
                var needCourseText = input.RefreshAi || stored.Count > 0 || toEvaluate.Count == 1;
                var courseText = needCourseText
                    ? await PulseCourseText.LoadAsync(_context, toEvaluate.Select(i => i.CourseId).Distinct().ToList())
                    : new Dictionary<Guid, string>();

                var pendingCalls = new List<(PulseFinalReviewItemDto Item, string Evidence, string Prompt, List<string> Criteria, List<ProctoringEventInfo>? Events, string? CourseContent, IReadOnlyList<PulseCriterionDto> Rubric, int? DomainNumber, string InputHash, PulseAiHintDto? Saved)>();
                var reviewed = new System.Collections.Concurrent.ConcurrentBag<PulseAiReviewStore.Entry>();

                foreach (var item in toEvaluate)
                {
                    var evidence = item.Attempts[^1].EvidenceText ?? "";
                    var prompt = item.Assignment?.PromptHtml ?? "";
                    var rubric = item.Rubric is { Count: > 0 } ? item.Rubric : PulseRules.FinalCriteria;
                    var criteria = rubric.Select(r =>
                        r.WeightPercent > 0
                            ? $"{r.Title} ({r.WeightPercent}%{(r.IsRequired ? " - Gate bắt buộc" : "")})"
                            : r.Title).ToList();

                    List<ProctoringEventInfo>? events = null;
                    if (item.Recording?.Events is { Count: > 0 } evts)
                    {
                        events = evts.Select(e => new ProctoringEventInfo(e.Kind, e.OffsetMs, e.DurationMs)).ToList();
                    }

                    var courseContent = courseText.GetValueOrDefault(item.CourseId);
                    var forceRefresh = input.RefreshAi && (input.RefreshSubmissionId == null || input.RefreshSubmissionId == item.SubmissionId);
                    var inputHash = PulseAiReviewStore.InputHash(evidence, prompt, criteria, courseContent, item.DomainName, item.Tier, rubric, events);
                    var saved = PulseAiReviewStore.Reuse(stored, item.Kind, item.SubmissionId, inputHash);
                    var domainNumber = PulseEssayRubric.ResolveDomainNumber(null, item.DomainName);

                    if (input.EvidenceMetric != null && input.RefreshSubmissionId is { } targetId && targetId != item.SubmissionId)
                    {
                        item.AiHint = saved ?? PulseRules.AiHint(evidence, prompt, rubric, domainNumber, item.Tier);
                        continue;
                    }

                    if (!forceRefresh && saved != null)
                    {
                        item.AiHint = saved;
                        continue;
                    }

                    pendingCalls.Add((item, evidence, prompt, criteria, events, courseContent, rubric, domainNumber, inputHash, saved));
                }

                // Cho phép gọi live Gemini nếu mentor bấm làm mới (RefreshAi) hoặc chỉ có đúng 1 bài chưa cache;
                // nếu có nhiều bài chưa cache cùng lúc -> trả fallback nhanh (< 1ms) để không làm chậm / 504 hàng chờ.
                var allowLiveBatch = input.RefreshAi || pendingCalls.Count == 1;
                if (!allowLiveBatch)
                {
                    foreach (var p in pendingCalls)
                    {
                        p.Item.AiHint = p.Saved ?? PulseRules.AiHint(p.Evidence, p.Prompt, p.Rubric, p.DomainNumber, p.Item.Tier);
                    }
                }
                else
                {
                    var aiTasks = pendingCalls.Select(async p =>
                    {
                        var item = p.Item;
                        if (input.RefreshAi && input.RefreshSubmissionId == item.SubmissionId &&
                            input.EvidenceMetric is { } metric && p.Saved?.Detail is { } detail)
                        {
                            item.AiHint = p.Saved;
                            var note = metric switch
                            {
                                "plagiarism" => detail.PlagiarismNote,
                                "ai" => detail.AiGeneratedNote,
                                "relevance" => detail.RelevanceNote,
                                "depth" => detail.DepthNote,
                                "clarity" => detail.ClarityNote,
                                "verdict" => detail.Verdict,
                                _ => null,
                            };
                            if (note == null || detail.Evidence?.ContainsKey(metric) == true) return;

                            if (!_gemini.IsConfigured)
                            {
                                item.AiHint = p.Saved with { EvidenceLookupStatus = "NOT_CONFIGURED" };
                                return;
                            }

                            var passage = await _gemini.FindEvidencePassageAsync(p.Evidence, metric, note);
                            if (passage == null)
                            {
                                item.AiHint = p.Saved with { EvidenceLookupStatus = "UNAVAILABLE" };
                                return;
                            }

                            var excerpts = detail.Evidence?.ToDictionary(pair => pair.Key, pair => pair.Value) ?? new();
                            excerpts[metric] = passage.Length == 0 ? null : passage;
                            var enriched = p.Saved with { Detail = detail with { Evidence = excerpts } };
                            item.AiHint = enriched;
                            reviewed.Add(new PulseAiReviewStore.Entry(item.OrganizationId, item.Kind, item.SubmissionId, p.InputHash, enriched));
                            return;
                        }

                        using var timeoutCts = !input.RefreshAi
                            ? new CancellationTokenSource(TimeSpan.FromMilliseconds(1200))
                            : null;
                        var ct = timeoutCts?.Token ?? CancellationToken.None;
                        var evaluated = await _gemini.EvaluateEvidenceAsync(
                            p.Evidence,
                            p.Prompt,
                            p.Criteria,
                            p.Events,
                            p.CourseContent,
                            item.DomainName,
                            item.Tier,
                            p.Rubric,
                            ct) with { ReviewedAt = _clock.GetUtcNow() };
                        if (p.Saved != null &&
                            (evaluated.Source != PulseAiReviewStore.AiSource || (p.Saved.Detail != null && evaluated.Detail == null)))
                        {
                            item.AiHint = p.Saved;
                            return;
                        }

                        item.AiHint = evaluated;
                        reviewed.Add(new PulseAiReviewStore.Entry(item.OrganizationId, item.Kind, item.SubmissionId, p.InputHash, evaluated));
                    }).ToList();

                    await Task.WhenAll(aiTasks);
                    await PulseAiReviewStore.SaveAsync(_context, reviewed.ToList());
                }
            }
        }

        items = items
            .OrderBy(i => Array.IndexOf(statusOrder, i.Status))
            .ThenBy(i => i.Attempts.LastOrDefault()?.SubmittedAt)
            .ToList();

        return new GetPulseFinalReviewsUseCaseOutput
        {
            PendingCount = pendingCount,
            PreAssessmentCount = preAssessmentCount,
            RetryCount = retryCount,
            DeadlineMissedCount = deadlineMissedCount,
            FlaggedCount = flaggedCount,
            ReviewedCount = reviewedCount,
            TotalCount = totalCount,
            Page = hasPaging ? input.Page : null,
            PageSize = pageSize,
            Criteria = PulseRules.FinalCriteria.ToList(),
            Items = items,
        };
    }
}
