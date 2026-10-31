using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

public static class PulseOutcomeKind
{
    /// <summary>Bài cuối khóa được quản lý duyệt.</summary>
    public const string Course = "COURSE";
    /// <summary>Bài đánh giá trước khi học đạt: khóa được công nhận không cần học.</summary>
    public const string PreAssessment = "PRE_ASSESSMENT";
    /// <summary>Chứng chỉ đã cấp từ luồng học trước (không có bài cuối khóa Pulse).</summary>
    public const string Certificate = "CERTIFICATE";
    /// <summary>Nhiệm vụ thực tế được quản lý duyệt.</summary>
    public const string PracticalTask = "PRACTICAL_TASK";
}

public class PulseOutcomeDto
{
    /// <summary>"final-{submissionId}" | "pre-{preAssessmentId}" | "cert-{certificateId}" | "task-{evaluationId}".</summary>
    public string Id { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    /// <summary>Lĩnh vực · cấp (nếu xác định được).</summary>
    public string? Subtitle { get; set; }
    public int? Level { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    /// <summary>Mã tham chiếu hiển thị trên bản ghi.</summary>
    public string Reference { get; set; } = string.Empty;
    public string? ReviewerName { get; set; }
    public string? ReviewNote { get; set; }
    public string HolderName { get; set; } = string.Empty;
    public string? OrganizationName { get; set; }
    public Guid? CourseId { get; set; }
}

/// <summary>
/// Kết quả đã xác nhận của nhân viên (§12.5): bài cuối khóa được quản lý duyệt, bài đánh giá trước khi học đạt,
/// nhiệm vụ thực tế được duyệt,
/// và chứng chỉ đã cấp ở luồng học trước. Không có chữ ký số hay tra cứu công khai.
/// </summary>
public class PulseOutcomeReader
{
    private readonly IApplicationDbContext _context;

    public PulseOutcomeReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PulseOutcomeDto>> LoadAsync(PulseLearnerSnapshot snapshot)
    {
        var employee = snapshot.Employee;
        var outcomes = new List<PulseOutcomeDto>();
        var courseLabel = snapshot.Courses.ToDictionary(c => c.Course.Code, c => (c.Domain.Name, c.Course.Tier), StringComparer.OrdinalIgnoreCase);

        var finals = await (
                from submission in _context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employee.Id && submission.Decision == Statuses.FinalSubmissionDecision.Passed
                select new
                {
                    submission.Id,
                    submission.AttemptNo,
                    submission.ReviewedAt,
                    submission.DecisionReason,
                    submission.ReviewedByUserId,
                    submission.EnrollmentId,
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();
        var reviewerIds = finals.Where(f => f.ReviewedByUserId.HasValue).Select(f => f.ReviewedByUserId!.Value).Distinct().ToList();
        var reviewers = await _context.Users.AsNoTracking()
            .Where(u => reviewerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);
        foreach (var final in finals)
        {
            var label = courseLabel.GetValueOrDefault(final.Code);
            outcomes.Add(new PulseOutcomeDto
            {
                Id = $"final-{final.Id}",
                Kind = PulseOutcomeKind.Course,
                Title = final.Title,
                Subtitle = label.Name == null ? null : $"{label.Name} · {PulseRules.LevelName(label.Tier)}",
                Level = label.Name == null ? null : label.Tier,
                IssuedAt = final.ReviewedAt ?? DateTimeOffset.MinValue,
                Source = $"Bài cuối khóa được quản lý duyệt sau {final.AttemptNo} lần nộp",
                Reference = $"{final.Code}-{final.Id.ToString("N")[..8].ToUpperInvariant()}",
                ReviewerName = final.ReviewedByUserId is { } reviewer ? reviewers.GetValueOrDefault(reviewer) : null,
                ReviewNote = final.DecisionReason,
                HolderName = employee.FullName,
                OrganizationName = snapshot.OrganizationName,
                CourseId = final.CourseId,
            });
        }

        var preAssessments = await (
                from preAssessment in _context.CoursePreAssessments.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on preAssessment.CourseId equals course.Id
                where preAssessment.EmployeeId == employee.Id && preAssessment.Decision == Statuses.FinalSubmissionDecision.Passed
                select new
                {
                    preAssessment.Id,
                    preAssessment.ReviewedAt,
                    preAssessment.DecisionReason,
                    preAssessment.ReviewedByUserId,
                    preAssessment.EnrollmentId,
                    CourseId = course.Id,
                    course.Code,
                    course.Title,
                })
            .ToListAsync();
        var preReviewerIds = preAssessments.Where(p => p.ReviewedByUserId.HasValue).Select(p => p.ReviewedByUserId!.Value).Except(reviewers.Keys).Distinct().ToList();
        foreach (var reviewer in await _context.Users.AsNoTracking().Where(u => preReviewerIds.Contains(u.Id)).Select(u => new { u.Id, u.DisplayName }).ToListAsync())
        {
            reviewers[reviewer.Id] = reviewer.DisplayName;
        }

        foreach (var preAssessment in preAssessments)
        {
            var label = courseLabel.GetValueOrDefault(preAssessment.Code);
            outcomes.Add(new PulseOutcomeDto
            {
                Id = $"pre-{preAssessment.Id}",
                Kind = PulseOutcomeKind.PreAssessment,
                Title = preAssessment.Title,
                Subtitle = label.Name == null ? null : $"{label.Name} · {PulseRules.LevelName(label.Tier)}",
                Level = label.Name == null ? null : label.Tier,
                IssuedAt = preAssessment.ReviewedAt ?? DateTimeOffset.MinValue,
                Source = "Bài đánh giá trước khi học được quản lý công nhận — không cần học khóa",
                Reference = $"{preAssessment.Code}-{preAssessment.Id.ToString("N")[..8].ToUpperInvariant()}",
                ReviewerName = preAssessment.ReviewedByUserId is { } reviewer ? reviewers.GetValueOrDefault(reviewer) : null,
                ReviewNote = preAssessment.DecisionReason,
                HolderName = employee.FullName,
                OrganizationName = snapshot.OrganizationName,
                CourseId = preAssessment.CourseId,
            });
        }

        var enrollmentCourseMap = await _context.Enrollments.AsNoTracking()
            .Where(e => e.EmployeeId == employee.Id)
            .ToDictionaryAsync(e => e.Id, e => e.CourseId);

        var pulseEnrollmentIds = finals.Select(f => f.EnrollmentId)
            .Concat(preAssessments.Where(p => p.EnrollmentId.HasValue).Select(p => p.EnrollmentId!.Value))
            .ToHashSet();
        var certificates = await _context.Certificates
            .AsNoTracking()
            .Where(c => c.EmployeeId == employee.Id && c.Status == Statuses.Certificate.Valid)
            .Select(c => new { c.Id, c.EnrollmentId, c.CertificateCode, c.CourseTitleSnapshot, c.PrimaryCompetencySnapshot, c.IssuedAt })
            .ToListAsync();
        outcomes.AddRange(certificates
            .Where(c => !pulseEnrollmentIds.Contains(c.EnrollmentId))
            .Select(c => new PulseOutcomeDto
            {
                Id = $"cert-{c.Id}",
                Kind = PulseOutcomeKind.Certificate,
                Title = c.CourseTitleSnapshot,
                Subtitle = c.PrimaryCompetencySnapshot,
                IssuedAt = c.IssuedAt,
                Source = "Chứng chỉ hoàn thành khóa học",
                Reference = c.CertificateCode,
                HolderName = employee.FullName,
                OrganizationName = snapshot.OrganizationName,
                CourseId = enrollmentCourseMap.TryGetValue(c.EnrollmentId, out var cid) ? cid : null,
            }));

        var handledCourseIds = outcomes.Where(o => o.CourseId.HasValue).Select(o => o.CourseId!.Value).ToHashSet();

        foreach (var c in snapshot.Courses.Where(c => c.Approved && !handledCourseIds.Contains(c.Course.CourseId)))
        {
            var label = courseLabel.GetValueOrDefault(c.Course.Code);
            outcomes.Add(new PulseOutcomeDto
            {
                Id = c.Enrollment != null ? $"course-{c.Enrollment.Id}" : $"course-{c.Course.CourseId}",
                Kind = c.ApprovedVia == PulseApprovedVia.PreAssessment ? PulseOutcomeKind.PreAssessment : PulseOutcomeKind.Course,
                Title = c.Course.Title,
                Subtitle = label.Name == null ? null : $"{label.Name} · {PulseRules.LevelName(label.Tier)}",
                Level = label.Name == null ? null : label.Tier,
                IssuedAt = c.Enrollment?.CompletedAt ?? c.Enrollment?.UpdatedAt ?? DateTimeOffset.UtcNow,
                Source = c.ApprovedVia == PulseApprovedVia.PreAssessment
                    ? "Bài đánh giá trước khi học được công nhận — miễn học lý thuyết"
                    : "Khóa học hoàn thành trong chương trình đào tạo doanh nghiệp",
                Reference = $"{c.Course.Code}-{c.Course.CourseId.ToString("N")[..8].ToUpperInvariant()}",
                ReviewerName = snapshot.Reviewer?.Name,
                ReviewNote = "Hoàn thành và công nhận năng lực theo lộ trình vị trí.",
                HolderName = employee.FullName,
                OrganizationName = snapshot.OrganizationName,
                CourseId = c.Course.CourseId,
            });
            handledCourseIds.Add(c.Course.CourseId);
        }

        var tasks = await (
                from evaluation in _context.TaskEvaluations.AsNoTracking()
                join submission in _context.TaskSubmissions.AsNoTracking() on evaluation.TaskSubmissionId equals submission.Id
                join assignment in _context.TaskAssignments.AsNoTracking() on submission.TaskAssignmentId equals assignment.Id
                where assignment.EmployeeId == employee.Id && evaluation.Verdict == Statuses.TaskVerdict.Passed
                select new
                {
                    evaluation.Id,
                    evaluation.EvaluatedAt,
                    evaluation.Feedback,
                    evaluation.ReviewerUserId,
                    AssignmentId = assignment.Id,
                    assignment.TitleSnapshot,
                })
            .ToListAsync();
        var assignmentIds = tasks.Select(t => t.AssignmentId).Distinct().ToList();
        var targetRows = await (
                from target in _context.AssignedTaskTargets.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on target.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where assignmentIds.Contains(target.TaskAssignmentId)
                select new { target.TaskAssignmentId, target.SortOrder, target.TargetLevel, CategoryName = category.Name })
            .ToListAsync();
        var targets = targetRows
            .GroupBy(t => t.TaskAssignmentId)
            .ToDictionary(g => g.Key, g => g.OrderBy(t => t.SortOrder).First());
        var taskReviewerIds = tasks.Select(t => t.ReviewerUserId).Distinct().ToList();
        var taskReviewers = await _context.Users.AsNoTracking()
            .Where(u => taskReviewerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);
        outcomes.AddRange(tasks.Select(t => new PulseOutcomeDto
        {
            Id = $"task-{t.Id}",
            Kind = PulseOutcomeKind.PracticalTask,
            Title = t.TitleSnapshot,
            Subtitle = targets.GetValueOrDefault(t.AssignmentId) is { } target
                ? $"{PulseLearnerReader.DisplayName(target.CategoryName)} · {PulseRules.LevelName(target.TargetLevel)}"
                : null,
            Level = targets.GetValueOrDefault(t.AssignmentId)?.TargetLevel,
            IssuedAt = t.EvaluatedAt,
            Source = "Minh chứng thực tế được quản lý duyệt",
            Reference = $"TASK-{t.AssignmentId.ToString("N")[..8].ToUpperInvariant()}",
            ReviewerName = taskReviewers.GetValueOrDefault(t.ReviewerUserId),
            ReviewNote = t.Feedback,
            HolderName = employee.FullName,
            OrganizationName = snapshot.OrganizationName,
        }));

        return outcomes.OrderByDescending(o => o.IssuedAt).ToList();
    }
}
