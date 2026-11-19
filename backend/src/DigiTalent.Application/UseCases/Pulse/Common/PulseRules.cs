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

    /// <summary>
    /// Số câu của mỗi lần làm bài ôn tập mô đun, rút từ câu ôn của mô đun (không gồm câu cuối khóa của giáo trình, dành cho
    /// bài cuối khóa); đạt khi đúng từ <see cref="ModuleQuizPassPercent"/>%.
    /// </summary>
    public const int ModuleQuizDrawSize = 10;

    /// <summary>Tỉ lệ câu đúng tối thiểu (%) để đạt bài ôn tập mô đun: 10 câu → 8 câu.</summary>
    public const int ModuleQuizPassPercent = 80;

    /// <summary>Số câu đúng tối thiểu của bài ôn tập <paramref name="total"/> câu.</summary>
    public static int ModuleQuizPassMark(int total) => (total * ModuleQuizPassPercent + 99) / 100;

    /// <summary>Bài ôn tập mô đun đạt ngưỡng.</summary>
    public static bool ModuleQuizPassed(int score, int total) => total > 0 && score >= ModuleQuizPassMark(total);

    /// <summary>
    /// Ngân hàng ôn tập của mô đun gắn câu hỏi với trang nội dung theo thứ tự: câu thứ 2k-1 và 2k (sort_order) ↔ trang k.
    /// Câu ngoài số trang thì gắn với trang cuối.
    /// </summary>
    public const int ModuleQuizQuestionsPerPage = 2;

    /// <summary>
    /// Số câu trắc nghiệm của bài làm có giám sát (bài cuối khóa): câu cuối khóa của giáo trình (questions.is_final_quiz)
    /// trước, khóa chưa đủ thì bù bằng câu ôn của các mô đun.
    /// </summary>
    public const int ExamChoiceCount = 20;

    /// <summary>Tỉ lệ câu đúng tối thiểu (phần mười) để phần trắc nghiệm đạt: 20 câu → 14 câu.</summary>
    public const int ExamChoicePassTenths = 7;

    /// <summary>Số câu đúng tối thiểu của đề <paramref name="total"/> câu.</summary>
    public static int ChoicePassMark(int total) => (total * ExamChoicePassTenths + 9) / 10;

    /// <summary>Phần trắc nghiệm đạt ngưỡng; bài nộp trước khi có trắc nghiệm (null) không bị chặn.</summary>
    public static bool ChoicePassed(int? score, int? total) =>
        score is not { } s || total is not { } t || s >= ChoicePassMark(t);

    /// <summary>
    /// Bài kiểm tra vượt học (<see cref="PulseSkipTest"/>): mã ổn định của bài (assessments PRACTICE, không gắn mô đun) mà
    /// mỗi khóa tạo khi nhân viên đầu tiên bắt đầu làm.
    /// </summary>
    public const string SkipTestCode = "PULSE-SKIP-TEST";

    /// <summary>Số câu trắc nghiệm của bài kiểm tra vượt học, rút từ ngân hàng ôn tập các mô đun của khóa.</summary>
    public const int SkipTestQuestionCount = 20;

    /// <summary>Ngân hàng của khóa phải có ít nhất chừng này câu (khác nội dung) thì mới mở bài kiểm tra vượt học.</summary>
    public const int SkipTestMinQuestions = 10;

    /// <summary>Tỉ lệ câu đúng tối thiểu (%) để vượt quá trình học: 20 câu → 16 câu.</summary>
    public const int SkipTestPassPercent = 80;

    /// <summary>Bài kiểm tra vượt học chỉ được làm một lần cho mỗi lượt học; chưa đạt (hoặc bỏ dở quá giờ) thì học tuần tự.</summary>
    public const int SkipTestMaxAttempts = 1;

    public const int SkipTestTimeLimitMinutes = 30;

    /// <summary>Độ trễ mạng được chấp nhận khi nộp sau giờ (trình duyệt tự nộp lúc hết giờ).</summary>
    public const int SkipTestGraceSeconds = 120;

    /// <summary>Số câu đúng tối thiểu của đề <paramref name="total"/> câu (làm tròn lên).</summary>
    public static int SkipTestPassMark(int total) => (total * SkipTestPassPercent + 99) / 100;

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
    /// Vùng của một khóa (cấp <paramref name="tier"/>) trên lộ trình: tới mức tối thiểu doanh nghiệp yêu cầu
    /// (<paramref name="required"/>) → lộ trình bắt buộc (khóa chưa mua vẫn ở đây, chờ doanh nghiệp mua); cao hơn mức yêu cầu
    /// mà doanh nghiệp đã có khóa (<paramref name="available"/>: Cơ bản miễn phí, khóa đã mua hoặc đã được giao) → học vượt,
    /// được khuyến khích; cao hơn mức yêu cầu và doanh nghiệp chưa mua → chưa mở.
    /// </summary>
    public static string ZoneOf(int tier, int required, bool available) =>
        tier <= required ? PulseCourseZone.Path
        : available ? PulseCourseZone.Optional
        : PulseCourseZone.AboveCeiling;

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
    /// Chặn cảnh báo ngay nếu nhân viên lặp lại nguyên văn đề bài hoặc chỉ dùng câu chữ chung chung.
    /// </summary>
    public static PulseAiHintDto AiHint(string evidence) =>
        AiHint(evidence, null, null, null, null);

    public static PulseAiHintDto AiHint(
        string evidence,
        string? promptHtml,
        IReadOnlyList<PulseCriterionDto>? rubric = null,
        int? domainNumber = null,
        int? tier = null)
    {
        var criteriaCount = rubric is { Count: > 0 } ? rubric.Count : FinalCriteria.Count;
        var copyCheck = PulseEssayRubric.AnalyzePromptCopy(evidence, promptHtml);
        if (copyCheck.IsPromptCopy)
        {
            var warningSummary =
                "Cảnh báo: Bài nộp đang lặp lại câu chữ của đề bài hoặc nói chung chung, chưa nêu tình huống công việc thực tế và dẫn chứng kiểm chứng. Cần yêu cầu bổ sung trước khi công nhận.";
            var copyNotes = Enumerable.Range(0, criteriaCount)
                .Select(_ => "Nội dung trùng với câu hỏi đề bài, chưa có tình huống thực tế hoặc số liệu kiểm chứng.")
                .ToList();
            return new PulseAiHintDto(Enumerable.Repeat(false, criteriaCount).ToList(), warningSummary)
            {
                CriterionNotes = copyNotes,
                Source = "KEYWORD_FALLBACK",
            };
        }

        var folded = PulseEssayRubric.NormalizeFold(evidence);
        var lower = evidence.ToLowerInvariant();
        var checkSource = ContainsAny(lower, "nguồn", "dữ liệu", "báo cáo", "sổ", "hồ sơ", "chứng từ", "source", "data", "record", "report")
            || ContainsAny(folded, "crm", "erp", "excel", "he thong", "tep", "khach hang", "hoa don");
        var checkAction = ContainsAny(lower, "kiểm tra", "đối chiếu", "so sánh", "tính", "công thức", "xác minh", "check", "calculate", "compare", "verify")
            || ContainsAny(folded, "loc trung", "pivot", "thao tac", "kiem chung", "xu ly", "ra soat");
        var checkConclusion = ContainsAny(lower, "kết luận", "tiếp theo", "đề xuất", "hành động", "bước", "conclusion", "next", "recommend")
            || ContainsAny(folded, "ban giao", "phong ngua", "cai thien", "gui lai", "cap nhat", "ket qua", "de tranh", "chuan hoa");

        var resolvedDomain = domainNumber.HasValue ? Math.Clamp(domainNumber.Value, 1, 6) : 1;
        var gateKeywords = PulseEssayRubric.GateKeywordsForDomain(resolvedDomain);
        var checkGate = ContainsAny(folded, gateKeywords) || ContainsAny(lower, "đối chiếu", "bảo mật", "bản quyền", "xác thực", "kiểm chứng", "báo cáo gốc");

        var checks = new List<bool>(criteriaCount);
        var notes = new List<string>(criteriaCount);
        for (var i = 0; i < criteriaCount; i++)
        {
            var criterionTitle = rubric != null && i < rubric.Count ? rubric[i].Title : FinalCriteria[Math.Min(i, FinalCriteria.Count - 1)].Title;
            var met = i switch
            {
                0 => checkSource,
                1 => checkAction,
                2 => checkConclusion,
                3 => checkGate,
                _ => checkSource && checkAction,
            };
            checks.Add(met);
            notes.Add(met
                ? $"Có từ khóa liên quan tới \"{criterionTitle}\"."
                : $"Chưa thấy dẫn chứng rõ cho \"{criterionTitle}\".");
        }

        var summary = checks.All(c => c)
            ? "Ghi chú có vẻ đã nêu đủ các tiêu chí thực hành. Hãy đọc bài làm thực tế trước khi quyết định."
            : "Ghi chú có thể cần làm rõ nguồn, hành động kiểm tra được hoặc bước tiếp theo. Hãy đọc bài làm thực tế trước khi quyết định.";
        return new PulseAiHintDto(checks, summary)
        {
            CriterionNotes = notes,
            Source = "KEYWORD_FALLBACK",
        };
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
    /// <summary>Khóa có phí doanh nghiệp đã mua (hoặc được cấp): mọi nhân viên học đầy đủ.</summary>
    public const string Purchased = "PURCHASED";
    /// <summary>Khóa có phí doanh nghiệp chưa mua: đề cương + trang mẫu đầu tiên của mô đun 1.</summary>
    public const string Preview = "PREVIEW";
}

