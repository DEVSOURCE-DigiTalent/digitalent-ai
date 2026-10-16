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
        PulseBlockReason.OutsidePath => "Vị trí của bạn không yêu cầu lĩnh vực này nên khóa học không nằm trong lộ trình.",
        PulseBlockReason.AboveCeiling => "Doanh nghiệp chưa mở cấp độ này của lĩnh vực cho phòng ban của bạn.",
        PulseBlockReason.PriorLevelRequired => "Cần đạt khóa ở cấp trước của cùng lĩnh vực trước.",
        PulseBlockReason.PreAssessmentRequired => "Hãy làm bài đánh giá trước khi học của khóa này trước. Đạt thì khóa được công nhận, chưa đạt thì bạn học khóa.",
        PulseBlockReason.PreAssessmentPending => "Bài đánh giá trước khi học đang chờ quản lý chấm. Khóa mở để học nếu bài chưa đạt.",
        PulseBlockReason.SeatRequired => "Khóa học có phí cần suất học do chủ doanh nghiệp phân bổ trước khi mở toàn bộ nội dung.",
        PulseBlockReason.PreviousModuleRequired => "Hãy đạt câu hỏi ôn tập của mô đun trước.",
        PulseBlockReason.SlidesNotViewed => "Hãy đọc hết các trang nội dung của mô đun trước khi làm câu hỏi ôn tập.",
        PulseBlockReason.ReviewRequired => "Hãy mở lại trang nội dung của câu chưa đúng trước khi làm lần tiếp theo.",
        PulseBlockReason.QuizChanged => "Bộ câu hỏi đã đổi sang lần làm mới. Hãy tải lại trang để làm với câu hỏi mới.",
        _ => "Bạn chưa thể thực hiện thao tác này.",
    };

    /// <summary>Vì sao bài đánh giá trước khi học không mở cho nhân viên lúc này.</summary>
    public static string PreAssessmentClosedMessage(PulseCourseState state) => state.PreStatus switch
    {
        PulsePreStatus.Pending => "Bài đánh giá trước khi học của khóa này đang chờ quản lý chấm.",
        PulsePreStatus.Passed => "Bạn đã đạt bài đánh giá trước khi học của khóa này.",
        PulsePreStatus.NotYet => "Mỗi khóa có một bài đánh giá trước khi học. Bài của bạn chưa đạt — hãy học khóa rồi làm bài cuối khóa.",
        PulsePreStatus.NotNeeded => "Khóa này không cần bài đánh giá trước khi học: khóa đã được công nhận hoặc bạn đã bắt đầu học.",
        _ => state.BlockReason is { } reason && reason is not PulseBlockReason.PreAssessmentRequired and not PulseBlockReason.SeatRequired
            ? BlockMessage(reason)
            : "Bài đánh giá trước khi học của khóa này chưa mở.",
    };

    /// <summary>Vì sao bài cuối khóa không mở để làm lúc này.</summary>
    public static string FinalClosedMessage(PulseCourseState state) => state.FinalStatus switch
    {
        PulseFinalStatus.Pending => "Bài của bạn đang chờ quản lý chấm, chưa thể nộp thêm.",
        PulseFinalStatus.Approved => "Khóa học đã được quản lý duyệt.",
        PulseFinalStatus.RetryWait => "Lần nộp cuối chưa mở. Hãy xem nhận xét và chờ tới thời điểm mở.",
        PulseFinalStatus.DeadlineMissed => "Đã quá hạn nộp lần cuối. Quản lý sẽ sắp xếp hỗ trợ.",
        PulseFinalStatus.Flagged => "Đã dùng hết hai lần nộp. Quản lý sẽ sắp xếp hỗ trợ.",
        _ => "Hãy đạt câu hỏi ôn tập của tất cả mô đun trước khi làm bài cuối khóa.",
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
