using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Truy cập một khóa trong lộ trình của nhân viên: tìm trạng thái khóa (bản trong danh mục hoặc bản nhân viên đang
/// học), mở lượt học cho khóa Cơ bản khi đủ điều kiện (§8: miễn phí), và chặn với thông báo theo lý do.
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
                    ?? snapshot.Courses.FirstOrDefault(c => c.Enrollment?.CourseId == courseId);
        if (state == null)
        {
            var code = await _context.Courses.AsNoTracking()
                .Where(c => c.Id == courseId && c.OrganizationId == snapshot.Employee.OrganizationId)
                .Select(c => c.Code).FirstOrDefaultAsync();
            state = code == null ? null : snapshot.Courses.FirstOrDefault(c => c.Course.Code == code);
        }
        if (state == null) throw new NotFoundException("Không tìm thấy khóa học trong lộ trình của bạn.");
        return (snapshot, state);
    }

    public static PulseModuleInfo FindModule(PulseCourseState state, Guid moduleId) =>
        state.Modules.FirstOrDefault(m => m.ModuleId == moduleId)
        ?? throw new NotFoundException("Không tìm thấy mô đun trong khóa học này.");

    /// <summary>
    /// Mô đun học tuần tự: mô đun đầu luôn mở; mô đun sau chỉ mở khi mô đun ngay trước đã qua (đọc hết trang, đạt câu
    /// ôn tập nếu có). Mô đun đã qua vẫn mở để xem lại; đạt bài kiểm tra đầu vào tính mọi mô đun là đã qua.
    /// </summary>
    public static bool IsModuleUnlocked(PulseCourseState state, PulseModuleInfo module)
    {
        if (module.Index == 0 || ModulePassed(state, module))
        {
            return true;
        }

        return ModulePassed(state, state.Modules[module.Index - 1]);
    }

    /// <summary>Chặn trang học, ghi tiến độ và câu ôn tập của mô đun chưa mở (mô đun trước chưa qua) → 403.</summary>
    public static void EnsureModuleUnlocked(PulseCourseState state, PulseModuleInfo module)
    {
        if (!IsModuleUnlocked(state, module))
        {
            throw new ForbiddenException(
                $"Mô-đun {module.Index + 1:00} chỉ mở khi bạn hoàn thành Mô-đun {module.Index:00}: đọc hết các trang và đạt câu hỏi ôn tập.");
        }
    }

    private static bool ModulePassed(PulseCourseState state, PulseModuleInfo module) =>
        state.Progress?.GetValueOrDefault(module.ModuleId) is { } progress && progress.Passed(module);

    /// <summary>
    /// Lượt học (được theo dõi) để ghi tiến độ. Khóa Cơ bản tự mở lượt học khi nhân viên đủ điều kiện;
    /// khóa có phí cần doanh nghiệp đã mua khóa. Lượt NOT_STARTED chuyển sang IN_PROGRESS.
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
        PulseBlockReason.PreAssessmentRequired => "Hãy làm bài kiểm tra đầu vào (trắc nghiệm, tự chấm) của khóa này trước. Đạt 80% thì bỏ qua phần học và mở bài đánh giá cuối khóa; chưa đạt thì học tuần tự từng mô-đun.",
        PulseBlockReason.PreAssessmentPending => "Bài đánh giá trước khi học đang chờ chấm. Khóa mở để học nếu bài chưa đạt.",
        PulseBlockReason.PurchaseRequired => "Khóa học có phí: doanh nghiệp cần mua khóa học để mở toàn bộ nội dung cho nhân viên.",
        PulseBlockReason.PreviousModuleRequired => "Hãy hoàn thành mô-đun trước (đọc hết các trang và đạt câu hỏi ôn tập) rồi mới học mô-đun này.",
        PulseBlockReason.SlidesNotViewed => "Hãy đọc hết các trang nội dung của mô đun trước khi làm câu hỏi ôn tập.",
        PulseBlockReason.ReviewRequired => "Hãy mở lại trang nội dung của câu chưa đúng trước khi làm lần tiếp theo.",
        PulseBlockReason.QuizChanged => "Bộ câu hỏi đã đổi sang lần làm mới. Hãy tải lại trang để làm với câu hỏi mới.",
        _ => "Bạn chưa thể thực hiện thao tác này.",
    };

    /// <summary>Vì sao bài đánh giá trước khi học không mở cho nhân viên lúc này.</summary>
    public static string PreAssessmentClosedMessage(PulseCourseState state) => state.PreStatus switch
    {
        PulsePreStatus.Pending => "Bài đánh giá trước khi học của khóa này đang chờ chấm.",
        PulsePreStatus.Passed => "Bạn đã đạt bài đánh giá trước khi học của khóa này.",
        PulsePreStatus.NotYet => "Mỗi khóa có một bài đánh giá trước khi học. Bài của bạn chưa đạt — hãy học khóa rồi làm bài cuối khóa.",
        PulsePreStatus.NotNeeded => "Khóa này không cần bài đánh giá trước khi học: khóa đã được công nhận hoặc bạn đã bắt đầu học.",
        PulsePreStatus.Required => "Bài đánh giá đầu vào có tự luận đã được thay bằng bài kiểm tra đầu vào trắc nghiệm (tự chấm, không cần người chấm). Hãy làm bài kiểm tra đầu vào của khóa.",
        _ => state.BlockReason is { } reason && reason is not PulseBlockReason.PreAssessmentRequired and not PulseBlockReason.PurchaseRequired
            ? BlockMessage(reason)
            : "Bài đánh giá trước khi học của khóa này chưa mở.",
    };

    /// <summary>Vì sao bài cuối khóa không mở để làm lúc này.</summary>
    public static string FinalClosedMessage(PulseCourseState state) => state.FinalStatus switch
    {
        PulseFinalStatus.Pending => "Bài của bạn đang chờ chấm, chưa thể nộp thêm.",
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
