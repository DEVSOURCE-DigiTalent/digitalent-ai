using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Truy cập một khóa trong lộ trình của nhân viên: tìm trạng thái khóa (bản trong danh mục hoặc bản nhân viên đang
/// học), mở lượt học cho khóa Cơ bản khi đủ điều kiện (§8: không cần suất), và chặn với thông báo theo lý do.
/// </summary>
public class PulseCourseWorkspace
{
    private readonly IApplicationDbContext _context;
    private readonly PulseLearnerReader _learner;

    public PulseCourseWorkspace(IApplicationDbContext context, PulseLearnerReader learner)
    {
        _context = context;
        _learner = learner;
    }

    public DateTimeOffset Now => _learner.Now;

    public async Task<(PulseLearnerSnapshot Snapshot, PulseCourseState Course)> ResolveAsync(Guid courseId, bool includeContent = false)
    {
        var snapshot = await _learner.LoadAsync(includeContent);
        var state = snapshot.FindCourse(courseId)
                    ?? snapshot.Courses.FirstOrDefault(c => c.Enrollment?.CourseId == courseId)
                    ?? throw new NotFoundException("Không tìm thấy khóa học trong lộ trình của bạn.");
        return (snapshot, state);
    }

    public static PulseModuleInfo FindModule(PulseCourseState state, Guid moduleId) =>
        state.Modules.FirstOrDefault(m => m.ModuleId == moduleId)
        ?? throw new NotFoundException("Không tìm thấy mô đun trong khóa học này.");

    /// <summary>
    /// Lượt học (được theo dõi) để ghi tiến độ. Khóa Cơ bản tự mở lượt học khi nhân viên đủ điều kiện;
    /// khóa có phí chỉ dùng lượt học đã có (suất đã kích hoạt). Lượt NOT_STARTED chuyển sang IN_PROGRESS.
    /// </summary>
    public async Task<Enrollment> EnsureEnrollmentAsync(PulseLearnerSnapshot snapshot, PulseCourseState state)
    {
        EnsureCanWork(state);

        if (state.Enrollment != null)
        {
            var tracked = await _context.Enrollments.FirstAsync(e => e.Id == state.Enrollment.Id);
            if (tracked.Status == Statuses.Enrollment.NotStarted)
            {
                tracked.Status = Statuses.Enrollment.InProgress;
                tracked.StartedAt ??= Now;
            }

            return tracked;
        }

        var enrollment = new Enrollment
        {
            EmployeeId = snapshot.Employee.Id,
            CourseId = state.Course.CourseId,
            Status = Statuses.Enrollment.InProgress,
            ProgressPercent = 0,
            StartedAt = Now,
        };
        _context.Enrollments.Add(enrollment);
        return enrollment;
    }

    public static void EnsureCanWork(PulseCourseState state)
    {
        if (state.BlockReason != null)
        {
            throw new ForbiddenException(BlockMessage(state.BlockReason));
        }
    }

    public static string BlockMessage(string reason) => reason switch
    {
        PulseBlockReason.NoPosition => "Bạn chưa được gán vị trí công việc nên chưa có lộ trình học.",
        PulseBlockReason.NotAssessed => "Hãy hoàn thành bài kiểm tra đầu vào trước khi ghi tiến độ khóa học.",
        PulseBlockReason.OutsidePath => "Khóa học nằm ngoài mục tiêu vị trí của bạn nên không ghi tiến độ lộ trình.",
        PulseBlockReason.SeatRequired => "Khóa học có phí cần suất học do chủ doanh nghiệp phân bổ trước khi mở toàn bộ nội dung.",
        PulseBlockReason.PriorLevelRequired => "Cần được quản lý duyệt khóa ở cấp trước của cùng lĩnh vực.",
        PulseBlockReason.PreviousModuleRequired => "Hãy đạt câu hỏi ôn tập của mô đun trước.",
        PulseBlockReason.SlidesNotViewed => "Hãy đọc hết các trang nội dung của mô đun trước khi làm câu hỏi ôn tập.",
        _ => "Bạn chưa thể thực hiện thao tác này.",
    };

    /// <summary>Tiến độ lượt học = số mô đun đã qua / tổng số mô đun (không đặt COMPLETED — chỉ quản lý duyệt mới hoàn thành).</summary>
    public static void UpdateProgressPercent(Enrollment enrollment, int modulesPassed, int moduleCount)
    {
        if (enrollment.Status == Statuses.Enrollment.Completed || moduleCount == 0)
        {
            return;
        }

        enrollment.ProgressPercent = Math.Min(100m, Math.Round(modulesPassed * 100m / moduleCount, 2, MidpointRounding.AwayFromZero));
    }
}
