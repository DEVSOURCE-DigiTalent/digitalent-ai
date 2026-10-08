using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

public sealed record MyTaskTarget(Guid CompetencyId, string Code, string Name, short TargetLevel);

public sealed record MyTaskFile(Guid Id, string FileName, string? ContentType, long SizeBytes);

public sealed record MyCompetencyResult(
    Guid CompetencyId,
    string Code,
    string Name,
    short TargetLevel,
    string Verdict,
    decimal? Score,
    bool LevelConfirming,
    short? ConfirmedLevel,
    string? Feedback);

public sealed record MyTaskEvaluation(
    Guid Id,
    string Verdict,
    decimal? Score,
    string? Feedback,
    string? ReviewerName,
    DateTimeOffset EvaluatedAt,
    bool CountsAsEvidence,
    IReadOnlyList<MyCompetencyResult> CompetencyResults);

public sealed record MyTaskSubmission(
    Guid Id,
    int VersionNo,
    string Status,
    DateTimeOffset SubmittedAt,
    string? Note,
    IReadOnlyList<string> Links,
    IReadOnlyList<MyTaskFile> Files,
    MyTaskEvaluation? Evaluation);

public sealed record MyTask(
    TaskAssignment Assignment,
    string? AssignedByName,
    string? ReviewerName,
    string? CourseTitle,
    IReadOnlyList<MyTaskTarget> Targets,
    IReadOnlyList<RubricCriterionDto> Rubric,
    IReadOnlyList<MyTaskSubmission> Submissions)
{
    public MyTaskSubmission? Latest => Submissions.FirstOrDefault();

    public bool CanSubmit => Assignment.Status is Statuses.TaskAssignment.Assigned or Statuses.TaskAssignment.NeedsRevision;

    public bool IsOverdue(DateTimeOffset now) => CanSubmit && Assignment.DueAt.HasValue && Assignment.DueAt.Value < now;
}

/// <summary>
/// Đọc nhiệm vụ thực tế của CHÍNH nhân viên (task_assignments.employee_id = mình) theo lô.
/// Mục tiêu năng lực ưu tiên assigned_task_targets (bản chụp lúc giao), thiếu thì lấy practical_task_targets của mẫu.
/// Không trả bài nộp / đánh giá của người khác.
/// </summary>
public class MyTaskReader
{
    private readonly IApplicationDbContext _context;