/// <summary>
/// Vùng của một khóa trên lộ trình: mọi khóa doanh nghiệp đã có đều mở cho nhân viên; mức phòng ban (chưa đặt thì chuẩn vị trí)
/// là mức tối thiểu bắt buộc, phần cao hơn là học vượt.
/// </summary>
public static class PulseCourseZone
{
    /// <summary>Bắt buộc: từ Cơ bản tới mức tối thiểu doanh nghiệp yêu cầu cho phòng ban (chưa đặt thì theo chuẩn vị trí).</summary>
    public const string Path = "PATH";
    /// <summary>Học vượt: cao hơn mức yêu cầu, doanh nghiệp đã có khóa — định hướng riêng của nhân viên, được khuyến khích.</summary>
    public const string Optional = "OPTIONAL";
    /// <summary>Cao hơn mức yêu cầu và doanh nghiệp chưa mua khóa: chưa mở.</summary>
    public const string AboveCeiling = "ABOVE_CEILING";
    /// <summary>Không thuộc lộ trình (giữ cho client cũ; lộ trình hiện không tạo vùng này).</summary>
    public const string OutsidePath = "OUTSIDE_PATH";
}

/// <summary>Trạng thái bài đánh giá trước khi học của một khóa.</summary>
public static class PulsePreStatus
{
    /// <summary>Phải làm bài đánh giá trước khi học (đã đủ điều kiện).</summary>
    public const string Required = "REQUIRED";
    /// <summary>Chưa mở: khóa cấp trước chưa đạt, khóa ngoài phạm vi / ngoài lộ trình, hoặc chưa có vị trí.</summary>
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
    /// <summary>Không còn được tạo: bài đánh giá dùng thử chỉ để doanh nghiệp quyết định mua, không công nhận khóa.</summary>
    public const string PlacementTest = "PLACEMENT_TEST";
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
    /// <summary>Khóa có phí doanh nghiệp chưa mua.</summary>
    public const string PurchaseRequired = "PURCHASE_REQUIRED";
    public const string PreviousModuleRequired = "PREVIOUS_MODULE_REQUIRED";
    public const string SlidesNotViewed = "SLIDES_NOT_VIEWED";
    /// <summary>Lần làm trước chưa đạt: mở lại trang của câu chưa đúng rồi mới làm lần tiếp theo.</summary>
    public const string ReviewRequired = "REVIEW_REQUIRED";
    /// <summary>Câu trả lời gửi lên thuộc bộ câu hỏi của một lần làm khác (đã làm ở tab khác): tải lại để nhận câu mới.</summary>
    public const string QuizChanged = "QUIZ_CHANGED";
}

