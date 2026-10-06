using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetMyEvidenceUseCase : IUseCase<GetMyEvidenceInput, GetMyEvidenceOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyEvidenceUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetMyEvidenceOutput> ExecuteAsync(GetMyEvidenceInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới xem minh chứng.");

        var myAssignments = await _context.TaskAssignments.AsNoTracking()
            .Where(a => a.EmployeeId == employeeId)
            .ToListAsync();

        var assignmentIds = myAssignments.Select(a => a.Id).ToList();

        var submissions = await _context.TaskSubmissions.AsNoTracking()
            .Where(s => assignmentIds.Contains(s.TaskAssignmentId) && s.Status != "SUPERSEDED")
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var submissionIds = submissions.Select(s => s.Id).ToList();
        var evaluations = await _context.TaskEvaluations.AsNoTracking()
            .Where(ev => submissionIds.Contains(ev.TaskSubmissionId))
            .ToDictionaryAsync(ev => ev.TaskSubmissionId);

        var reviewerIds = evaluations.Values.Select(ev => ev.ReviewerUserId).Distinct().ToList();
        var reviewerNames = await _context.Users.AsNoTracking()
            .Where(u => reviewerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var templateIds = myAssignments.Where(a => a.TaskTemplateId.HasValue)
            .Select(a => a.TaskTemplateId!.Value).Distinct().ToList();

        var targets = await _context.PracticalTaskTargets.AsNoTracking()
            .Where(t => templateIds.Contains(t.TaskTemplateId))
            .ToListAsync();

        var assignmentLookup = myAssignments.ToDictionary(a => a.Id);

        var items = submissions.Select(s =>
        {
            var assignment = assignmentLookup.GetValueOrDefault(s.TaskAssignmentId);
            var templateId = assignment?.TaskTemplateId ?? Guid.Empty;

            var competencyIds = targets
                .Where(t => t.TaskTemplateId == templateId)
                .OrderBy(t => t.SortOrder)
                .Select(t => t.CompetencyId).ToList();

            var targetLevel = targets
                .Where(t => t.TaskTemplateId == templateId)
                .OrderBy(t => t.SortOrder)
                .Select(t => t.TargetLevel)
                .FirstOrDefault();

            evaluations.TryGetValue(s.Id, out var eval);

            var urls = (s.SubmissionUrl ?? "").Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();

            return new EvidenceItemDto
            {
                Id = s.Id,
                TaskId = templateId,
                TaskTitle = assignment?.TitleSnapshot ?? "",
                TaskDescription = assignment?.DescriptionSnapshot,
                TargetLevel = targetLevel,
                CompetencyIds = competencyIds,
                SubmittedAt = s.SubmittedAt,
                Content = s.SubmissionNote ?? "",
                LinkUrls = urls,
                FileUrls = new List<string>(),
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
        }).ToList();

        return new GetMyEvidenceOutput
        {
            Items = items,
            Total = items.Count,
        };
    }
}
