using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetSubmissionDetailUseCase : IUseCase<GetSubmissionDetailInput, SubmissionDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetSubmissionDetailUseCase(IApplicationDbContext context) => _context = context;

    public async Task<SubmissionDetailDto> ExecuteAsync(GetSubmissionDetailInput input)
    {
        var sub = await _context.TaskSubmissions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == input.Id)
            ?? throw new NotFoundException($"Submission '{input.Id}' not found.");

        var assignment = await _context.TaskAssignments.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == sub.TaskAssignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        var emp = await _context.Employees.AsNoTracking()
            .Where(e => e.Id == assignment.EmployeeId)
            .Select(e => new { e.Id, e.FullName, e.EmployeeCode, e.DepartmentId })
            .FirstOrDefaultAsync();

        var deptName = emp?.DepartmentId != null
            ? await _context.Departments.AsNoTracking()
                .Where(d => d.Id == emp.DepartmentId).Select(d => d.Name).FirstOrDefaultAsync()
            : null;

        var eval = await _context.TaskEvaluations.AsNoTracking()
            .FirstOrDefaultAsync(ev => ev.TaskSubmissionId == sub.Id);

        EvaluationDto? evalDto = null;
        if (eval != null)
        {
            var reviewerName = await _context.Users.AsNoTracking()
                .Where(u => u.Id == eval.ReviewerUserId).Select(u => u.DisplayName).FirstOrDefaultAsync();
            evalDto = new EvaluationDto
            {
                EvaluatedBy = reviewerName ?? "",
                EvaluatedAt = eval.EvaluatedAt,
                Score = eval.OverallScore ?? 0,
                Feedback = eval.Feedback ?? "",
                Decision = GetTaskByIdUseCase.MapVerdictToDecision(eval.Verdict),
            };
        }

        var targetLevel = assignment.TaskTemplateId.HasValue
            ? await _context.PracticalTaskTargets.AsNoTracking()
                .Where(t => t.TaskTemplateId == assignment.TaskTemplateId.Value)
                .OrderBy(t => t.SortOrder)
                .Select(t => t.TargetLevel)
                .FirstOrDefaultAsync()
            : (short)0;

        var template = assignment.TaskTemplateId.HasValue
            ? await _context.PracticalTaskTemplates.AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == assignment.TaskTemplateId.Value)
            : null;

        return new SubmissionDetailDto
        {
            Id = sub.Id,
            TaskId = assignment.TaskTemplateId ?? Guid.Empty,
            EmployeeId = emp?.Id ?? Guid.Empty,
            EmployeeName = emp?.FullName ?? "",
            EmployeeCode = emp?.EmployeeCode,
            SubmittedAt = sub.SubmittedAt,
            Content = sub.SubmissionNote ?? "",
            LinkUrls = string.IsNullOrEmpty(sub.SubmissionUrl) ? null : new List<string> { sub.SubmissionUrl },
            Status = GetTaskByIdUseCase.MapSubmissionStatus(eval),
            Evaluation = evalDto,
            TaskTitle = assignment.TitleSnapshot,
            TaskDescription = assignment.DescriptionSnapshot,
            TaskExpectedOutput = assignment.ExpectedOutputSnapshot,
            TaskDueDate = assignment.DueAt?.ToString("yyyy-MM-dd"),
            RubricCriteria = template?.GeneralMarkingCriteria,
            TargetLevel = targetLevel,
            DepartmentName = deptName,
        };
    }
}
