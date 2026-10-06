using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetMyTasksUseCase : IUseCase<GetMyTasksInput, GetMyTasksOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyTasksUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetMyTasksOutput> ExecuteAsync(GetMyTasksInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới xem nhiệm vụ của mình.");

        var assignments = await _context.TaskAssignments.AsNoTracking()
            .Where(a => a.EmployeeId == employeeId && a.Status != "CANCELLED")
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        var templateIds = assignments.Where(a => a.TaskTemplateId.HasValue)
            .Select(a => a.TaskTemplateId!.Value).Distinct().ToList();

        var targets = await _context.PracticalTaskTargets.AsNoTracking()
            .Where(t => templateIds.Contains(t.TaskTemplateId))
            .ToListAsync();

        var templates = await _context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => templateIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id);

        var assignmentIds = assignments.Select(a => a.Id).ToList();
        var latestSubmissions = await _context.TaskSubmissions.AsNoTracking()
            .Where(s => assignmentIds.Contains(s.TaskAssignmentId) && s.Status != "SUPERSEDED")
            .OrderByDescending(s => s.VersionNo)
            .ToListAsync();

        var submissionIds = latestSubmissions.Select(s => s.Id).ToList();
        var evaluations = await _context.TaskEvaluations.AsNoTracking()
            .Where(ev => submissionIds.Contains(ev.TaskSubmissionId))
            .ToDictionaryAsync(ev => ev.TaskSubmissionId);

        var reviewerIds = evaluations.Values.Select(ev => ev.ReviewerUserId).Distinct().ToList();
        var reviewerNames = await _context.Users.AsNoTracking()
            .Where(u => reviewerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var assignerIds = assignments.Select(a => a.AssignedByUserId).Distinct().ToList();
        var assignerNames = await _context.Users.AsNoTracking()
            .Where(u => assignerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var items = assignments.Select(a =>
        {
            var competencyIds = a.TaskTemplateId.HasValue
                ? targets.Where(t => t.TaskTemplateId == a.TaskTemplateId.Value)
                    .OrderBy(t => t.SortOrder).Select(t => t.CompetencyId).ToList()
                : new List<Guid>();

            var targetLevel = a.TaskTemplateId.HasValue
                ? targets.Where(t => t.TaskTemplateId == a.TaskTemplateId.Value)
                    .OrderBy(t => t.SortOrder).Select(t => t.TargetLevel).FirstOrDefault()
                : (short)0;

            var template = a.TaskTemplateId.HasValue
                ? templates.GetValueOrDefault(a.TaskTemplateId.Value)
                : null;

            var latestSub = latestSubmissions.FirstOrDefault(s => s.TaskAssignmentId == a.Id);
            TaskSubmissionDto? subDto = null;
            if (latestSub != null)
            {
                evaluations.TryGetValue(latestSub.Id, out var eval);
                subDto = new TaskSubmissionDto
                {
                    Id = latestSub.Id,
                    TaskId = a.TaskTemplateId ?? Guid.Empty,
                    EmployeeId = employeeId,
                    EmployeeName = "",
                    SubmittedAt = latestSub.SubmittedAt,
                    Content = latestSub.SubmissionNote ?? "",
                    LinkUrls = string.IsNullOrEmpty(latestSub.SubmissionUrl) ? null : new List<string> { latestSub.SubmissionUrl },
                    Status = GetTaskByIdUseCase.MapSubmissionStatus(eval),
                    Evaluation = eval == null ? null : new EvaluationDto
                    {
                        EvaluatedBy = reviewerNames.GetValueOrDefault(eval.ReviewerUserId, ""),
                        EvaluatedAt = eval.EvaluatedAt,
                        Score = eval.OverallScore ?? 0,
                        Feedback = eval.Feedback ?? "",
                        Decision = GetTaskByIdUseCase.MapVerdictToDecision(eval.Verdict),
                    },
                };
            }

            return new LearnerTaskDto
            {
                Id = a.TaskTemplateId ?? a.Id,
                Title = a.TitleSnapshot,
                Description = a.DescriptionSnapshot,
                ExpectedOutput = a.ExpectedOutputSnapshot,
                CompetencyIds = competencyIds,
                TargetLevel = targetLevel,
                AssignedByName = assignerNames.GetValueOrDefault(a.AssignedByUserId, ""),
                DueDate = a.DueAt?.ToString("yyyy-MM-dd"),
                RubricCriteria = template?.GeneralMarkingCriteria,
                Submission = subDto,
            };
        }).ToList();

        return new GetMyTasksOutput
        {
            Items = items,
            Total = items.Count,
        };
    }
}
