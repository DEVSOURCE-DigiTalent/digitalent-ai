using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetTaskByIdUseCase : IUseCase<GetTaskByIdInput, PracticalTaskDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetTaskByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PracticalTaskDetailDto> ExecuteAsync(GetTaskByIdInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var template = await _context.PracticalTaskTemplates.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == input.Id && t.OrganizationId == organizationId)
            ?? throw new NotFoundException($"Task '{input.Id}' not found.");

        var competencyIds = await _context.PracticalTaskTargets.AsNoTracking()
            .Where(tg => tg.TaskTemplateId == template.Id)
            .OrderBy(tg => tg.SortOrder)
            .Select(tg => tg.CompetencyId)
            .ToListAsync();

        var targetLevel = await _context.PracticalTaskTargets.AsNoTracking()
            .Where(tg => tg.TaskTemplateId == template.Id)
            .OrderBy(tg => tg.SortOrder)
            .Select(tg => tg.TargetLevel)
            .FirstOrDefaultAsync();

        var taskAssignments = await _context.TaskAssignments.AsNoTracking()
            .Where(a => a.TaskTemplateId == template.Id)
            .ToListAsync();

        var employeeIds = taskAssignments.Select(a => a.EmployeeId).Distinct().ToList();

        var employeesData = await _context.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id))
            .Select(e => new AssignedEmployeeDto
            {
                Id = e.Id,
                FullName = e.FullName,
                EmployeeCode = e.EmployeeCode,
                WorkEmail = e.WorkEmail,
            })
            .ToListAsync();

        var firstAssignment = taskAssignments.OrderBy(a => a.AssignedAt).FirstOrDefault();
        var firstEmpDeptId = firstAssignment != null
            ? await _context.Employees.AsNoTracking()
                .Where(e => e.Id == firstAssignment.EmployeeId)
                .Select(e => e.DepartmentId)
                .FirstOrDefaultAsync()
            : (Guid?)null;

        string? deptName = null;
        if (firstEmpDeptId.HasValue)
            deptName = await _context.Departments.AsNoTracking()
                .Where(d => d.Id == firstEmpDeptId.Value)
                .Select(d => d.Name).FirstOrDefaultAsync();

        var assignedByName = await _context.Users.AsNoTracking()
            .Where(u => u.Id == template.CreatedByUserId)
            .Select(u => u.DisplayName).FirstOrDefaultAsync();

        var assignmentIds = taskAssignments.Select(a => a.Id).ToList();
        var allSubmissions = await _context.TaskSubmissions.AsNoTracking()
            .Where(s => assignmentIds.Contains(s.TaskAssignmentId) && s.Status != "SUPERSEDED")
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        var submissionIds = allSubmissions.Select(s => s.Id).ToList();
        var allEvaluations = await _context.TaskEvaluations.AsNoTracking()
            .Where(ev => submissionIds.Contains(ev.TaskSubmissionId))
            .ToListAsync();

        var reviewerIds = allEvaluations.Select(ev => ev.ReviewerUserId).Distinct().ToList();
        var reviewerNames = await _context.Users.AsNoTracking()
            .Where(u => reviewerIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var empLookup = employeesData.ToDictionary(e => e.Id);
        var assignmentEmpMap = taskAssignments.ToDictionary(a => a.Id, a => a.EmployeeId);

        var submissionDtos = allSubmissions.Select(s =>
        {
            var empId = assignmentEmpMap.GetValueOrDefault(s.TaskAssignmentId);
            var emp = empId != default ? empLookup.GetValueOrDefault(empId) : null;
            var eval = allEvaluations.FirstOrDefault(ev => ev.TaskSubmissionId == s.Id);

            return new TaskSubmissionDto
            {
                Id = s.Id,
                TaskId = template.Id,
                EmployeeId = empId,
                EmployeeName = emp?.FullName ?? "",
                EmployeeCode = emp?.EmployeeCode,
                SubmittedAt = s.SubmittedAt,
                Content = s.SubmissionNote ?? "",
                LinkUrls = string.IsNullOrEmpty(s.SubmissionUrl) ? null : new List<string> { s.SubmissionUrl },
                Status = MapSubmissionStatus(eval),
                Evaluation = eval == null ? null : new EvaluationDto
                {
                    EvaluatedBy = reviewerNames.GetValueOrDefault(eval.ReviewerUserId, ""),
                    EvaluatedAt = eval.EvaluatedAt,
                    Score = eval.OverallScore ?? 0,
                    Feedback = eval.Feedback ?? "",
                    Decision = MapVerdictToDecision(eval.Verdict),
                },
            };
        }).ToList();

        return new PracticalTaskDetailDto
        {
            Id = template.Id,
            Title = template.Title,
            Description = template.Description,
            ExpectedOutput = template.ExpectedOutput,
            CompetencyIds = competencyIds,
            TargetLevel = targetLevel,
            DepartmentId = firstEmpDeptId,
            DepartmentName = deptName,
            AssignedEmployeeIds = employeeIds,
            AssignedEmployeesCount = employeeIds.Count,
            AssignedByName = assignedByName,
            AssignedAt = firstAssignment?.AssignedAt,
            DueDate = firstAssignment?.DueAt?.ToString("yyyy-MM-dd"),
            RubricCriteria = template.GeneralMarkingCriteria,
            Status = template.Status,
            SubmissionsCount = submissionDtos.Count,
            PendingReviewCount = taskAssignments.Count(a => a.Status == "SUBMITTED"),
            ApprovedCount = taskAssignments.Count(a => a.Status == "PASSED"),
            AssignedEmployees = employeesData,
            Submissions = submissionDtos,
        };
    }

    internal static string MapSubmissionStatus(Domain.Entities.TaskEvaluation? eval)
    {
        if (eval == null) return "PENDING_REVIEW";
        return eval.Verdict switch
        {
            "PASSED" => "APPROVED",
            "NEEDS_REVISION" => "REVISION_REQUESTED",
            "FAILED" => "REJECTED",
            _ => "PENDING_REVIEW",
        };
    }

    internal static string MapVerdictToDecision(string verdict) => verdict switch
    {
        "PASSED" => "APPROVED",
        "NEEDS_REVISION" => "REVISION_REQUESTED",
        "FAILED" => "REJECTED",
        _ => verdict,
    };
}