    public MyTaskReader(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyTask>> LoadAsync(Guid employeeId, Guid? assignmentId = null)
    {
        var query = _context.TaskAssignments
            .AsNoTracking()
            .Where(a => a.EmployeeId == employeeId && a.Status != Statuses.TaskAssignment.Cancelled);
        if (assignmentId.HasValue)
        {
            query = query.Where(a => a.Id == assignmentId.Value);
        }

        var assignments = await query.OrderByDescending(a => a.AssignedAt).ToListAsync();
        if (assignments.Count == 0)
        {
            return new List<MyTask>();
        }

        var assignmentIds = assignments.Select(a => a.Id).ToList();
        var templateIds = assignments.Where(a => a.TaskTemplateId.HasValue).Select(a => a.TaskTemplateId!.Value).Distinct().ToList();

        var assignedTargets = await (
                from target in _context.AssignedTaskTargets.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on target.CompetencyId equals competency.Id
                where assignmentIds.Contains(target.TaskAssignmentId)
                orderby target.SortOrder
                select new { OwnerId = target.TaskAssignmentId, Target = new MyTaskTarget(competency.Id, competency.Code, competency.Name, target.TargetLevel) })
            .ToListAsync();
        var templateTargets = await (
                from target in _context.PracticalTaskTargets.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on target.CompetencyId equals competency.Id
                where templateIds.Contains(target.TaskTemplateId)
                orderby target.SortOrder
                select new { OwnerId = target.TaskTemplateId, Target = new MyTaskTarget(competency.Id, competency.Code, competency.Name, target.TargetLevel) })
            .ToListAsync();

        var templates = await _context.PracticalTaskTemplates
            .AsNoTracking()
            .Where(t => templateIds.Contains(t.Id))
            .Select(t => new { t.Id, t.GeneralMarkingCriteria, t.RelatedCourseId })
            .ToDictionaryAsync(t => t.Id);

        var courseIds = assignments.Select(a => a.PromptingCourseId)
            .Concat(templates.Values.Select(t => t.RelatedCourseId))
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();
        var courseTitles = await _context.Courses
            .AsNoTracking()
            .Where(c => courseIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Title);

        var submissions = await _context.TaskSubmissions
            .AsNoTracking()
            .Where(s => assignmentIds.Contains(s.TaskAssignmentId))
            .OrderByDescending(s => s.VersionNo)
            .ToListAsync();
        var submissionIds = submissions.Select(s => s.Id).ToList();

        var files = await (
                from link in _context.TaskSubmissionFiles.AsNoTracking()
                join file in _context.FileObjects.AsNoTracking() on link.FileObjectId equals file.Id
                where submissionIds.Contains(link.SubmissionId)
                orderby link.SortOrder
                select new { link.SubmissionId, File = new MyTaskFile(file.Id, file.OriginalName, file.MimeType, file.SizeBytes) })
            .ToListAsync();

        var evaluations = await _context.TaskEvaluations
            .AsNoTracking()
            .Where(e => submissionIds.Contains(e.TaskSubmissionId))
            .ToListAsync();
        var evaluationIds = evaluations.Select(e => e.Id).ToList();
        var competencyResults = await (
                from result in _context.CompetencyEvaluationResults.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on result.CompetencyId equals competency.Id
                where evaluationIds.Contains(result.TaskEvaluationId)
                orderby competency.Code
                select new
                {
                    result.TaskEvaluationId,
                    Result = new MyCompetencyResult(
                        competency.Id, competency.Code, competency.Name, result.TargetLevel, result.Verdict,
                        result.Score, result.LevelConfirming, result.ConfirmedLevel, result.Feedback),
                })
            .ToListAsync();

        var userIds = assignments.SelectMany(a => new[] { a.AssignedByUserId, a.ReviewerUserId })
            .Concat(evaluations.Select(e => e.ReviewerUserId))
            .Distinct()
            .ToList();
        var userNames = await _context.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var evaluationBySubmission = evaluations.ToDictionary(
            e => e.TaskSubmissionId,
            e => new MyTaskEvaluation(
                e.Id,
                e.Verdict,
                e.OverallScore,
                e.Feedback,
                userNames.GetValueOrDefault(e.ReviewerUserId),
                e.EvaluatedAt,
                e.CountsAsEvidence,
                competencyResults.Where(r => r.TaskEvaluationId == e.Id).Select(r => r.Result).ToList()));

        return assignments.Select(assignment =>
        {
            var targets = assignedTargets.Where(t => t.OwnerId == assignment.Id).Select(t => t.Target).ToList();
            if (targets.Count == 0 && assignment.TaskTemplateId.HasValue)
            {
                targets = templateTargets.Where(t => t.OwnerId == assignment.TaskTemplateId.Value).Select(t => t.Target).ToList();
            }

            var template = assignment.TaskTemplateId.HasValue ? templates.GetValueOrDefault(assignment.TaskTemplateId.Value) : null;
            var courseId = assignment.PromptingCourseId ?? template?.RelatedCourseId;

            var mySubmissions = submissions
                .Where(s => s.TaskAssignmentId == assignment.Id)
                .Select(s => new MyTaskSubmission(
                    s.Id,
                    s.VersionNo,
                    s.Status,
                    s.SubmittedAt,
                    s.SubmissionNote,
                    SubmissionLinks.Split(s.SubmissionUrl),
                    files.Where(f => f.SubmissionId == s.Id).Select(f => f.File).ToList(),
                    evaluationBySubmission.GetValueOrDefault(s.Id)))
                .ToList();

            return new MyTask(
                assignment,
                userNames.GetValueOrDefault(assignment.AssignedByUserId),
                userNames.GetValueOrDefault(assignment.ReviewerUserId),
                courseId.HasValue ? courseTitles.GetValueOrDefault(courseId.Value) : null,
                targets,
                TaskRubricParser.Parse(template?.GeneralMarkingCriteria),
                mySubmissions);
        }).ToList();
    }
}