/// <summary>Trạng thái một lĩnh vực trên lộ trình (so mức đã xác nhận với mức tối thiểu doanh nghiệp yêu cầu).</summary>
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
    /// <summary>Cần học nhưng doanh nghiệp chưa mua khóa có phí.</summary>
    public const string PurchaseNeeded = "PURCHASE_NEEDED";
    /// <summary>Chưa mở: khóa cấp trước của lĩnh vực chưa đạt.</summary>
    public const string AfterPriorLevel = "AFTER_PRIOR_LEVEL";
    public const string AboveCeiling = "ABOVE_CEILING";
    public const string OutsidePath = "OUTSIDE_PATH";
    public const string NoPosition = "NO_POSITION";
}

public sealed record PulseCriterionDto(string Number, string Title, string Description)
{
    public int WeightPercent { get; init; }
    public bool IsRequired { get; init; }
}

public sealed record PulseAiHintDto(IReadOnlyList<bool> Checks, string Summary)
{
    public IReadOnlyList<string>? CriterionNotes { get; init; }
    public string Source { get; init; } = "KEYWORD_FALLBACK";
    public string? Model { get; init; }
    /// <summary>When this hint was made: now for a fresh review, the stored time for one reused from pulse_ai_reviews.</summary>
    public DateTimeOffset? ReviewedAt { get; init; }
    public PulseAiDetailDto? Detail { get; init; }
    public PulseAiFraudDto? Fraud { get; init; }
}

public sealed record PulseAiFraudDto
{
    public string Level { get; init; } = "LOW";
    public string Summary { get; init; } = "";
    public List<PulseAiFraudItemDto> Items { get; init; } = new();
}

public sealed record PulseAiFraudItemDto
{
    public string Time { get; init; } = "";
    public string Event { get; init; } = "";
    public string Note { get; init; } = "";
}

public sealed record PulseAiDetailDto
{
    public int PlagiarismScore { get; init; }
    public string PlagiarismNote { get; init; } = "";
    public int AiGeneratedScore { get; init; }
    public string AiGeneratedNote { get; init; } = "";
    public int RelevanceScore { get; init; }
    public string RelevanceNote { get; init; } = "";
    public int DepthScore { get; init; }
    public string DepthNote { get; init; } = "";
    public int ClarityScore { get; init; }
    public string ClarityNote { get; init; } = "";
    public string Verdict { get; init; } = "";
}
