using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Hằng số và quy tắc thuần của trang nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md,
/// docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md).
/// Mức năng lực: 0 = chưa xác nhận / không yêu cầu, 1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.
/// </summary>
public static class PulseRules
{
    public const int MaxLevel = 3;
    public const int MaxFinalAttempts = 2;
    public const int MinEvidenceLength = 30;
    public const int MaxEvidenceLength = 8000;
    public const int MinDecisionReasonLength = 10;

    /// <summary>Số câu rút cho mỗi lần làm câu hỏi ôn tập mô đun; phải đúng tất cả (§9.2).</summary>
    public const int ModuleQuizDrawSize = 2;

    /// <summary>
    /// Ngân hàng ôn tập của mô đun gắn câu hỏi với trang nội dung theo thứ tự: câu thứ 2k-1 và 2k (sort_order) ↔ trang k.
    /// Câu ngoài số trang thì gắn với trang cuối.
    /// </summary>
    public const int ModuleQuizQuestionsPerPage = 2;

    /// <summary>Dung lượng tối đa của một mẩu ghi hình tải lên (trình duyệt gửi mỗi vài giây một mẩu).</summary>
    public const int MaxRecordingChunkBytes = 16 * 1024 * 1024;

    /// <summary>Số đoạn ghi tối đa của một nguồn trong một phiên (mỗi lần ngừng rồi bật lại là một đoạn mới).</summary>
    public const int MaxRecordingSegments = 50;

    public const int MaxEventsPerRequest = 200;
    public const int MaxEventsPerSession = 2000;

    /// <summary>Trang (0-based) của câu hỏi ôn tập có <paramref name="sortOrder"/>; -1 khi mô đun không có trang.</summary>
    public static int QuizPageIndex(int sortOrder, int pageCount) =>
        pageCount == 0 ? -1 : Math.Clamp((sortOrder - 1) / ModuleQuizQuestionsPerPage, 0, pageCount - 1);

    public static readonly string[] LevelNames = { "Chưa xác nhận", "Cơ bản", "Trung cấp", "Nâng cao" };

    public static string LevelName(int level) => LevelNames[Math.Clamp(level, 0, MaxLevel)];

    /// <summary>Ba tiêu chí chấm bài cuối khóa và bài đánh giá trước khi học (§9.3).</summary>
    public static readonly IReadOnlyList<PulseCriterionDto> FinalCriteria = new[]
    {
        new PulseCriterionDto("01", "Nguồn có thể truy vết", "Xác định được nguồn hoặc bối cảnh của công việc."),
        new PulseCriterionDto("02", "Hành động có thể kiểm tra", "Người khác kiểm tra lại được thao tác hoặc phép tính."),
        new PulseCriterionDto("03", "Kết luận có căn cứ", "Kết luận và bước tiếp theo dựa trên minh chứng."),
    };

    /// <summary>
    /// Vùng của một khóa (cấp <paramref name="tier"/>) trên lộ trình: vị trí không yêu cầu lĩnh vực → ngoài lộ trình;
    /// cao hơn trần phòng ban → ngoài trần; cao hơn mục tiêu vị trí nhưng trong trần → tùy chọn; còn lại → lộ trình.
    /// </summary>
    public static string ZoneOf(int tier, int target, int ceiling) =>
        target == 0 ? PulseCourseZone.OutsidePath
        : tier > ceiling ? PulseCourseZone.AboveCeiling
        : tier > target ? PulseCourseZone.Optional
        : PulseCourseZone.Path;

    /// <summary>
    /// Tiến độ học của một khóa (%): mỗi mô đun có hai phần — đọc hết trang và đạt câu ôn tập (mô đun không có câu ôn
    /// tập chỉ có phần đọc). Lượt học COMPLETED tính đủ 100%.
    /// </summary>
    public static int ProgressPercent(IReadOnlyList<PulseModuleInfo> modules, IReadOnlyDictionary<Guid, PulseModuleProgress>? progress)
    {
        var total = modules.Sum(m => m.QuizAssessmentId.HasValue ? 2 : 1);
        if (total == 0 || progress == null)
        {
            return 0;
        }

        var done = modules.Sum(m =>
        {
            if (!progress.TryGetValue(m.ModuleId, out var p))
            {
                return 0;
            }

            return m.QuizAssessmentId.HasValue ? (p.Viewed ? 1 : 0) + (p.QuizPassed ? 1 : 0) : (p.Viewed ? 1 : 0);
        });
        return (int)Math.Round(done * 100m / total, MidpointRounding.AwayFromZero);
    }

