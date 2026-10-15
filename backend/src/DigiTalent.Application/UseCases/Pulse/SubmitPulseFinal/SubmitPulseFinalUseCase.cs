using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/final — nộp bài cuối khóa (§9.3, §10.1). Chỉ khi đã qua mọi mô đun và bài đang
/// mở (lần 1, hoặc lần 2 trong cửa sổ sau lần 1 chưa đạt). Lượt học chuyển READY_FOR_ASSESSMENT; quản lý phòng ban
/// của nhân viên nhận thông báo.
/// </summary>
public class SubmitPulseFinalUseCase : IUseCase<SubmitPulseFinalUseCaseInput, SubmitPulseFinalUseCaseOutput>
{
    public const string NotificationType = "PULSE_FINAL_SUBMITTED";

    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;

    public SubmitPulseFinalUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace)
    {
        _context = context;
        _workspace = workspace;
    }

    public async Task<SubmitPulseFinalUseCaseOutput> ExecuteAsync(SubmitPulseFinalUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        PulseCourseWorkspace.EnsureCanWork(state);
        if (state.Enrollment == null || !state.AllModulesPassed)
        {
            throw new BadRequestException("Hãy đạt câu hỏi ôn tập của tất cả mô đun trước khi nộp bài cuối khóa.", "courseId", "MODULES_INCOMPLETE");
        }

        if (!PulseRules.CanSubmitFinal(state.FinalStatus))
        {
            throw new ConflictException(state.FinalStatus switch
            {
                PulseFinalStatus.Pending => "Bài của bạn đang chờ quản lý chấm, chưa thể nộp thêm.",
                PulseFinalStatus.Approved => "Khóa học đã được quản lý duyệt.",
                PulseFinalStatus.RetryWait => "Lần nộp cuối chưa mở. Hãy xem nhận xét và chờ tới thời điểm mở.",
                PulseFinalStatus.DeadlineMissed => "Đã quá hạn nộp lần cuối. Quản lý sẽ sắp xếp hỗ trợ.",
                PulseFinalStatus.Flagged => "Đã dùng hết hai lần nộp. Quản lý sẽ sắp xếp hỗ trợ.",
                _ => "Bài cuối khóa chưa mở để nộp.",
            });
        }

        var now = _workspace.Now;
        var attemptNo = (short)(state.Submissions.Count + 1);
        var submission = new CourseFinalSubmission
        {
            EnrollmentId = state.Enrollment.Id,
            AttemptNo = attemptNo,
            EvidenceText = input.EvidenceText.Trim(),
            SubmittedAt = now,
        };
        _context.CourseFinalSubmissions.Add(submission);

        var enrollment = await _context.Enrollments.FirstAsync(e => e.Id == state.Enrollment.Id);
        enrollment.Status = Statuses.Enrollment.ReadyForAssessment;
        enrollment.StartedAt ??= now;

        var managerUserId = await (
                from department in _context.Departments.AsNoTracking()
                join manager in _context.Employees.AsNoTracking() on department.ManagerEmployeeId equals manager.Id
                where department.Id == snapshot.Employee.DepartmentId && manager.Id != snapshot.Employee.Id
                select manager.UserId)
            .FirstOrDefaultAsync();
        if (managerUserId.HasValue)
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = managerUserId.Value,
                Type = NotificationType,
                Title = "Có bài cuối khóa cần chấm",
                Message = $"{snapshot.Employee.FullName} đã nộp bài cuối khóa \"{state.Course.Title}\" (lần {attemptNo}/{PulseRules.MaxFinalAttempts}).",
                RelatedEntityType = "course_final_submissions",
                RelatedEntityId = submission.Id,
            });
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_course_final_submissions_enrollment_attempt: bấm "Nộp" hai lần cùng lúc
            throw new ConflictException("Bài cuối khóa đang được gửi, vui lòng tải lại trang.");
        }

        return new SubmitPulseFinalUseCaseOutput { SubmissionId = submission.Id, AttemptNo = attemptNo, SubmittedAt = now };
    }
}
