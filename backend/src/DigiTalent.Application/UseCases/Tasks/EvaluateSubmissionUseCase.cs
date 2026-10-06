using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class EvaluateSubmissionUseCase : IUseCase<EvaluateSubmissionInput, TaskSubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public EvaluateSubmissionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<TaskSubmissionDto> ExecuteAsync(EvaluateSubmissionInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");

        var sub = await _context.TaskSubmissions
            .FirstOrDefaultAsync(s => s.Id == input.SubmissionId)
            ?? throw new NotFoundException($"Submission '{input.SubmissionId}' not found.");

        var existingEval = await _context.TaskEvaluations.AsNoTracking()
            .AnyAsync(ev => ev.TaskSubmissionId == sub.Id);
        if (existingEval)
            throw new BadRequestException("Bài nộp này đã được đánh giá.");

        var verdict = input.Decision.ToUpper() switch
        {
            "APPROVED" => "PASSED",
            "REVISION_REQUESTED" => "NEEDS_REVISION",
            "REJECTED" => "FAILED",
            _ => throw new BadRequestException($"Decision '{input.Decision}' không hợp lệ."),
        };

        var evaluation = new TaskEvaluation
        {
            TaskSubmissionId = sub.Id,
            ReviewerUserId = userId,
            OverallScore = input.Score,
            Verdict = verdict,
            CountsAsEvidence = verdict == "PASSED",
            Feedback = input.Feedback,
            EvaluatedAt = DateTimeOffset.UtcNow,
            RowVersion = 1,
        };
        _context.TaskEvaluations.Add(evaluation);

        sub.Status = "UNDER_REVIEW";

        var assignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(a => a.Id == sub.TaskAssignmentId);
        if (assignment != null)
        {
            assignment.Status = verdict switch
            {
                "PASSED" => "PASSED",
                "NEEDS_REVISION" => "NEEDS_REVISION",
                "FAILED" => "FAILED",
                _ => assignment.Status,
            };
        }

        await _context.SaveChangesAsync();

        var emp = await _context.Employees.AsNoTracking()
            .Where(e => e.Id == (assignment != null ? assignment.EmployeeId : Guid.Empty))
            .Select(e => new { e.Id, e.FullName, e.EmployeeCode })
            .FirstOrDefaultAsync();

        var reviewerName = await _context.Users.AsNoTracking()
            .Where(u => u.Id == userId).Select(u => u.DisplayName).FirstOrDefaultAsync();

        return new TaskSubmissionDto
        {
            Id = sub.Id,
            TaskId = assignment?.TaskTemplateId ?? Guid.Empty,
            EmployeeId = emp?.Id ?? Guid.Empty,
            EmployeeName = emp?.FullName ?? "",
            EmployeeCode = emp?.EmployeeCode,
            SubmittedAt = sub.SubmittedAt,
            Content = sub.SubmissionNote ?? "",
            LinkUrls = string.IsNullOrEmpty(sub.SubmissionUrl) ? null : new List<string> { sub.SubmissionUrl },
            Status = GetTaskByIdUseCase.MapSubmissionStatus(evaluation),
            Evaluation = new EvaluationDto
            {
                EvaluatedBy = reviewerName ?? "",
                EvaluatedAt = evaluation.EvaluatedAt,
                Score = evaluation.OverallScore ?? 0,
                Feedback = evaluation.Feedback ?? "",
                Decision = GetTaskByIdUseCase.MapVerdictToDecision(evaluation.Verdict),
            },
        };
    }
}