    /// <summary>
    /// Trạng thái bài cuối khóa (§10.3) từ lượt học + các lần nộp. retry-ready / deadline-missed được tính theo
    /// <paramref name="now"/> từ cửa sổ đã chụp lúc chấm lần 1, không lưu riêng.
    /// </summary>
    public static string FinalStatusOf(Enrollment? enrollment, IReadOnlyList<CourseFinalSubmission> submissions, bool allModulesPassed, DateTimeOffset now)
    {
        if (enrollment == null)
        {
            return PulseFinalStatus.NotStarted;
        }

        var last = submissions.OrderBy(s => s.AttemptNo).LastOrDefault();
        if (last?.Decision == Statuses.FinalSubmissionDecision.Passed || enrollment.Status == Statuses.Enrollment.Completed)
        {
            return PulseFinalStatus.Approved;
        }

        if (last == null)
        {
            return allModulesPassed ? PulseFinalStatus.Ready : PulseFinalStatus.Learning;
        }

        if (last.Decision == null)
        {
            return PulseFinalStatus.Pending;
        }

        if (last.AttemptNo >= MaxFinalAttempts)
        {
            return PulseFinalStatus.Flagged;
        }

        if (last.RetryOpensAt is { } opensAt && now < opensAt)
        {
            return PulseFinalStatus.RetryWait;
        }

        return last.RetryDueAt is { } dueAt && now > dueAt ? PulseFinalStatus.DeadlineMissed : PulseFinalStatus.RetryReady;
    }

    public static bool CanSubmitFinal(string finalStatus) =>
        finalStatus is PulseFinalStatus.Ready or PulseFinalStatus.RetryReady;

    /// <summary>
    /// Gợi ý AI minh họa cho quản lý (§10.1): chỉ dò từ khóa trong ghi chú, không đọc tệp, không ra quyết định.
    /// </summary>
    public static PulseAiHintDto AiHint(string evidence)
    {
        var text = evidence.ToLowerInvariant();
        var checks = new[]
        {
            ContainsAny(text, "nguồn", "dữ liệu", "báo cáo", "sổ", "hồ sơ", "chứng từ", "source", "data", "record", "report"),
            ContainsAny(text, "kiểm tra", "đối chiếu", "so sánh", "tính", "công thức", "xác minh", "check", "calculate", "compare", "verify"),
            ContainsAny(text, "kết luận", "tiếp theo", "đề xuất", "hành động", "bước", "conclusion", "next", "recommend"),
        };
        var summary = checks.All(c => c)
            ? "Ghi chú có vẻ đã nêu nguồn, hành động kiểm tra được và bước tiếp theo. Hãy đọc bài làm thực tế trước khi quyết định."
            : "Ghi chú có thể cần làm rõ nguồn, hành động kiểm tra được hoặc bước tiếp theo. Hãy đọc bài làm thực tế trước khi quyết định.";
        return new PulseAiHintDto(checks, summary);
    }

    private static bool ContainsAny(string text, params string[] words) => words.Any(text.Contains);
}

/// <summary>Trạng thái bài cuối khóa trả về cho FE (§10.3).</summary>
public static class PulseFinalStatus
{
    public const string NotStarted = "NOT_STARTED";
    public const string Learning = "LEARNING";
    public const string Ready = "READY";
    public const string Pending = "PENDING";
    public const string Approved = "APPROVED";
    public const string RetryWait = "RETRY_WAIT";
    public const string RetryReady = "RETRY_READY";
    public const string DeadlineMissed = "DEADLINE_MISSED";
    public const string Flagged = "FLAGGED";
}

/// <summary>Quyền truy cập nội dung khóa (§8).</summary>
public static class PulseCourseAccess
{
    /// <summary>Khóa Cơ bản: đọc đầy đủ miễn phí.</summary>
    public const string FreeFull = "FREE_FULL";
    /// <summary>Khóa có phí đã có lượt học (suất đã kích hoạt / được giao).</summary>
    public const string SeatActive = "SEAT_ACTIVE";
    /// <summary>Khóa có phí chưa có suất: đề cương + trang mẫu đầu tiên của mô đun 1.</summary>
    public const string Preview = "PREVIEW";
}

/// <summary>Vùng của một khóa trên lộ trình: mục tiêu vị trí giới hạn bởi trần năng lực của phòng ban.</summary>
public static class PulseCourseZone
{
    /// <summary>Trong lộ trình: từ Cơ bản tới min(mục tiêu vị trí, trần phòng ban).</summary>
    public const string Path = "PATH";
    /// <summary>Cao hơn mục tiêu vị trí nhưng trong trần phòng ban: học thêm nếu muốn.</summary>
    public const string Optional = "OPTIONAL";
    /// <summary>Cao hơn trần doanh nghiệp đặt cho phòng ban: chưa mở.</summary>
    public const string AboveCeiling = "ABOVE_CEILING";
    /// <summary>Vị trí không yêu cầu lĩnh vực này.</summary>
    public const string OutsidePath = "OUTSIDE_PATH";
}

/// <summary>Trạng thái bài đánh giá trước khi học của một khóa.</summary>
public static class PulsePreStatus
{
    /// <summary>Phải làm bài đánh giá trước khi học (đã đủ điều kiện).</summary>
    public const string Required = "REQUIRED";
    /// <summary>Chưa mở: khóa cấp trước chưa đạt, khóa ngoài trần / ngoài lộ trình, hoặc chưa có vị trí.</summary>
    public const string Locked = "LOCKED";
    /// <summary>Đã nộp, chờ quản lý chấm.</summary>
    public const string Pending = "PENDING";
    /// <summary>Đạt: khóa được công nhận, không cần học.</summary>
    public const string Passed = "PASSED";
    /// <summary>Chưa đạt: học khóa rồi làm bài cuối khóa.</summary>
    public const string NotYet = "NOT_YET";
    /// <summary>Không cần: khóa đã được duyệt hoặc đã bắt đầu học từ trước khi có bài đánh giá.</summary>
    public const string NotNeeded = "NOT_NEEDED";
}

