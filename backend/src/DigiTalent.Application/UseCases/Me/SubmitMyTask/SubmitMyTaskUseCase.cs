using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-16 — Nộp / nộp lại minh chứng nhiệm vụ (chỉ khi ASSIGNED hoặc NEEDS_REVISION):
/// tạo phiên bản bài nộp mới (bản trước → SUPERSEDED), gắn tệp đính kèm, chuyển nhiệm vụ sang SUBMITTED
/// và báo người đánh giá — trong 1 transaction.
/// </summary>
public class SubmitMyTaskUseCase : IUseCase<SubmitMyTaskUseCaseInput, SubmitMyTaskUseCaseOutput>
{
    public const string NotificationType = "TASK_SUBMITTED";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;

    public SubmitMyTaskUseCase(IApplicationDbContext context, MyEmployeeContext me)
    {
        _context = context;
        _me = me;
    }

    public async Task<SubmitMyTaskUseCaseOutput> ExecuteAsync(SubmitMyTaskUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var userId = _me.UserId;
        var now = DateTimeOffset.UtcNow;
        TaskAssignment? assignment = null;
        TaskSubmission? submission = null;

        try
        {
            await _context.ExecuteInTransactionAsync(async () =>
            {
                assignment = await _context.TaskAssignments
                    .FirstOrDefaultAsync(a => a.Id == input.AssignmentId && a.EmployeeId == employee.Id && a.Status != Statuses.TaskAssignment.Cancelled)
                    ?? throw new NotFoundException("Không tìm thấy nhiệm vụ được giao cho bạn.");
                if (assignment.Status is not (Statuses.TaskAssignment.Assigned or Statuses.TaskAssignment.NeedsRevision))
                {
                    throw new ConflictException(assignment.Status == Statuses.TaskAssignment.Submitted
                        ? "Bài nộp trước đang chờ đánh giá, chưa thể nộp lại."
                        : "Nhiệm vụ đã có kết quả đánh giá, không nhận bài nộp mới.");
                }

                var attachmentIds = input.AttachmentIds.Distinct().ToList();
                var folder = MyTaskAttachmentRules.FolderFor(assignment.Id) + "/";
                var validFiles = await _context.FileObjects
                    .AsNoTracking()
                    .Where(f => attachmentIds.Contains(f.Id) && f.UploadedByUserId == userId && f.ObjectKey.StartsWith(folder))
                    .Select(f => f.Id)
                    .ToListAsync();
                if (validFiles.Count != attachmentIds.Count)
                {
                    throw new BadRequestException("Tệp đính kèm không hợp lệ hoặc không thuộc nhiệm vụ này.");
                }

                if (await _context.TaskSubmissionFiles.AnyAsync(f => attachmentIds.Contains(f.FileObjectId)))
                {
                    throw new ConflictException("Tệp đính kèm đã thuộc một bài nộp khác.");
                }

                var previous = await _context.TaskSubmissions
                    .Where(s => s.TaskAssignmentId == assignment.Id)
                    .OrderByDescending(s => s.VersionNo)
                    .FirstOrDefaultAsync();
                if (previous != null && previous.Status != Statuses.TaskSubmission.Superseded)
                {
                    previous.Status = Statuses.TaskSubmission.Superseded;
                }

                submission = new TaskSubmission
                {
                    TaskAssignmentId = assignment.Id,
                    VersionNo = (previous?.VersionNo ?? 0) + 1,
                    SupersedesSubmissionId = previous?.Id,
                    SubmissionNote = input.Content.Trim(),
                    SubmissionUrl = SubmissionLinks.Join(input.LinkUrls),
                    SubmittedAt = now,
                    Status = Statuses.TaskSubmission.Submitted,
                };
                _context.TaskSubmissions.Add(submission);
                _context.TaskSubmissionFiles.AddRange(attachmentIds.Select((fileId, index) => new TaskSubmissionFile
                {
                    SubmissionId = submission.Id,
                    FileObjectId = fileId,
                    SortOrder = index,
                }));

                assignment.Status = Statuses.TaskAssignment.Submitted;

                _context.Notifications.Add(new Notification
                {
                    RecipientUserId = assignment.ReviewerUserId,
                    Type = NotificationType,
                    Title = "Có bài nộp mới cần đánh giá",
                    Message = $"{employee.FullName} đã nộp minh chứng (lần {submission.VersionNo}) cho nhiệm vụ \"{assignment.TitleSnapshot}\".",
                    RelatedEntityType = "task_submissions",
                    RelatedEntityId = submission.Id,
                });

                await _context.SaveChangesAsync();
            });
        }
        catch (DbUpdateException)
        {
            // uq_task_submissions_assignment_version: 2 lần bấm "Nộp" cùng lúc
            throw new ConflictException("Bài nộp đang được gửi, vui lòng tải lại trang.");
        }

        return new SubmitMyTaskUseCaseOutput
        {
            AssignmentId = assignment!.Id,
            SubmissionId = submission!.Id,
            VersionNo = submission.VersionNo,
            SubmittedAt = submission.SubmittedAt,
            AssignmentStatus = assignment.Status,
        };
    }
}
