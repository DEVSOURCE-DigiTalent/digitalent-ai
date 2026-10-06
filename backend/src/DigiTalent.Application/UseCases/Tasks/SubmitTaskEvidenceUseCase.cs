using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class SubmitTaskEvidenceUseCase : IUseCase<SubmitTaskEvidenceInput, TaskSubmissionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public SubmitTaskEvidenceUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<TaskSubmissionDto> ExecuteAsync(SubmitTaskEvidenceInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới nộp bài.");

        var assignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(a => a.TaskTemplateId == input.TaskId && a.EmployeeId == employeeId)
            ?? throw new NotFoundException("Không tìm thấy nhiệm vụ được giao.");

        if (assignment.Status != "ASSIGNED" && assignment.Status != "NEEDS_REVISION")
            throw new BadRequestException($"Không thể nộp bài khi trạng thái là '{assignment.Status}'.");

        var prevSubmission = await _context.TaskSubmissions
            .Where(s => s.TaskAssignmentId == assignment.Id && s.Status != "SUPERSEDED")
            .OrderByDescending(s => s.VersionNo)
            .FirstOrDefaultAsync();

        if (prevSubmission != null)
            prevSubmission.Status = "SUPERSEDED";

        var newVersionNo = (prevSubmission?.VersionNo ?? 0) + 1;

        var urls = new List<string>();
        if (input.LinkUrls != null) urls.AddRange(input.LinkUrls);
        if (input.FileUrls != null) urls.AddRange(input.FileUrls);

        var submission = new TaskSubmission
        {
            TaskAssignmentId = assignment.Id,
            VersionNo = newVersionNo,
            SupersedesSubmissionId = prevSubmission?.Id,
            SubmissionNote = input.Content,
            SubmissionUrl = urls.Any() ? string.Join(";", urls) : null,
            SubmittedAt = DateTimeOffset.UtcNow,
            Status = "SUBMITTED",
        };
        _context.TaskSubmissions.Add(submission);

        assignment.Status = "SUBMITTED";

        await _context.SaveChangesAsync();

        return new TaskSubmissionDto
        {
            Id = submission.Id,
            TaskId = input.TaskId,
            EmployeeId = employeeId,
            EmployeeName = "",
            SubmittedAt = submission.SubmittedAt,
            Content = submission.SubmissionNote ?? "",
            LinkUrls = input.LinkUrls,
            FileUrls = input.FileUrls,
            Status = "PENDING_REVIEW",
        };
    }
}
