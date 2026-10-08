using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Application.UseCases.Learning.CourseAssignments;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

/// <summary>
/// Everything about one employee in the caller's scope (OW-03 member tabs, OW-20 competency profile): confirmed vs
/// required level of every Circular 02/2025 competency, latest skill gap snapshot, course assignments, confirmed
/// evidence, practical tasks and submissions, assessment attempts and certificates. Out of scope → 404.
/// </summary>
public class GetEmployeeCapabilityUseCase : IUseCase<GetEmployeeCapabilityUseCaseInput, GetEmployeeCapabilityUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _employeeScope;
    private readonly WorkforceReader _workforceReader;
    private readonly SkillGapRunReader _skillGapReader;
    private readonly MyTaskReader _taskReader;

    public GetEmployeeCapabilityUseCase(
        IApplicationDbContext context,
        EmployeeScope employeeScope,
        WorkforceReader workforceReader,
        SkillGapRunReader skillGapReader,
        MyTaskReader taskReader)
    {
        _context = context;
        _employeeScope = employeeScope;
        _workforceReader = workforceReader;
        _skillGapReader = skillGapReader;
        _taskReader = taskReader;
    }

    public async Task<GetEmployeeCapabilityUseCaseOutput> ExecuteAsync(GetEmployeeCapabilityUseCaseInput input)
    {
        var employee = await _employeeScope.GetVisibleEmployeeAsync(input.EmployeeId);
        var visible = _employeeScope.VisibleEmployees();

        var summary = (await _workforceReader.LoadRowsAsync(visible.Where(e => e.Id == employee.Id))).Single();
        var evidence = await LoadEvidenceAsync(employee.Id);
        var run = await _skillGapReader.FindLatestDetailAsync(visible, employee.Id);
        var tasks = await _taskReader.LoadAsync(employee.Id);

        return new GetEmployeeCapabilityUseCaseOutput
        {
            Employee = summary,
            Summary = summary,
            Competencies = await LoadCompetencyLevelsAsync(employee.OrganizationId, employee.JobPositionId, evidence),
            SkillGap = run == null
                ? null
                : new WorkforceSkillGap
                {
                    RunId = run.RunId,
                    GeneratedAt = run.GeneratedAt,
                    RequirementSetVersionNo = run.RequirementSetVersionNo,
                    Summary = run.Summary,
                    Items = run.Items,
                },
            Learning = await LoadLearningAsync(employee.Id),
            Evidence = evidence.OrderByDescending(e => e.ConfirmedAt).ToList(),
            Tasks = tasks.Select(ToTaskRow).ToList(),
            Submissions = tasks
                .SelectMany(task => task.Submissions.Select(submission => ToSubmissionRow(task, submission)))
                .OrderByDescending(submission => submission.SubmittedAt)
                .ToList(),
            Assessments = await LoadAttemptsAsync(employee.Id),
            Certificates = await LoadCertificatesAsync(employee.Id),
        };
    }

    /// <summary>Current confirmed level of each competency with the source and note of the confirming evidence.</summary>
    private async Task<List<EvidenceRow>> LoadEvidenceAsync(Guid employeeId)
    {
        var tt02 = Tt02Mappings.Query(_context);
        var rows = await (
                from profile in _context.EmployeeCompetencyProfiles.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on profile.CompetencyId equals competency.Id
                join evidence in _context.CompetencyEvidences.AsNoTracking() on profile.LatestConfirmingEvidenceId equals evidence.Id into evidences
                from evidence in evidences.DefaultIfEmpty()
                where profile.EmployeeId == employeeId
                select new
                {
                    profile.CompetencyId,
                    competency.Name,
                    FrameworkCode = tt02.Where(m => m.CompetencyId == competency.Id).Select(m => m.SourceCode).FirstOrDefault(),
                    profile.ConfirmedLevel,
                    SourceType = evidence != null ? evidence.SourceType : null,
                    profile.ConfirmedAt,
                    Note = evidence != null ? evidence.ReviewNote : null,
                })
            .ToListAsync();

        return rows.Select(row => new EvidenceRow
        {
            CompetencyId = row.CompetencyId,
            CompetencyName = row.Name,
            FrameworkCode = row.FrameworkCode ?? string.Empty,
            Level = row.ConfirmedLevel,
            Source = EvidenceSources.ToApi(row.SourceType) ?? string.Empty,
            ConfirmedAt = row.ConfirmedAt,
            Note = row.Note,
        }).ToList();
    }

    /// <summary>
    /// Active competencies of the organization mapped to Circular 02/2025, plus any competency the position requires or
    /// the employee holds, ordered by domain then framework code.
    /// </summary>
    private async Task<List<CompetencyLevelRow>> LoadCompetencyLevelsAsync(Guid organizationId, Guid? jobPositionId, List<EvidenceRow> evidence)
    {
        var required = jobPositionId == null
            ? new Dictionary<Guid, int>()
            : await (
                    from item in _context.PositionRequirementItems.AsNoTracking()
                    join set in _context.PositionRequirementSets.AsNoTracking() on item.RequirementSetId equals set.Id
                    where set.JobPositionId == jobPositionId && set.Status == Statuses.PositionRequirementSet.Active
                    select new { item.CompetencyId, item.RequiredLevel })
                .ToDictionaryAsync(x => x.CompetencyId, x => x.RequiredLevel);
        var held = evidence.ToDictionary(e => e.CompetencyId);

        var tt02 = Tt02Mappings.Query(_context);
        var competencies = await (
                from competency in _context.Competencies.AsNoTracking()
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where category.OrganizationId == organizationId
                select new
                {
                    competency.Id,
                    competency.Name,
                    competency.Status,
                    CategoryName = category.Name,
                    category.SortOrder,
                    FrameworkCode = tt02.Where(m => m.CompetencyId == competency.Id).Select(m => m.SourceCode).FirstOrDefault(),
                })
            .ToListAsync();

        return competencies
            .Where(c => (c.FrameworkCode != null && c.Status == Statuses.Competency.Active) || required.ContainsKey(c.Id) || held.ContainsKey(c.Id))
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.FrameworkCode, FrameworkCodeComparer.Instance)
            .ThenBy(c => c.Name)
            .Select(c =>
            {
                held.TryGetValue(c.Id, out var confirmed);
                return new CompetencyLevelRow
                {
                    CompetencyId = c.Id,
                    FrameworkCode = c.FrameworkCode ?? string.Empty,
                    Name = c.Name,
                    CategoryName = c.CategoryName,
                    CategorySortOrder = c.SortOrder,
                    CurrentLevel = confirmed?.Level,
                    RequiredLevel = required.GetValueOrDefault(c.Id),
                    Source = confirmed?.Source,
                    ConfirmedAt = confirmed?.ConfirmedAt,
                    Note = confirmed?.Note,
                };
            })
            .ToList();
    }

    /// <summary>Course assignments of the employee (cancelled ones excluded), newest first — same row as GET /course-assignments.</summary>
    private async Task<List<AssignmentRow>> LoadLearningAsync(Guid employeeId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoon = today.AddDays(7);
        return await (
                from assignment in _context.CourseAssignments.AsNoTracking()
                join employee in _context.Employees.AsNoTracking() on assignment.EmployeeId equals employee.Id
                join course in _context.Courses.AsNoTracking() on assignment.CourseId equals course.Id
                join department in _context.Departments.AsNoTracking() on employee.DepartmentId equals department.Id
                join position in _context.JobPositions.AsNoTracking() on employee.JobPositionId equals position.Id into positions
                from position in positions.DefaultIfEmpty()
                join assignedBy in _context.Users.AsNoTracking() on assignment.AssignedByUserId equals assignedBy.Id into users
                from assignedBy in users.DefaultIfEmpty()
                join enrollment in _context.Enrollments.AsNoTracking() on assignment.Id equals enrollment.CourseAssignmentId into enrollments
                from enrollment in enrollments.DefaultIfEmpty()
                where assignment.EmployeeId == employeeId && assignment.Status != Statuses.Enrollment.Cancelled
                orderby assignment.AssignedAt descending
                select new AssignmentRow
                {
                    Id = assignment.Id,
                    EmployeeId = assignment.EmployeeId,
                    EmployeeName = employee.FullName,
                    EmployeeCode = employee.EmployeeCode,
                    DepartmentName = department.Name,
                    PositionName = position != null ? position.Name : null,
                    CourseId = assignment.CourseId,
                    CourseCode = course.Code,
                    CourseTitle = course.Title,
                    AssignedAt = assignment.AssignedAt,
                    AssignedByName = assignedBy != null ? assignedBy.DisplayName : string.Empty,
                    DueDate = assignment.DueDate != null ? assignment.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    Status = assignment.Status,
                    ProgressPercent = enrollment != null ? (int)enrollment.ProgressPercent : 0,
                    CompletedAt = enrollment != null ? enrollment.CompletedAt : null,
                    Source = assignment.AssignmentSource,
                    Overdue = assignment.DueDate != null && assignment.DueDate < today && assignment.Status != Statuses.Enrollment.Completed,
                    DueSoon = assignment.DueDate != null && assignment.DueDate >= today && assignment.DueDate <= dueSoon
                              && assignment.Status != Statuses.Enrollment.Completed,
                })
            .ToListAsync();
    }

    private async Task<List<WorkforceAttemptRow>> LoadAttemptsAsync(Guid employeeId)
    {
        return await (
                from attempt in _context.AssessmentAttempts.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on attempt.EnrollmentId equals enrollment.Id
                join assessment in _context.Assessments.AsNoTracking() on attempt.AssessmentId equals assessment.Id
                join course in _context.Courses.AsNoTracking() on assessment.CourseId equals course.Id
                where enrollment.EmployeeId == employeeId && attempt.SubmittedAt != null
                orderby attempt.SubmittedAt descending
                select new WorkforceAttemptRow
                {
                    Id = attempt.Id,
                    AssessmentId = assessment.Id,
                    CourseTitle = course.Title,
                    Score = attempt.Score,
                    TotalQuestions = _context.AssessmentQuestions.Count(q => q.AssessmentId == assessment.Id),
                    CorrectAnswers = _context.AssessmentAnswers.Count(a => a.AttemptId == attempt.Id && a.IsCorrect == true),
                    Passed = attempt.Passed == true,
                    SubmittedAt = attempt.SubmittedAt,
                })
            .ToListAsync();
    }

    private async Task<List<WorkforceCertificateRow>> LoadCertificatesAsync(Guid employeeId)
    {
        return await _context.Certificates
            .AsNoTracking()
            .Where(certificate => certificate.EmployeeId == employeeId)
            .OrderByDescending(certificate => certificate.IssuedAt)
            .Select(certificate => new WorkforceCertificateRow
            {
                Id = certificate.Id,
                CertificateCode = certificate.CertificateCode,
                CourseTitle = certificate.CourseTitleSnapshot,
                IssueDate = certificate.IssuedAt,
                ExpiryDate = certificate.ExpiresAt,
                Status = certificate.Status,
            })
            .ToListAsync();
    }

    private static WorkforceTaskRow ToTaskRow(MyTask task) => new()
    {
        Id = task.Assignment.Id,
        Title = task.Assignment.TitleSnapshot,
        Description = task.Assignment.DescriptionSnapshot,
        DueDate = task.Assignment.DueAt,
        Status = task.Assignment.Status,
        CompetencyIds = task.Targets.Select(target => target.CompetencyId).ToList(),
    };

    /// <summary>EVALUATED when the reviewer passed it, REJECTED when they asked for a revision or failed it, else the submission status.</summary>
    private static WorkforceSubmissionRow ToSubmissionRow(MyTask task, MyTaskSubmission submission) => new()
    {
        Id = submission.Id,
        TaskTitle = task.Assignment.TitleSnapshot,
        Content = submission.Note ?? submission.Links.FirstOrDefault(),
        Status = submission.Evaluation?.Verdict switch
        {
            Statuses.TaskVerdict.Passed => "EVALUATED",
            Statuses.TaskVerdict.NeedsRevision or Statuses.TaskVerdict.Failed => "REJECTED",
            _ => submission.Status,
        },
        SubmittedAt = submission.SubmittedAt,
        EvaluatorName = submission.Evaluation?.ReviewerName,
    };
}
