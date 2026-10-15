using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Hằng số và quy tắc thuần của trang nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md).
/// Mức năng lực: 0 = chưa xác nhận / không yêu cầu, 1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.
/// </summary>
public static class PulseRules
{
    public const int MaxLevel = 3;
    public const int MaxFinalAttempts = 2;
    public const int MinEvidenceLength = 30;
    public const int MaxEvidenceLength = 8000;
    public const int MinDecisionReasonLength = 10;

    /// <summary>Ngân hàng câu hỏi của bài đầu vào (mỗi tổ chức một ngân hàng, câu hỏi gắn năng lực + độ khó L1..L3).</summary>
    public const string BaselineBankTitle = "Pulse · Bài kiểm tra đầu vào";

    public static readonly string[] LevelNames = { "Chưa xác nhận", "Cơ bản", "Trung cấp", "Nâng cao" };

    public static string LevelName(int level) => LevelNames[Math.Clamp(level, 0, MaxLevel)];

    public static string DifficultyOf(int level) => $"L{level}";

    public static int? LevelOfDifficulty(string? difficulty) =>
        difficulty is { Length: 2 } && difficulty[0] == 'L' && difficulty[1] is >= '1' and <= '3' ? difficulty[1] - '0' : null;

    /// <summary>Ba tiêu chí chấm bài cuối khóa (§9.3).</summary>
    public static readonly IReadOnlyList<PulseCriterionDto> FinalCriteria = new[]
    {
        new PulseCriterionDto("01", "Nguồn có thể truy vết", "Xác định được nguồn hoặc bối cảnh của công việc."),
        new PulseCriterionDto("02", "Hành động có thể kiểm tra", "Người khác kiểm tra lại được thao tác hoặc phép tính."),
        new PulseCriterionDto("03", "Kết luận có căn cứ", "Kết luận và bước tiếp theo dựa trên minh chứng."),
    };

    /// <summary>
    /// Mức đầu vào của một lĩnh vực: mức k chỉ được ghi nhận khi trả lời đúng liên tiếp từ L1 tới Lk (§7.1).
    /// <paramref name="correctByLevel"/>[i] = câu ở mức i+1 trả lời đúng; thiếu câu ở một mức thì dừng tại đó.
    /// </summary>
    public static int ChainLevel(IReadOnlyList<bool> correctByLevel, int target)
    {
        var level = 0;
        for (var i = 0; i < Math.Min(target, correctByLevel.Count); i++)
        {
            if (!correctByLevel[i])
            {
                break;
            }

            level = i + 1;
        }

        return level;
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

/// <summary>Lý do chưa được ghi tiến độ / làm bài.</summary>
public static class PulseBlockReason
{
    public const string NoPosition = "NO_POSITION";
    public const string NotAssessed = "NOT_ASSESSED";
    public const string OutsidePath = "OUTSIDE_PATH";
    public const string SeatRequired = "SEAT_REQUIRED";
    public const string PriorLevelRequired = "PRIOR_LEVEL_REQUIRED";
    public const string PreviousModuleRequired = "PREVIOUS_MODULE_REQUIRED";
    public const string SlidesNotViewed = "SLIDES_NOT_VIEWED";
}

/// <summary>Trạng thái một lĩnh vực trên lộ trình.</summary>
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
    public const string Baseline = "BASELINE";
    public const string Course = "COURSE";
    public const string PracticalEvidence = "PRACTICAL_EVIDENCE";
}

/// <summary>Trạng thái một ô (lĩnh vực × cấp) trên lộ trình (§8, thang khóa của pulse-reuse.js).</summary>
public static class PulseSlotStatus
{
    public const string Completed = "COMPLETED";
    public const string InReview = "IN_REVIEW";
    public const string InProgress = "IN_PROGRESS";
    /// <summary>Khóa có phí đã có suất (lượt học) nhưng chưa đủ điều kiện mở: chờ bài đầu vào hoặc khóa cấp trước được duyệt.</summary>
    public const string SeatHeld = "SEAT_HELD";
    public const string NeedsSupport = "NEEDS_SUPPORT";
    public const string AfterBaseline = "AFTER_BASELINE";
    public const string FreeToStart = "FREE_TO_START";
    public const string SeatNeeded = "SEAT_NEEDED";
    public const string AfterPriorLevel = "AFTER_PRIOR_LEVEL";
}

public sealed record PulseCriterionDto(string Number, string Title, string Description);

public sealed record PulseAiHintDto(IReadOnlyList<bool> Checks, string Summary);