/// <summary>Khóa được công nhận theo đường nào.</summary>
public static class PulseApprovedVia
{
    public const string PreAssessment = "PRE_ASSESSMENT";
    public const string Final = "FINAL";
    /// <summary>Lượt học đã hoàn thành ở luồng học trước (không có bài cuối khóa Pulse).</summary>
    public const string Legacy = "LEGACY";
}

/// <summary>Lý do chưa được ghi tiến độ / làm bài.</summary>
public static class PulseBlockReason
{
    public const string NoPosition = "NO_POSITION";
    public const string OutsidePath = "OUTSIDE_PATH";
    public const string AboveCeiling = "ABOVE_CEILING";
    public const string PriorLevelRequired = "PRIOR_LEVEL_REQUIRED";
    /// <summary>Phải làm bài đánh giá trước khi học trước khi học khóa.</summary>
    public const string PreAssessmentRequired = "PRE_ASSESSMENT_REQUIRED";
    /// <summary>Bài đánh giá trước khi học đang chờ quản lý chấm.</summary>
    public const string PreAssessmentPending = "PRE_ASSESSMENT_PENDING";
    public const string SeatRequired = "SEAT_REQUIRED";
    public const string PreviousModuleRequired = "PREVIOUS_MODULE_REQUIRED";
    public const string SlidesNotViewed = "SLIDES_NOT_VIEWED";
    /// <summary>Lần làm trước chưa đạt: mở lại trang của câu chưa đúng rồi mới làm lần tiếp theo.</summary>
    public const string ReviewRequired = "REVIEW_REQUIRED";
    /// <summary>Câu trả lời gửi lên thuộc bộ câu hỏi của một lần làm khác (đã làm ở tab khác): tải lại để nhận câu mới.</summary>
    public const string QuizChanged = "QUIZ_CHANGED";
}

/// <summary>Trạng thái một lĩnh vực trên lộ trình (so mức đã xác nhận với đỉnh lộ trình = min(mục tiêu, trần)).</summary>
public static class PulseDomainStatus
{
    public const string Pending = "PENDING";
    public const string Gap = "GAP";
    public const string Met = "MET";
    public const string OutsidePath = "OUTSIDE_PATH";
}

/// <summary>Nguồn của mức đã xác nhận.</summary>
public static class PulseLevelSource
{
    public const string None = "NONE";
    public const string Course = "COURSE";
    public const string PracticalEvidence = "PRACTICAL_EVIDENCE";
}

/// <summary>Trạng thái hiển thị của một khóa (lĩnh vực × cấp) với nhân viên — một giá trị cho mỗi ô của lộ trình.</summary>
public static class PulseSlotStatus
{
    /// <summary>Đã đạt (qua bài đánh giá trước khi học, bài cuối khóa hoặc luồng học trước).</summary>
    public const string Completed = "COMPLETED";
    /// <summary>Cần làm bài đánh giá trước khi học.</summary>
    public const string PreAssessment = "PRE_ASSESSMENT";
    /// <summary>Bài đánh giá trước khi học chờ quản lý chấm.</summary>
    public const string PreReview = "PRE_REVIEW";
    /// <summary>Chưa đạt bài đánh giá trước khi học, sẵn sàng học (chưa bắt đầu).</summary>
    public const string ToLearn = "TO_LEARN";
    /// <summary>Đang học các mô đun.</summary>
    public const string InProgress = "IN_PROGRESS";
    /// <summary>Đã học xong, nộp được bài cuối khóa.</summary>
    public const string FinalReady = "FINAL_READY";
    /// <summary>Bài cuối khóa chờ quản lý chấm.</summary>
    public const string InReview = "IN_REVIEW";
    /// <summary>Bài cuối lần 1 chưa đạt, chờ mở lần nộp cuối.</summary>
    public const string RetryWait = "RETRY_WAIT";
    public const string NeedsSupport = "NEEDS_SUPPORT";
    /// <summary>Cần học nhưng khóa có phí chưa có suất học.</summary>
    public const string SeatNeeded = "SEAT_NEEDED";
    /// <summary>Chưa mở: khóa cấp trước của lĩnh vực chưa đạt.</summary>
    public const string AfterPriorLevel = "AFTER_PRIOR_LEVEL";
    public const string AboveCeiling = "ABOVE_CEILING";
    public const string OutsidePath = "OUTSIDE_PATH";
    public const string NoPosition = "NO_POSITION";
}

public sealed record PulseCriterionDto(string Number, string Title, string Description);

public sealed record PulseAiHintDto(IReadOnlyList<bool> Checks, string Summary);
